import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { db } from '@/lib/db'
import { documents, recipients, documentEvents, users, profiles } from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { eq, and } from 'drizzle-orm'
import * as z from 'zod'
import { v4 as uuidv4 } from 'uuid'
import type { DocumentSettings } from '@/types/database'
import {
  generateDocumentInvitationEmail,
  generateDocumentInvitationSubject,
  generatePlainTextEmail,
} from '@/lib/email-templates'

const resend = new Resend(process.env.RESEND_API_KEY)

// Schema for recipient
const recipientSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required').max(255),
  role: z.enum(['signer', 'viewer', 'approver']).default('signer'),
  signing_order: z.number().int().min(1).default(1),
})

// Schema for sending a document
const sendDocumentSchema = z.object({
  recipients: z.array(recipientSchema).min(1, 'At least one recipient is required'),
  message: z.string().optional(),
  expires_in_days: z.number().int().min(1).max(365).optional(),
})

type RouteContext = {
  params: Promise<{ id: string }>
}

// Generate a secure access token
function generateAccessToken(): string {
  const uuid = uuidv4()
  const randomPart = Array.from({ length: 16 }, () =>
    Math.random().toString(36).charAt(2)
  ).join('')
  return `${uuid}-${randomPart}`
}

// POST /api/documents/[id]/send - Send document to recipients
export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = sendDocumentSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const { recipients: recipientList, message, expires_in_days } = validationResult.data

    // Check if document exists and belongs to user
    const [document] = await db.select()
      .from(documents)
      .where(and(eq(documents.id, id), eq(documents.userId, userId)))
      .limit(1)

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Check if document is in a sendable state
    if (document.status !== 'draft') {
      return NextResponse.json(
        { error: 'Document has already been sent' },
        { status: 400 }
      )
    }

    // Check if document is a template
    if (document.isTemplate) {
      return NextResponse.json(
        { error: 'Cannot send a template directly. Create a document from the template first.' },
        { status: 400 }
      )
    }

    // Calculate expiration date
    const docSettings = document.settings as DocumentSettings | null
    const expiresAt = expires_in_days
      ? new Date(Date.now() + expires_in_days * 24 * 60 * 60 * 1000)
      : docSettings?.expirationDays
        ? new Date(Date.now() + docSettings.expirationDays * 24 * 60 * 60 * 1000)
        : null

    // Create recipient records with access tokens
    const recipientRecords = recipientList.map((recipient) => ({
      documentId: id,
      email: recipient.email,
      name: recipient.name,
      role: recipient.role as 'signer' | 'viewer' | 'approver',
      signingOrder: recipient.signing_order,
      status: 'pending' as const,
      accessToken: generateAccessToken(),
    }))

    // Delete any existing recipients (in case of re-send)
    await db.delete(recipients).where(eq(recipients.documentId, id))

    // Insert new recipients
    const createdRecipients = await db.insert(recipients)
      .values(recipientRecords)
      .returning()

    // Update document status to sent
    const [updatedDocument] = await db.update(documents)
      .set({
        status: 'sent',
        sentAt: new Date(),
        expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(documents.id, id))
      .returning()

    // Create document event for sending
    await db.insert(documentEvents).values({
      documentId: id,
      eventType: 'document_sent',
      eventData: {
        recipients: recipientList.map((r) => ({ email: r.email, name: r.name, role: r.role })),
        message: message || null,
        expires_at: expiresAt?.toISOString() || null,
      },
    })

    // Generate signing URLs for each recipient
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.headers.get('origin') || ''
    const signingLinks = createdRecipients.map((recipient) => ({
      email: recipient.email,
      name: recipient.name,
      role: recipient.role,
      signingUrl: `${baseUrl}/sign/${recipient.accessToken}`,
    }))

    // Get sender info
    const [sender] = await db.select().from(users).where(eq(users.id, userId))
    const [senderProfile] = await db.select().from(profiles).where(eq(profiles.id, userId))
    const senderName = sender?.name || senderProfile?.companyName || 'Someone'

    // Send emails to each recipient
    const emailResults = await Promise.allSettled(
      signingLinks.map(async (link) => {
        const subject = generateDocumentInvitationSubject(senderName, updatedDocument.title)
        const htmlContent = generateDocumentInvitationEmail({
          recipientName: link.name || '',
          senderName,
          documentTitle: updatedDocument.title,
          message: message,
          documentLink: link.signingUrl,
          expiresAt: expiresAt || undefined,
        })
        const textContent = generatePlainTextEmail({
          recipientName: link.name || '',
          senderName,
          documentTitle: updatedDocument.title,
          message: message,
          documentLink: link.signingUrl,
          expiresAt: expiresAt || undefined,
        })

        const result = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'OpenProposal <noreply@resend.dev>',
          to: link.email,
          subject,
          html: htmlContent,
          text: textContent,
        })

        return { email: link.email, result }
      })
    )

    // Log any email failures (but don't fail the request)
    const failedEmails = emailResults.filter((r) => r.status === 'rejected')
    if (failedEmails.length > 0) {
      console.error('Some emails failed to send:', failedEmails)
    }

    // Transform document and recipients for response
    const transformedDoc = {
      id: updatedDocument.id,
      user_id: updatedDocument.userId,
      title: updatedDocument.title,
      status: updatedDocument.status,
      content: updatedDocument.content,
      variables: updatedDocument.variables,
      settings: updatedDocument.settings,
      is_template: updatedDocument.isTemplate,
      template_category: updatedDocument.templateCategory,
      created_at: updatedDocument.createdAt?.toISOString() || null,
      updated_at: updatedDocument.updatedAt?.toISOString() || null,
      sent_at: updatedDocument.sentAt?.toISOString() || null,
      expires_at: updatedDocument.expiresAt?.toISOString() || null,
    }

    const transformedRecipients = createdRecipients.map((r) => ({
      id: r.id,
      document_id: r.documentId,
      email: r.email,
      name: r.name,
      role: r.role,
      signing_order: r.signingOrder,
      status: r.status,
      access_token: r.accessToken,
      viewed_at: r.viewedAt?.toISOString() || null,
      signed_at: r.signedAt?.toISOString() || null,
      signature_data: r.signatureData,
      ip_address: r.ipAddress,
      user_agent: r.userAgent,
    }))

    return NextResponse.json({
      success: true,
      document: transformedDoc,
      recipients: transformedRecipients,
      signingLinks,
      message: 'Document sent successfully',
    })
  } catch (error) {
    console.error('Error in POST /api/documents/[id]/send:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
