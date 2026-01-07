import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { canAccessDocument } from '@/lib/document-access'
import { getDocumentComments, getBlockComments, createComment } from '@/lib/db/queries/comments'
import * as z from 'zod'

type RouteContext = {
  params: Promise<{ id: string }>
}

// Schema for creating a comment
const createCommentSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  blockId: z.string().nullable().optional(),
  parentId: z.string().uuid().nullable().optional(),
})

// GET /api/documents/[id]/comments - List comments for document
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

    // Check access
    const access = await canAccessDocument(userId, id)
    if (!access.allowed) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Check if filtering by blockId
    const { searchParams } = new URL(request.url)
    const blockId = searchParams.get('blockId')

    const comments = blockId
      ? await getBlockComments(id, blockId)
      : await getDocumentComments(id)

    return NextResponse.json({ comments })
  } catch (error) {
    console.error('Error in GET /api/documents/[id]/comments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/documents/[id]/comments - Create a comment
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

    // Check access
    const access = await canAccessDocument(userId, id)
    if (!access.allowed) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = createCommentSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const { content, blockId, parentId } = validationResult.data

    // Create comment
    const comment = await createComment({
      documentId: id,
      userId,
      content,
      blockId: blockId ?? null,
      parentId: parentId ?? null,
    })

    return NextResponse.json({ comment }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/documents/[id]/comments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
