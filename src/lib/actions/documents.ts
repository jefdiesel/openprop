'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { documents, recipients, documentEvents, payments } from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { eq, and } from 'drizzle-orm'
import * as z from 'zod'
import { v4 as uuidv4 } from 'uuid'
import type { Block, DocumentSettings } from '@/types/database'

// Validation schemas
const createDocumentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  content: z.array(z.unknown()).default([]),
  is_template: z.boolean().default(false),
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
})

const updateDocumentSchema = z.object({
  title: z.string().min(1).max(255).optional(),
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

// Response types
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; details?: unknown }

// Create document
export async function createDocument(input: {
  title: string
  content?: Block[]
  is_template?: boolean
  template_category?: string | null
  variables?: Record<string, unknown> | null
  settings?: DocumentSettings | null
}): Promise<ActionResult<{ id: string; title: string }>> {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return { success: false, error: 'Unauthorized' }
    }

    // Validate input
    const validationResult = createDocumentSchema.safeParse(input)
    if (!validationResult.success) {
      return {
        success: false,
        error: 'Validation failed',
        details: validationResult.error.flatten(),
      }
    }

    const { title, content, is_template, template_category, variables, settings } = validationResult.data

    // Create document
    const [document] = await db.insert(documents)
      .values({
        userId,
        title,
        content: (content || []) as Block[],
        status: 'draft',
        isTemplate: is_template || false,
        templateCategory: template_category || null,
        variables: (variables || null) as Record<string, unknown> | null,
        settings: (settings || null) as Record<string, unknown> | null,
      })
      .returning({ id: documents.id, title: documents.title })

    // Revalidate documents page
    revalidatePath('/documents')
    if (is_template) {
      revalidatePath('/templates')
    }

    return { success: true, data: document }
  } catch (error) {
    console.error('Error in createDocument:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Update document
export async function updateDocument(
  id: string,
  input: {
    title?: string
    content?: Block[]
    status?: string
    is_template?: boolean
    template_category?: string | null
    variables?: Record<string, unknown> | null
    settings?: DocumentSettings | null
    expires_at?: string | null
  }
): Promise<ActionResult<{ id: string; title: string }>> {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return { success: false, error: 'Unauthorized' }
    }

    // Validate input
    const validationResult = updateDocumentSchema.safeParse(input)
    if (!validationResult.success) {
      return {
        success: false,
        error: 'Validation failed',
        details: validationResult.error.flatten(),
      }
    }

    // Check if document exists and belongs to user
    const [existingDoc] = await db.select({
      id: documents.id,
      status: documents.status,
      isTemplate: documents.isTemplate,
    })
      .from(documents)
      .where(and(eq(documents.id, id), eq(documents.userId, userId)))
      .limit(1)

    if (!existingDoc) {
      return { success: false, error: 'Document not found' }
    }

    // Don't allow editing completed documents
    if (existingDoc.status === 'completed') {
      return { success: false, error: 'Cannot edit a completed document' }
    }

    // Build update data
    const validated = validationResult.data
    const updateData: Partial<typeof documents.$inferInsert> = {
      updatedAt: new Date(),
    }

    if (validated.title !== undefined) updateData.title = validated.title
    if (validated.content !== undefined) updateData.content = validated.content as Block[]
    if (validated.status !== undefined) updateData.status = validated.status as 'draft' | 'sent' | 'viewed' | 'completed' | 'expired' | 'declined'
    if (validated.is_template !== undefined) updateData.isTemplate = validated.is_template
    if (validated.template_category !== undefined) updateData.templateCategory = validated.template_category
    if (validated.variables !== undefined) updateData.variables = validated.variables as Record<string, unknown> | null
    if (validated.settings !== undefined) updateData.settings = validated.settings as Record<string, unknown> | null
    if (validated.expires_at !== undefined) updateData.expiresAt = validated.expires_at ? new Date(validated.expires_at) : null

    // Update document
    const [document] = await db.update(documents)
      .set(updateData)
      .where(and(eq(documents.id, id), eq(documents.userId, userId)))
      .returning({ id: documents.id, title: documents.title })

    // Revalidate pages
    revalidatePath('/documents')
    revalidatePath(`/documents/${id}`)
    revalidatePath(`/documents/${id}/edit`)
    if (existingDoc.isTemplate || input.is_template) {
      revalidatePath('/templates')
    }

    return { success: true, data: document }
  } catch (error) {
    console.error('Error in updateDocument:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Delete document
export async function deleteDocument(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return { success: false, error: 'Unauthorized' }
    }

    // Check if document exists and belongs to user
    const [existingDoc] = await db.select({
      id: documents.id,
      isTemplate: documents.isTemplate,
    })
      .from(documents)
      .where(and(eq(documents.id, id), eq(documents.userId, userId)))
      .limit(1)

    if (!existingDoc) {
      return { success: false, error: 'Document not found' }
    }

    // Delete associated records
    await db.delete(recipients).where(eq(recipients.documentId, id))
    await db.delete(documentEvents).where(eq(documentEvents.documentId, id))
    await db.delete(payments).where(eq(payments.documentId, id))

    // Delete document
    await db.delete(documents)
      .where(and(eq(documents.id, id), eq(documents.userId, userId)))

    // Revalidate pages
    revalidatePath('/documents')
    if (existingDoc.isTemplate) {
      revalidatePath('/templates')
    }

    return { success: true, data: { id } }
  } catch (error) {
    console.error('Error in deleteDocument:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Duplicate document
export async function duplicateDocument(
  id: string,
  newTitle?: string
): Promise<ActionResult<{ id: string; title: string }>> {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return { success: false, error: 'Unauthorized' }
    }

    // Fetch original document
    const [originalDoc] = await db.select()
      .from(documents)
      .where(and(eq(documents.id, id), eq(documents.userId, userId)))
      .limit(1)

    if (!originalDoc) {
      return { success: false, error: 'Document not found' }
    }

    // Create duplicate
    const [duplicatedDoc] = await db.insert(documents)
      .values({
        userId,
        title: newTitle || `${originalDoc.title} (Copy)`,
        content: originalDoc.content,
        status: 'draft',
        isTemplate: false,
        templateCategory: null,
        variables: originalDoc.variables,
        settings: originalDoc.settings,
      })
      .returning({ id: documents.id, title: documents.title })

    // Create document event
    await db.insert(documentEvents).values({
      documentId: duplicatedDoc.id,
      eventType: 'document_created',
      eventData: {
        source: 'duplicate',
        original_document_id: id,
      },
    })

    // Revalidate documents page
    revalidatePath('/documents')

    return { success: true, data: duplicatedDoc }
  } catch (error) {
    console.error('Error in duplicateDocument:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Save document as template
export async function saveAsTemplate(
  id: string,
  options?: {
    title?: string
    category?: string | null
  }
): Promise<ActionResult<{ id: string; title: string }>> {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return { success: false, error: 'Unauthorized' }
    }

    // Fetch original document
    const [originalDoc] = await db.select()
      .from(documents)
      .where(and(eq(documents.id, id), eq(documents.userId, userId)))
      .limit(1)

    if (!originalDoc) {
      return { success: false, error: 'Document not found' }
    }

    // Create template
    const [template] = await db.insert(documents)
      .values({
        userId,
        title: options?.title || `${originalDoc.title} (Template)`,
        content: originalDoc.content,
        status: 'draft',
        isTemplate: true,
        templateCategory: options?.category || null,
        variables: originalDoc.variables,
        settings: originalDoc.settings,
      })
      .returning({ id: documents.id, title: documents.title })

    // Create document event
    await db.insert(documentEvents).values({
      documentId: template.id,
      eventType: 'template_created',
      eventData: {
        source_document_id: id,
        category: options?.category || null,
      },
    })

    // Revalidate pages
    revalidatePath('/templates')

    return { success: true, data: template }
  } catch (error) {
    console.error('Error in saveAsTemplate:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Create document from template
export async function createFromTemplate(
  templateId: string,
  title?: string
): Promise<ActionResult<{ id: string; title: string }>> {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return { success: false, error: 'Unauthorized' }
    }

    // Fetch template
    const [template] = await db.select()
      .from(documents)
      .where(and(
        eq(documents.id, templateId),
        eq(documents.userId, userId),
        eq(documents.isTemplate, true)
      ))
      .limit(1)

    if (!template) {
      return { success: false, error: 'Template not found' }
    }

    // Create document from template
    const [document] = await db.insert(documents)
      .values({
        userId,
        title: title || template.title.replace(' (Template)', ''),
        content: template.content,
        status: 'draft',
        isTemplate: false,
        templateCategory: null,
        variables: template.variables,
        settings: template.settings,
      })
      .returning({ id: documents.id, title: documents.title })

    // Create document event
    await db.insert(documentEvents).values({
      documentId: document.id,
      eventType: 'document_created',
      eventData: {
        source: 'template',
        template_id: templateId,
      },
    })

    // Revalidate documents page
    revalidatePath('/documents')

    return { success: true, data: document }
  } catch (error) {
    console.error('Error in createFromTemplate:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Generate access token for recipient
function generateAccessToken(): string {
  const uuid = uuidv4()
  const randomPart = Array.from({ length: 16 }, () =>
    Math.random().toString(36).charAt(2)
  ).join('')
  return `${uuid}-${randomPart}`
}

// Send document to recipients
export async function sendDocument(
  id: string,
  recipientsList: Array<{
    email: string
    name: string
    role?: 'signer' | 'viewer' | 'approver'
    signing_order?: number
  }>,
  options?: {
    message?: string
    expires_in_days?: number
  }
): Promise<ActionResult<{ id: string; recipients: Array<{ email: string; signingUrl: string }> }>> {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return { success: false, error: 'Unauthorized' }
    }

    // Validate recipients
    if (!recipientsList || recipientsList.length === 0) {
      return { success: false, error: 'At least one recipient is required' }
    }

    // Fetch document
    const [document] = await db.select()
      .from(documents)
      .where(and(eq(documents.id, id), eq(documents.userId, userId)))
      .limit(1)

    if (!document) {
      return { success: false, error: 'Document not found' }
    }

    // Check document state
    if (document.status !== 'draft') {
      return { success: false, error: 'Document has already been sent' }
    }

    if (document.isTemplate) {
      return { success: false, error: 'Cannot send a template directly' }
    }

    // Calculate expiration
    const docSettings = document.settings as DocumentSettings | null
    const expirationDays = options?.expires_in_days || docSettings?.expirationDays
    const expiresAt = expirationDays
      ? new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000)
      : null

    // Create recipient records
    const recipientRecords = recipientsList.map((r, index) => ({
      documentId: id,
      email: r.email,
      name: r.name,
      role: r.role || 'signer' as const,
      signingOrder: r.signing_order || index + 1,
      status: 'pending' as const,
      accessToken: generateAccessToken(),
    }))

    // Delete existing recipients
    await db.delete(recipients).where(eq(recipients.documentId, id))

    // Insert new recipients
    const createdRecipients = await db.insert(recipients)
      .values(recipientRecords)
      .returning()

    // Update document status
    await db.update(documents)
      .set({
        status: 'sent',
        sentAt: new Date(),
        expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(documents.id, id))

    // Create event
    await db.insert(documentEvents).values({
      documentId: id,
      eventType: 'document_sent',
      eventData: {
        recipients: recipientsList.map((r) => ({ email: r.email, name: r.name })),
        message: options?.message || null,
      },
    })

    // Generate signing URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || ''
    const signingUrls = createdRecipients.map((r) => ({
      email: r.email,
      signingUrl: `${baseUrl}/sign/${r.accessToken}`,
    }))

    // Revalidate pages
    revalidatePath('/documents')
    revalidatePath(`/documents/${id}`)

    return {
      success: true,
      data: {
        id,
        recipients: signingUrls,
      },
    }
  } catch (error) {
    console.error('Error in sendDocument:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}
