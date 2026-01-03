import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { documents, recipients, documentEvents, payments, documentVersions } from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { eq, and, asc } from 'drizzle-orm'
import * as z from 'zod'
import type { Block } from '@/types/database'

// Schema for updating a document
const updateDocumentSchema = z.object({
  title: z.string().max(255).optional(), // Allow empty title during editing
  content: z.array(z.unknown()).optional(),
  status: z.enum(['draft', 'sent', 'viewed', 'completed', 'expired', 'declined']).optional(),
  is_template: z.boolean().optional(),
  template_category: z.string().nullable().optional(),
  variables: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).nullable().optional(),
  settings: z.object({
    allowDownload: z.boolean().optional(),
    allowPrinting: z.boolean().optional(),
    requireSigningOrder: z.boolean().optional(),
    expirationDays: z.number().optional(),
    reminderDays: z.array(z.number()).optional(),
    redirectUrl: z.string().optional(),
    brandColor: z.string().optional(),
    logoUrl: z.string().optional(),
  }).nullable().optional(),
  expires_at: z.string().nullable().optional(),
})

type RouteContext = {
  params: Promise<{ id: string }>
}

// Helper to transform document to API response format
function transformDocument(doc: typeof documents.$inferSelect) {
  return {
    id: doc.id,
    user_id: doc.userId,
    title: doc.title,
    status: doc.status,
    content: doc.content,
    variables: doc.variables,
    settings: doc.settings,
    is_template: doc.isTemplate,
    template_category: doc.templateCategory,
    created_at: doc.createdAt?.toISOString() || null,
    updated_at: doc.updatedAt?.toISOString() || null,
    sent_at: doc.sentAt?.toISOString() || null,
    expires_at: doc.expiresAt?.toISOString() || null,
    locked_at: doc.lockedAt?.toISOString() || null,
    current_version: doc.currentVersion || 1,
  }
}

// Helper to transform recipient to API response format
function transformRecipient(r: typeof recipients.$inferSelect) {
  return {
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
  }
}

// GET /api/documents/[id] - Get a single document
export async function GET(
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

    // Fetch document
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

    // Optionally fetch recipients
    const { searchParams } = new URL(request.url)
    const includeRecipients = searchParams.get('include_recipients') === 'true'

    let recipientsList = null
    if (includeRecipients) {
      const recipientsData = await db.select()
        .from(recipients)
        .where(eq(recipients.documentId, id))
        .orderBy(asc(recipients.signingOrder))

      recipientsList = recipientsData.map(transformRecipient)
    }

    return NextResponse.json({
      document: transformDocument(document),
      ...(recipientsList && { recipients: recipientsList }),
    })
  } catch (error) {
    console.error('Error in GET /api/documents/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/documents/[id] - Update a document
export async function PUT(
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
    console.log('PUT /api/documents/[id] body keys:', Object.keys(body))
    const validationResult = updateDocumentSchema.safeParse(body)

    if (!validationResult.success) {
      console.error('Validation error:', JSON.stringify(validationResult.error.flatten(), null, 2))
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    // Check if document exists and belongs to user
    const [existingDoc] = await db.select({
      id: documents.id,
      status: documents.status,
      lockedAt: documents.lockedAt,
      currentVersion: documents.currentVersion,
      title: documents.title,
      content: documents.content,
      variables: documents.variables,
    })
      .from(documents)
      .where(and(eq(documents.id, id), eq(documents.userId, userId)))
      .limit(1)

    if (!existingDoc) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Don't allow editing locked documents (someone has already signed)
    if (existingDoc.lockedAt) {
      return NextResponse.json(
        { error: 'Cannot edit a document after it has been signed' },
        { status: 400 }
      )
    }

    // Don't allow editing completed or declined documents
    if (existingDoc.status === 'completed' || existingDoc.status === 'declined') {
      return NextResponse.json(
        { error: 'Cannot edit a completed or declined document' },
        { status: 400 }
      )
    }

    // Track if this is a sent document being edited (for version history)
    const isSentDocument = existingDoc.status === 'sent' || existingDoc.status === 'viewed'

    // Build update data
    const validated = validationResult.data
    const updateData: Partial<typeof documents.$inferInsert> = {
      updatedAt: new Date(),
    }

    if (validated.title !== undefined) updateData.title = validated.title
    if (validated.content !== undefined) updateData.content = validated.content as Block[]
    if (validated.status !== undefined) updateData.status = validated.status
    if (validated.is_template !== undefined) updateData.isTemplate = validated.is_template
    if (validated.template_category !== undefined) updateData.templateCategory = validated.template_category
    if (validated.variables !== undefined) updateData.variables = validated.variables as Record<string, unknown> | null
    if (validated.settings !== undefined) updateData.settings = validated.settings as Record<string, unknown> | null
    if (validated.expires_at !== undefined) updateData.expiresAt = validated.expires_at ? new Date(validated.expires_at) : null

    // If editing a sent document, create a version snapshot first
    if (isSentDocument && (validated.content !== undefined || validated.title !== undefined)) {
      const newVersion = (existingDoc.currentVersion || 1) + 1

      // Save current state as a version before updating
      await db.insert(documentVersions).values({
        documentId: id,
        versionNumber: existingDoc.currentVersion || 1,
        title: existingDoc.title,
        content: existingDoc.content as unknown[],
        variables: existingDoc.variables as Record<string, unknown> | undefined,
        changeType: 'edited',
        changeDescription: 'Document edited after sending',
        createdBy: userId,
      })

      // Update version number
      updateData.currentVersion = newVersion

      // Record edit event
      await db.insert(documentEvents).values({
        documentId: id,
        eventType: 'document_edited',
        eventData: {
          previous_version: existingDoc.currentVersion || 1,
          new_version: newVersion,
          edited_at: new Date().toISOString(),
        },
      })

      // Regenerate access tokens for recipients (invalidates old links)
      const existingRecipients = await db.select()
        .from(recipients)
        .where(eq(recipients.documentId, id))

      for (const recipient of existingRecipients) {
        const newToken = crypto.randomUUID()
        await db.update(recipients)
          .set({
            accessToken: newToken,
            status: 'pending', // Reset to pending since doc changed
            viewedAt: null,
          })
          .where(eq(recipients.id, recipient.id))
      }
    }

    // Update document
    const [document] = await db.update(documents)
      .set(updateData)
      .where(and(eq(documents.id, id), eq(documents.userId, userId)))
      .returning()

    if (!document) {
      return NextResponse.json(
        { error: 'Failed to update document' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      document: transformDocument(document),
      wasEdited: isSentDocument,
      newVersion: isSentDocument ? document.currentVersion : undefined,
    })
  } catch (error) {
    console.error('Error in PUT /api/documents/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/documents/[id] - Delete a document
export async function DELETE(
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

    // Check if document exists and belongs to user
    const [existingDoc] = await db.select({ id: documents.id })
      .from(documents)
      .where(and(eq(documents.id, id), eq(documents.userId, userId)))
      .limit(1)

    if (!existingDoc) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Delete associated recipients first (cascade should handle this, but being explicit)
    await db.delete(recipients).where(eq(recipients.documentId, id))

    // Delete associated events
    await db.delete(documentEvents).where(eq(documentEvents.documentId, id))

    // Delete associated payments
    await db.delete(payments).where(eq(payments.documentId, id))

    // Delete document
    await db.delete(documents)
      .where(and(eq(documents.id, id), eq(documents.userId, userId)))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/documents/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
