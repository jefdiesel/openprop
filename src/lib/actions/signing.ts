"use server";

import { db } from "@/lib/db";
import { documents, recipients, documentEvents } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";
import type {
  Block,
  SignatureData,
  RecipientStatus,
  DocumentStatus,
  DocumentSettings,
} from "@/types/database";

export interface SigningDocument {
  id: string;
  title: string;
  content: Block[];
  status: DocumentStatus;
  settings: {
    allowDownload?: boolean;
    allowPrinting?: boolean;
    requireSigningOrder?: boolean;
    brandColor?: string;
    logoUrl?: string;
  } | null;
  recipient: {
    id: string;
    email: string;
    name: string | null;
    role: string;
    status: RecipientStatus;
    signingOrder: number;
  };
  requiresPayment: boolean;
  paymentAmount?: number;
  paymentCurrency?: string;
  paymentTiming?: "before_signature" | "after_signature";
}

export interface SigningResult {
  success: boolean;
  error?: string;
  documentId?: string;
}

/**
 * Fetch document by recipient access token
 * This is the main entry point for the public signing page
 */
export async function getDocumentByToken(token: string): Promise<{
  success: boolean;
  document?: SigningDocument;
  error?: string;
}> {
  try {
    // Find the recipient by access token
    const [recipientData] = await db.select()
      .from(recipients)
      .where(eq(recipients.accessToken, token))
      .limit(1);

    if (!recipientData) {
      return {
        success: false,
        error: "Invalid or expired access link",
      };
    }

    // Fetch the document
    const [documentData] = await db.select()
      .from(documents)
      .where(eq(documents.id, recipientData.documentId))
      .limit(1);

    if (!documentData) {
      return {
        success: false,
        error: "Document not found",
      };
    }

    // Check if document is expired
    if (documentData.expiresAt && new Date(documentData.expiresAt) < new Date()) {
      return {
        success: false,
        error: "This document has expired",
      };
    }

    // Check if document is in a valid state for signing
    if (documentData.status === "draft") {
      return {
        success: false,
        error: "This document has not been sent yet",
      };
    }

    // Check if signing order is required and if it's this recipient's turn
    const docSettings = documentData.settings as DocumentSettings | null;
    if (docSettings?.requireSigningOrder) {
      const allRecipients = await db.select()
        .from(recipients)
        .where(eq(recipients.documentId, documentData.id))
        .orderBy(asc(recipients.signingOrder));

      const pendingBefore = allRecipients.filter(
        (r) =>
          r.signingOrder < recipientData.signingOrder &&
          r.status !== "signed" &&
          r.role === "signer"
      );

      if (pendingBefore.length > 0) {
        return {
          success: false,
          error: "Waiting for other signers to complete first",
        };
      }
    }

    // Check for payment requirement
    // Payment can come from either:
    // 1. A payment block in the document content
    // 2. Payment settings configured when sending (stored in document.settings)
    let requiresPayment = false;
    let paymentAmount: number | undefined;
    let paymentCurrency: string | undefined;
    let paymentTiming: "before_signature" | "after_signature" | undefined;

    const content = documentData.content as Block[];

    // First check for payment block in content
    const paymentBlock = content?.find(
      (block) => block.type === "payment"
    );
    if (paymentBlock && paymentBlock.type === "payment") {
      requiresPayment = paymentBlock.required;
      paymentAmount = paymentBlock.amount;
      paymentCurrency = paymentBlock.currency;
      paymentTiming = paymentBlock.timing;
    }

    // Also check document settings for payment configuration (from SendDialog)
    const paymentSettings = docSettings as DocumentSettings & {
      enabled?: boolean;
      amount?: number;
      currency?: string;
      timing?: "before_signature" | "after_signature";
    } | null;

    if (paymentSettings?.enabled && paymentSettings?.amount) {
      requiresPayment = true;
      paymentAmount = paymentSettings.amount;
      paymentCurrency = paymentSettings.currency || "USD";
      paymentTiming = paymentSettings.timing;
    }

    return {
      success: true,
      document: {
        id: documentData.id,
        title: documentData.title,
        content: content,
        status: documentData.status,
        settings: docSettings,
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
        paymentTiming,
      },
    };
  } catch (error) {
    console.error("Error fetching document by token:", error);
    return {
      success: false,
      error: "An error occurred while loading the document",
    };
  }
}

/**
 * Record when a document is opened/viewed
 */
export async function recordDocumentView(
  token: string,
  userAgent?: string
): Promise<SigningResult> {
  try {
    // Find the recipient
    const [recipientData] = await db.select({
      id: recipients.id,
      documentId: recipients.documentId,
      status: recipients.status,
    })
      .from(recipients)
      .where(eq(recipients.accessToken, token))
      .limit(1);

    if (!recipientData) {
      return { success: false, error: "Invalid access link" };
    }

    const now = new Date();

    // Update recipient viewed_at if not already viewed
    if (recipientData.status === "pending") {
      await db.update(recipients)
        .set({
          status: "viewed",
          viewedAt: now,
          userAgent: userAgent || null,
        })
        .where(eq(recipients.id, recipientData.id));

      // Update document status if it's still in 'sent' state
      await db.update(documents)
        .set({ status: "viewed" })
        .where(and(
          eq(documents.id, recipientData.documentId),
          eq(documents.status, "sent")
        ));
    }

    // Record the view event
    await db.insert(documentEvents).values({
      documentId: recipientData.documentId,
      recipientId: recipientData.id,
      eventType: "document_viewed",
      eventData: {
        user_agent: userAgent,
        timestamp: now.toISOString(),
      },
    });

    return { success: true, documentId: recipientData.documentId };
  } catch (error) {
    console.error("Error recording document view:", error);
    return { success: false, error: "Failed to record view" };
  }
}

/**
 * Submit signature data
 */
export async function submitSignature(
  token: string,
  signatureData: SignatureData,
  updatedContent: Block[],
  ipAddress?: string
): Promise<SigningResult> {
  try {
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
      return { success: false, error: "Invalid access link" };
    }

    // Verify recipient is a signer
    if (recipientData.role !== "signer") {
      return { success: false, error: "You are not authorized to sign this document" };
    }

    const now = new Date();

    // Update recipient with signature
    await db.update(recipients)
      .set({
        status: "signed",
        signedAt: now,
        signatureData: signatureData as { type: 'drawn' | 'typed' | 'uploaded'; data: string; signedAt: string },
        ipAddress: ipAddress || null,
      })
      .where(eq(recipients.id, recipientData.id));

    // Update document content with signed blocks
    await db.update(documents)
      .set({
        content: updatedContent,
        updatedAt: now,
      })
      .where(eq(documents.id, recipientData.documentId));

    // Check if all signers have signed
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

    return { success: true, documentId: recipientData.documentId };
  } catch (error) {
    console.error("Error submitting signature:", error);
    return { success: false, error: "Failed to submit signature" };
  }
}

/**
 * Update pricing table selections (for optional items)
 */
export async function updatePricingSelections(
  token: string,
  pricingBlockId: string,
  selectedItems: string[]
): Promise<SigningResult> {
  try {
    // Find the recipient and document
    const [recipientData] = await db.select({
      id: recipients.id,
      documentId: recipients.documentId,
    })
      .from(recipients)
      .where(eq(recipients.accessToken, token))
      .limit(1);

    if (!recipientData) {
      return { success: false, error: "Invalid access link" };
    }

    // Get the document
    const [documentData] = await db.select({ content: documents.content })
      .from(documents)
      .where(eq(documents.id, recipientData.documentId))
      .limit(1);

    if (!documentData) {
      return { success: false, error: "Document not found" };
    }

    // Update the pricing block in content
    const content = documentData.content as Block[];
    const updatedContent = content.map((block) => {
      if (block.id === pricingBlockId && block.type === "pricing-table") {
        return {
          ...block,
          items: block.items.map((item) => ({
            ...item,
            isSelected: selectedItems.includes(item.id),
          })),
        };
      }
      return block;
    });

    // Save updated content
    await db.update(documents)
      .set({
        content: updatedContent,
        updatedAt: new Date(),
      })
      .where(eq(documents.id, recipientData.documentId));

    // Record event
    await db.insert(documentEvents).values({
      documentId: recipientData.documentId,
      recipientId: recipientData.id,
      eventType: "pricing_updated",
      eventData: {
        block_id: pricingBlockId,
        selected_items: selectedItems,
      },
    });

    return { success: true, documentId: recipientData.documentId };
  } catch (error) {
    console.error("Error updating pricing selections:", error);
    return { success: false, error: "Failed to update selections" };
  }
}

/**
 * Decline to sign a document
 */
export async function declineDocument(
  token: string,
  reason?: string
): Promise<SigningResult> {
  try {
    // Find the recipient
    const [recipientData] = await db.select({
      id: recipients.id,
      documentId: recipients.documentId,
    })
      .from(recipients)
      .where(eq(recipients.accessToken, token))
      .limit(1);

    if (!recipientData) {
      return { success: false, error: "Invalid access link" };
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

    return { success: true, documentId: recipientData.documentId };
  } catch (error) {
    console.error("Error declining document:", error);
    return { success: false, error: "Failed to decline document" };
  }
}
