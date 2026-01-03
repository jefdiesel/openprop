import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { db } from "@/lib/db";
import { documents, recipients, documentEvents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  generateSigningConfirmationEmail,
  generateSigningConfirmationSubject,
  generateSigningConfirmationPlainText,
} from "@/lib/email-templates";
import type {
  Block,
  Document,
  Recipient,
  SignatureData,
} from "@/types/database";

const resend = new Resend(process.env.RESEND_API_KEY);

// GET: Fetch document by token and record view event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Find the recipient by access token
    const [recipientData] = await db.select()
      .from(recipients)
      .where(eq(recipients.accessToken, token))
      .limit(1);

    if (!recipientData) {
      return NextResponse.json(
        { error: "Invalid or expired access link" },
        { status: 404 }
      );
    }

    // Fetch the document
    const [documentData] = await db.select()
      .from(documents)
      .where(eq(documents.id, recipientData.documentId))
      .limit(1);

    if (!documentData) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Check if document is expired
    if (documentData.expiresAt && new Date(documentData.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: "This document has expired" },
        { status: 410 }
      );
    }

    // Check document status
    if (documentData.status === "draft") {
      return NextResponse.json(
        { error: "This document has not been sent yet" },
        { status: 403 }
      );
    }

    const now = new Date();
    const userAgent = request.headers.get("user-agent") || undefined;

    // Record view if not already viewed
    if (recipientData.status === "pending") {
      await db.update(recipients)
        .set({
          status: "viewed",
          viewedAt: now,
          userAgent: userAgent || null,
        })
        .where(eq(recipients.id, recipientData.id));

      // Update document status if it was 'sent'
      if (documentData.status === "sent") {
        await db.update(documents)
          .set({ status: "viewed" })
          .where(eq(documents.id, recipientData.documentId));
      }

      // Record view event
      await db.insert(documentEvents).values({
        documentId: recipientData.documentId,
        recipientId: recipientData.id,
        eventType: "document_viewed",
        eventData: {
          user_agent: userAgent,
          timestamp: now.toISOString(),
        },
      });
    }

    // Check for payment requirement
    let requiresPayment = false;
    let paymentAmount: number | undefined;
    let paymentCurrency: string | undefined;

    const content = documentData.content as Block[];
    const paymentBlock = content?.find(
      (block) => block.type === "payment"
    );
    if (paymentBlock && paymentBlock.type === "payment") {
      requiresPayment = paymentBlock.required;
      paymentAmount = paymentBlock.amount;
      paymentCurrency = paymentBlock.currency;
    }

    return NextResponse.json({
      document: {
        id: documentData.id,
        title: documentData.title,
        content: documentData.content,
        status: documentData.status,
        settings: documentData.settings,
      },
      recipient: {
        id: recipientData.id,
        email: recipientData.email,
        name: recipientData.name,
        role: recipientData.role,
        status: recipientData.status,
        signingOrder: recipientData.signingOrder,
      },
      requiresPayment,
      paymentAmount,
      paymentCurrency,
    });
  } catch (error) {
    console.error("Error fetching document:", error);
    return NextResponse.json(
      { error: "An error occurred while loading the document" },
      { status: 500 }
    );
  }
}

// POST: Submit signature or decline
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await request.json();
    const { signatureData, updatedContent, action, reason } = body as {
      signatureData?: SignatureData;
      updatedContent?: Block[];
      action?: "sign" | "decline";
      reason?: string;
    };

    // Handle decline action
    if (action === "decline") {
      const [recipientData] = await db.select({
        id: recipients.id,
        documentId: recipients.documentId,
      })
        .from(recipients)
        .where(eq(recipients.accessToken, token))
        .limit(1);

      if (!recipientData) {
        return NextResponse.json(
          { error: "Invalid access link" },
          { status: 404 }
        );
      }

      const now = new Date();

      // Update recipient status
      await db.update(recipients)
        .set({ status: "declined" })
        .where(eq(recipients.id, recipientData.id));

      // Update document status
      await db.update(documents)
        .set({ status: "declined" })
        .where(eq(documents.id, recipientData.documentId));

      // Record event
      await db.insert(documentEvents).values({
        documentId: recipientData.documentId,
        recipientId: recipientData.id,
        eventType: "document_declined",
        eventData: {
          reason,
          declined_at: now.toISOString(),
        },
      });

      return NextResponse.json({
        success: true,
        documentId: recipientData.documentId,
      });
    }

    // Handle sign action - require signature data
    if (!signatureData) {
      return NextResponse.json(
        { error: "Signature data is required" },
        { status: 400 }
      );
    }

    // Find the recipient
    const [recipientData] = await db.select({
      id: recipients.id,
      documentId: recipients.documentId,
      role: recipients.role,
    })
      .from(recipients)
      .where(eq(recipients.accessToken, token))
      .limit(1);

    if (!recipientData) {
      return NextResponse.json(
        { error: "Invalid access link" },
        { status: 404 }
      );
    }

    // Verify recipient is a signer
    if (recipientData.role !== "signer") {
      return NextResponse.json(
        { error: "You are not authorized to sign this document" },
        { status: 403 }
      );
    }

    const now = new Date();

    // Get IP address from headers
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ipAddress = forwardedFor ? forwardedFor.split(",")[0].trim() : null;

    // Check if this is the first signature (to lock the document)
    const existingSignatures = await db.select({
      id: recipients.id,
      status: recipients.status,
      role: recipients.role,
    })
      .from(recipients)
      .where(eq(recipients.documentId, recipientData.documentId));

    const isFirstSignature = !existingSignatures.some(
      (r) => r.role === "signer" && r.status === "signed" && r.id !== recipientData.id
    );

    // Update recipient with signature
    await db.update(recipients)
      .set({
        status: "signed",
        signedAt: now,
        signatureData: signatureData as { type: 'drawn' | 'typed' | 'uploaded'; data: string; signedAt: string },
        ipAddress,
      })
      .where(eq(recipients.id, recipientData.id));

    // Update document content if provided
    if (updatedContent) {
      await db.update(documents)
        .set({
          content: updatedContent,
          updatedAt: now,
        })
        .where(eq(documents.id, recipientData.documentId));
    }

    // Lock document on first signature (prevents further editing)
    if (isFirstSignature) {
      await db.update(documents)
        .set({
          lockedAt: now,
          lockedBy: recipientData.id,
        })
        .where(eq(documents.id, recipientData.documentId));

      // Record lock event
      await db.insert(documentEvents).values({
        documentId: recipientData.documentId,
        recipientId: recipientData.id,
        eventType: "document_locked",
        eventData: {
          locked_at: now.toISOString(),
          locked_by_recipient_id: recipientData.id,
          reason: "first_signature",
        },
      });
    }

    // Check if all signers have signed (re-fetch after our update)
    const allRecipientsData = await db.select({
      status: recipients.status,
      role: recipients.role,
    })
      .from(recipients)
      .where(eq(recipients.documentId, recipientData.documentId));

    const allSignersSigned = allRecipientsData
      .filter((r) => r.role === "signer")
      .every((r) => r.status === "signed");

    // Update document status to completed if all have signed
    if (allSignersSigned) {
      await db.update(documents)
        .set({ status: "completed" })
        .where(eq(documents.id, recipientData.documentId));
    }

    // Record signing event
    await db.insert(documentEvents).values({
      documentId: recipientData.documentId,
      recipientId: recipientData.id,
      eventType: "document_signed",
      eventData: {
        signature_type: signatureData.type,
        signed_at: now.toISOString(),
        ip_address: ipAddress,
        all_signed: allSignersSigned,
      },
    });

    // Send confirmation email to the signer
    try {
      // Get full recipient and document data for email
      const [fullRecipient] = await db.select()
        .from(recipients)
        .where(eq(recipients.id, recipientData.id))
        .limit(1);

      const [fullDocument] = await db.select()
        .from(documents)
        .where(eq(documents.id, recipientData.documentId))
        .limit(1);

      if (fullRecipient && fullDocument) {
        const subject = generateSigningConfirmationSubject(fullDocument.title);
        const html = generateSigningConfirmationEmail({
          recipientName: fullRecipient.name || "",
          documentTitle: fullDocument.title,
          signedAt: now,
        });
        const text = generateSigningConfirmationPlainText({
          recipientName: fullRecipient.name || "",
          documentTitle: fullDocument.title,
          signedAt: now,
        });

        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || "OpenProposal <onboarding@resend.dev>",
          to: fullRecipient.email,
          subject,
          html,
          text,
        });
      }
    } catch (emailError) {
      // Log but don't fail the signing if email fails
      console.error("Failed to send signing confirmation email:", emailError);
    }

    return NextResponse.json({
      success: true,
      documentId: recipientData.documentId,
      allSigned: allSignersSigned,
      signedAt: now.toISOString(),
    });
  } catch (error) {
    console.error("Error submitting signature:", error);
    return NextResponse.json(
      { error: "Failed to submit signature" },
      { status: 500 }
    );
  }
}
