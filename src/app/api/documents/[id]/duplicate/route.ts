import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { documents, documentEvents } from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { eq, and } from 'drizzle-orm'
import * as z from 'zod'

// Schema for duplicating a document
const duplicateDocumentSchema = z.object({
  title: z.string().min(1).max(255).optional(),
})

type RouteContext = {
  params: Promise<{ id: string }>
}

// POST /api/documents/[id]/duplicate - Duplicate a document
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

    // Parse request body (optional)
    let newTitle: string | undefined
    try {
      const body = await request.json()
      const validationResult = duplicateDocumentSchema.safeParse(body)
      if (validationResult.success) {
        newTitle = validationResult.data.title
      }
    } catch {
      // Body is optional, ignore parsing errors
    }

    // Fetch original document
    const [originalDoc] = await db.select()
      .from(documents)
      .where(and(eq(documents.id, id), eq(documents.userId, userId)))
      .limit(1)

    if (!originalDoc) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Create duplicate document
    const [duplicatedDoc] = await db.insert(documents)
      .values({
        userId,
        title: newTitle || `${originalDoc.title} (Copy)`,
        content: originalDoc.content,
        status: 'draft',
        isTemplate: false, // Duplicates are always documents, not templates
        templateCategory: null,
        variables: originalDoc.variables,
        settings: originalDoc.settings,
      })
      .returning()

    // Create document event
    await db.insert(documentEvents).values({
      documentId: duplicatedDoc.id,
      eventType: 'document_created',
      eventData: {
        source: 'duplicate',
        original_document_id: id,
      },
    })

    // Transform document for response
    const transformedDoc = {
      id: duplicatedDoc.id,
      user_id: duplicatedDoc.userId,
      title: duplicatedDoc.title,
      status: duplicatedDoc.status,
      content: duplicatedDoc.content,
      variables: duplicatedDoc.variables,
      settings: duplicatedDoc.settings,
      is_template: duplicatedDoc.isTemplate,
      template_category: duplicatedDoc.templateCategory,
      created_at: duplicatedDoc.createdAt?.toISOString() || null,
      updated_at: duplicatedDoc.updatedAt?.toISOString() || null,
      sent_at: duplicatedDoc.sentAt?.toISOString() || null,
      expires_at: duplicatedDoc.expiresAt?.toISOString() || null,
    }

    return NextResponse.json({
      success: true,
      document: transformedDoc,
      message: 'Document duplicated successfully',
    }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/documents/[id]/duplicate:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
