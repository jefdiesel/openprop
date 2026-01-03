"use server"

import { v4 as uuidv4 } from "uuid"
import { z } from "zod"
import { Resend } from "resend"
import { db } from "@/lib/db"
import { documents, recipients as recipientsTable, documentEvents } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import {
  generateDocumentInvitationEmail,
  generateDocumentInvitationSubject,
  generatePlainTextEmail,
} from "./email-templates"

const resend = new Resend(process.env.RESEND_API_KEY)

// Validation schemas
const recipientRoleSchema = z.enum(["signer", "viewer", "approver"])

const recipientSchema = z.object({
  id: z.string(),
  email: z.string().email("Invalid email address"),
  name: z.string().optional().default(""),
  role: recipientRoleSchema,
})

const sendDocumentSchema = z.object({
  documentId: z.string().min(1, "Document ID is required"),
  documentTitle: z.string().min(1, "Document title is required"),
  recipients: z
    .array(recipientSchema)
    .min(1, "At least one recipient is required"),
  signingOrder: z.enum(["sequential", "parallel"]),
  emailSubject: z.string().optional(),
  emailMessage: z.string().optional(),
  expiresAt: z.string().datetime().optional().nullable(),
  passwordProtected: z.boolean().default(false),
  senderName: z.string().optional().default(""),
  senderEmail: z.string().email().optional(),
  // Payment collection settings
  paymentEnabled: z.boolean().default(false),
  paymentTiming: z.enum(["before_signature", "after_signature"]).optional(),
  paymentAmount: z.number().optional(),
  paymentCurrency: z.string().optional(),
})

export type SendDocumentInput = z.infer<typeof sendDocumentSchema>

export interface RecipientRecord {
  id: string
  documentId: string
  email: string
  name: string
  role: "signer" | "viewer" | "approver"
  accessToken: string
  order: number
  status: "pending" | "viewed" | "signed" | "approved" | "declined"
  sentAt: Date
  viewedAt: Date | null
  completedAt: Date | null
  expiresAt: Date | null
}

export interface SendDocumentResult {
  success: boolean
  documentId: string
  recipientRecords: RecipientRecord[]
  error?: string
}

function generateAccessToken(): string {
  return uuidv4().replace(/-/g, "") + uuidv4().replace(/-/g, "")
}

export async function sendDocument(
  input: SendDocumentInput
): Promise<SendDocumentResult> {
  try {
    // Validate input
    const validatedInput = sendDocumentSchema.parse(input)

    const {
      documentId,
      documentTitle,
      recipients,
      signingOrder,
      emailSubject,
      emailMessage,
      expiresAt,
      senderName,
      paymentEnabled,
      paymentTiming,
      paymentAmount,
      paymentCurrency,
    } = validatedInput

    const parsedExpiresAt = expiresAt ? new Date(expiresAt) : null

    // Generate recipient records with access tokens
    const recipientRecords: RecipientRecord[] = recipients.map(
      (recipient, index) => ({
        id: uuidv4(),
        documentId,
        email: recipient.email,
        name: recipient.name || "",
        role: recipient.role,
        accessToken: generateAccessToken(),
        order: signingOrder === "sequential" ? index + 1 : 1,
        status: "pending" as const,
        sentAt: new Date(),
        viewedAt: null,
        completedAt: null,
        expiresAt: parsedExpiresAt,
      })
    )

    // Delete any existing recipients for this document
    await db.delete(recipientsTable).where(eq(recipientsTable.documentId, documentId))

    // Save recipient records to database
    const dbRecipients = recipientRecords.map((r) => ({
      documentId: r.documentId,
      email: r.email,
      name: r.name,
      role: r.role as "signer" | "viewer" | "approver",
      signingOrder: r.order,
      status: "pending" as const,
      accessToken: r.accessToken,
    }))

    await db.insert(recipientsTable).values(dbRecipients)

    // Build payment settings if enabled
    const paymentSettings = paymentEnabled
      ? {
          enabled: true,
          timing: paymentTiming,
          amount: paymentAmount,
          currency: paymentCurrency || "USD",
        }
      : { enabled: false }

    // Update document status to 'sent' with payment settings
    await db
      .update(documents)
      .set({
        status: "sent",
        sentAt: new Date(),
        expiresAt: parsedExpiresAt,
        updatedAt: new Date(),
        settings: paymentSettings,
      })
      .where(eq(documents.id, documentId))

    // Create document event
    await db.insert(documentEvents).values({
      documentId,
      eventType: "document_sent",
      eventData: {
        recipients: recipientRecords.map((r) => ({ email: r.email, name: r.name, role: r.role })),
        expiresAt: parsedExpiresAt?.toISOString() || null,
      },
    })

    // Generate and send emails to each recipient
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    for (const record of recipientRecords) {
      const documentLink = `${baseUrl}/sign/${record.accessToken}`

      const subject =
        emailSubject ||
        generateDocumentInvitationSubject(senderName, documentTitle)

      const htmlContent = generateDocumentInvitationEmail({
        recipientName: record.name,
        senderName,
        documentTitle,
        message: emailMessage,
        documentLink,
        expiresAt: parsedExpiresAt || undefined,
        paymentEnabled,
        paymentAmount,
        paymentCurrency,
        paymentTiming,
      })

      const textContent = generatePlainTextEmail({
        recipientName: record.name,
        senderName,
        documentTitle,
        message: emailMessage,
        documentLink,
        expiresAt: parsedExpiresAt || undefined,
        paymentEnabled,
        paymentAmount,
        paymentCurrency,
        paymentTiming,
      })

      // Send email via Resend
      try {
        const emailResult = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || "OpenProposal <onboarding@resend.dev>",
          to: record.email,
          subject,
          html: htmlContent,
          text: textContent,
        })
        console.log(`Resend response for ${record.email}:`, JSON.stringify(emailResult))
        if (emailResult.error) {
          console.error(`Resend error for ${record.email}:`, emailResult.error)
        }
      } catch (emailError) {
        console.error(`Failed to send email to ${record.email}:`, emailError)
        // Continue sending to other recipients even if one fails
      }
    }

    return {
      success: true,
      documentId,
      recipientRecords,
    }
  } catch (error) {
    console.error("Error sending document:", error)

    if (error instanceof z.ZodError) {
      const issues = error.issues
      const firstError = issues[0]
      return {
        success: false,
        documentId: input.documentId,
        recipientRecords: [],
        error: `Validation error: ${firstError.path.join(".")} - ${firstError.message}`,
      }
    }

    return {
      success: false,
      documentId: input.documentId,
      recipientRecords: [],
      error: error instanceof Error ? error.message : "Failed to send document",
    }
  }
}

// Helper function to validate a single email
export async function validateRecipientEmail(
  email: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    z.string().email().parse(email)
    return { valid: true }
  } catch {
    return { valid: false, error: "Invalid email address" }
  }
}

// Helper to check if document can be sent (e.g., has required fields)
export async function canSendDocument(
  documentId: string
): Promise<{ canSend: boolean; errors: string[] }> {
  const errors: string[] = []

  // TODO: Fetch document from database and validate
  // const document = await db.query.documents.findFirst({
  //   where: eq(documents.id, documentId),
  // })

  // if (!document) {
  //   errors.push("Document not found")
  //   return { canSend: false, errors }
  // }

  // if (document.status === 'sent') {
  //   errors.push("Document has already been sent")
  // }

  // if (!document.blocks || document.blocks.length === 0) {
  //   errors.push("Document has no content")
  // }

  // For now, just return true
  return { canSend: errors.length === 0, errors }
}

// Helper to resend document to a specific recipient
export async function resendToRecipient(
  documentId: string,
  recipientId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // TODO: Implement resend logic
    // 1. Fetch recipient record
    // 2. Generate new access token if needed
    // 3. Resend email

    console.log(`Resending document ${documentId} to recipient ${recipientId}`)

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to resend",
    }
  }
}
