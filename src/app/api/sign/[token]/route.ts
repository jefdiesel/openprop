import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { db } from "@/lib/db";
import { documents, recipients, documentEvents, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  generateSigningConfirmationEmail,
  generateSigningConfirmationSubject,
  generateSigningConfirmationPlainText,
  generateViewNotificationEmail,
  generateViewNotificationSubject,
  generateViewNotificationPlainText,
  generateEthscriptionReceiptEmail,
  generateEthscriptionReceiptSubject,
  generateEthscriptionReceiptPlainText,
} from "@/lib/email-templates";
import {
  isBlockchainConfigured,
  hashDocumentData,
  hashContent,
  hashEmail,
  inscribeHash,
  getChainInfo,
  inscribeDataToAddress,
  type DocumentHashData,
  type EthscriptionNetwork,
} from "@/lib/blockchain";
import { payments } from "@/lib/db/schema";
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

      // Send view notification email to document owner (async, don't block)
      sendViewNotificationEmail(
        documentData.userId,
        recipientData.name || "",
        recipientData.email,
        documentData.title,
        documentData.id,
        now
      ).catch((err) => {
        console.error("Failed to send view notification email:", err);
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
      // Handle both flat and nested block structures
      const blockData = (paymentBlock as unknown as { data?: Record<string, unknown> }).data;
      const flatBlock = paymentBlock as unknown as Record<string, unknown>;

      requiresPayment = (blockData?.required ?? flatBlock.required) as boolean;
      paymentAmount = (blockData?.amount ?? flatBlock.amount) as number | undefined;
      paymentCurrency = (blockData?.currency ?? flatBlock.currency) as string | undefined;
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

    // Update recipient with signature (signatureData may be null if no required signatures)
    await db.update(recipients)
      .set({
        status: "signed",
        signedAt: now,
        signatureData: signatureData ? signatureData as { type: 'drawn' | 'typed' | 'uploaded'; data: string; signedAt: string } : null,
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

      // Trigger blockchain verification asynchronously (don't await)
      triggerBlockchainVerification(recipientData.documentId, now).catch((err) => {
        console.error("Failed to trigger blockchain verification:", err);
      });

      // Trigger ethscriptions for data-uri blocks asynchronously
      triggerEthscriptions(recipientData.documentId, updatedContent || []).catch((err) => {
        console.error("Failed to trigger ethscriptions:", err);
      });
    }

    // Record signing event
    await db.insert(documentEvents).values({
      documentId: recipientData.documentId,
      recipientId: recipientData.id,
      eventType: "document_signed",
      eventData: {
        signature_type: signatureData?.type || "none",
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
          from: process.env.RESEND_FROM_EMAIL || "SendProp <noreply@sendprop.com>",
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

/**
 * Trigger blockchain inscription for a completed document
 * This runs asynchronously and doesn't block the signing response
 */
async function triggerBlockchainVerification(documentId: string, completedAt: Date) {
  if (!isBlockchainConfigured()) {
    console.log("Blockchain inscription skipped - not configured");
    return;
  }

  try {
    const [document] = await db.select()
      .from(documents)
      .where(eq(documents.id, documentId))
      .limit(1);

    if (!document || document.blockchainTxHash) {
      return;
    }

    // Get signers
    const signersList = await db.select()
      .from(recipients)
      .where(eq(recipients.documentId, documentId));

    const signers = signersList.filter(r => r.role === "signer" && r.signedAt);

    // Check for payment
    const [payment] = await db.select()
      .from(payments)
      .where(eq(payments.documentId, documentId))
      .limit(1);

    // Create hash data (privacy-first)
    const hashData: DocumentHashData = {
      documentId: document.id,
      contentHash: hashContent(document.content as unknown[]),
      signers: signers.map(r => ({
        emailHash: hashEmail(r.email),
        signedAt: r.signedAt!.toISOString(),
      })),
      paymentCollected: payment?.status === "succeeded",
      completedAt: completedAt.toISOString(),
    };

    const documentHash = hashDocumentData(hashData);

    // Inscribe on Base
    const result = await inscribeHash(documentHash);

    if (result.success && result.txHash) {
      await db.update(documents)
        .set({
          blockchainTxHash: result.txHash,
          blockchainVerifiedAt: completedAt,
          updatedAt: new Date(),
        })
        .where(eq(documents.id, documentId));

      await db.insert(documentEvents).values({
        documentId,
        eventType: "blockchain_verified",
        eventData: {
          txHash: result.txHash,
          documentHash,
          chainId: getChainInfo().chainId,
          auto_triggered: true,
        },
      });

      console.log(`Document ${documentId} inscribed on Base: ${result.txHash}`);
    } else {
      console.error(`Failed to inscribe document ${documentId}:`, result.error);
    }
  } catch (error) {
    console.error(`Blockchain inscription error for ${documentId}:`, error);
  }
}

/**
 * Trigger ethscriptions for data-uri blocks in a completed document
 * Sends the base64 payload to the recipient's EVM address on the selected network
 */
async function triggerEthscriptions(documentId: string, content: Block[]) {
  if (!isBlockchainConfigured()) {
    console.log("Ethscriptions skipped - blockchain not configured");
    return;
  }

  // Find all data-uri blocks with recipient addresses
  const dataUriBlocks = content.filter(
    (block): block is Block & { type: "data-uri" } =>
      block.type === "data-uri"
  );

  for (const block of dataUriBlocks) {
    // Handle both nested and flat block structures
    const blockData = (block as unknown as { data?: Record<string, unknown> }).data;
    const flatBlock = block as unknown as Record<string, unknown>;

    const payload = (blockData?.payload ?? flatBlock.payload) as string;
    const recipientAddress = (blockData?.recipientAddress ?? flatBlock.recipientAddress) as string;
    const network = (blockData?.network ?? flatBlock.network ?? "base") as EthscriptionNetwork;
    const blockId = block.id;

    // Skip if no payload or recipient address
    if (!payload || !recipientAddress) {
      console.log(`Skipping data-uri block ${blockId} - missing payload or recipient`);
      continue;
    }

    // Validate EVM address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(recipientAddress)) {
      console.error(`Invalid recipient address for block ${blockId}: ${recipientAddress}`);
      continue;
    }

    try {
      console.log(`Inscribing data to ${recipientAddress} on ${network} for block ${blockId}`);

      const result = await inscribeDataToAddress(
        payload,
        recipientAddress as `0x${string}`,
        network
      );

      if (result.success && result.txHash) {
        // Update the document content with the inscription result
        const [doc] = await db.select({ content: documents.content })
          .from(documents)
          .where(eq(documents.id, documentId))
          .limit(1);

        if (doc) {
          const updatedContent = (doc.content as Block[]).map((b) => {
            if (b.id === blockId) {
              // Update with inscription result
              const bData = (b as unknown as { data?: Record<string, unknown> }).data;
              if (bData) {
                return {
                  ...b,
                  data: {
                    ...bData,
                    inscriptionTxHash: result.txHash,
                    inscriptionStatus: "inscribed",
                  },
                };
              } else {
                return {
                  ...b,
                  inscriptionTxHash: result.txHash,
                  inscriptionStatus: "inscribed",
                };
              }
            }
            return b;
          });

          await db.update(documents)
            .set({
              content: updatedContent,
              updatedAt: new Date(),
            })
            .where(eq(documents.id, documentId));
        }

        // Record ethscription event
        await db.insert(documentEvents).values({
          documentId,
          eventType: "ethscription_completed",
          eventData: {
            blockId,
            txHash: result.txHash,
            network,
            recipientAddress,
            explorerUrl: result.explorerUrl,
          },
        });

        console.log(`Ethscription completed for block ${blockId}: ${result.txHash}`);

        // Send receipt email to the signer
        try {
          // Get document and recipient info for email
          const [fullDoc] = await db.select()
            .from(documents)
            .where(eq(documents.id, documentId))
            .limit(1);

          const signerRecipients = await db.select()
            .from(recipients)
            .where(eq(recipients.documentId, documentId));

          // Find the signer who provided this address (or use first signer)
          const signer = signerRecipients.find(r => r.role === "signer" && r.status === "signed")
            || signerRecipients[0];

          if (signer && fullDoc && result.explorerUrl) {
            const networkLabel = {
              ethereum: "Ethereum",
              base: "Base",
              arbitrum: "Arbitrum",
              optimism: "Optimism",
              polygon: "Polygon",
            }[network] || network;

            const subject = generateEthscriptionReceiptSubject(networkLabel);
            const html = generateEthscriptionReceiptEmail({
              recipientName: signer.name || "",
              recipientAddress,
              documentTitle: fullDoc.title,
              network: networkLabel,
              txHash: result.txHash,
              explorerUrl: result.explorerUrl,
            });
            const text = generateEthscriptionReceiptPlainText({
              recipientName: signer.name || "",
              recipientAddress,
              documentTitle: fullDoc.title,
              network: networkLabel,
              txHash: result.txHash,
              explorerUrl: result.explorerUrl,
            });

            await resend.emails.send({
              from: process.env.RESEND_FROM_EMAIL || "SendProp <noreply@sendprop.com>",
              to: signer.email,
              subject,
              html,
              text,
            });

            console.log(`Ethscription receipt email sent to ${signer.email}`);
          }
        } catch (emailError) {
          console.error("Failed to send ethscription receipt email:", emailError);
        }
      } else {
        console.error(`Ethscription failed for block ${blockId}:`, result.error);

        // Record failure event
        await db.insert(documentEvents).values({
          documentId,
          eventType: "ethscription_failed",
          eventData: {
            blockId,
            network,
            recipientAddress,
            error: result.error,
          },
        });
      }
    } catch (error) {
      console.error(`Ethscription error for block ${blockId}:`, error);
    }
  }
}

/**
 * Send view notification email to document owner
 */
async function sendViewNotificationEmail(
  ownerId: string,
  recipientName: string,
  recipientEmail: string,
  documentTitle: string,
  documentId: string,
  viewedAt: Date
) {
  try {
    // Get owner's info
    const [owner] = await db.select({
      email: users.email,
      name: users.name,
    })
      .from(users)
      .where(eq(users.id, ownerId))
      .limit(1);

    if (!owner || !owner.email) {
      console.log("No owner email found, skipping view notification");
      return;
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const documentLink = `${appUrl}/documents/${documentId}`;

    const subject = generateViewNotificationSubject(recipientName || recipientEmail, documentTitle);
    const html = generateViewNotificationEmail({
      ownerName: owner.name || "",
      recipientName,
      recipientEmail,
      documentTitle,
      viewedAt,
      documentLink,
    });
    const text = generateViewNotificationPlainText({
      ownerName: owner.name || "",
      recipientName,
      recipientEmail,
      documentTitle,
      viewedAt,
      documentLink,
    });

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "SendProp <noreply@sendprop.com>",
      to: owner.email,
      subject,
      html,
      text,
    });

    console.log(`View notification sent to ${owner.email} for document ${documentId}`);
  } catch (error) {
    console.error("Error sending view notification email:", error);
    throw error;
  }
}
