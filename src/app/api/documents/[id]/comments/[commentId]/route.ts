import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { canAccessDocument } from '@/lib/document-access'
import {
  getComment,
  updateComment,
  resolveComment,
  deleteComment,
  userOwnsComment
} from '@/lib/db/queries/comments'
import * as z from 'zod'

type RouteContext = {
  params: Promise<{ id: string; commentId: string }>
}

// Schema for updating a comment
const updateCommentSchema = z.object({
  content: z.string().min(1).optional(),
  resolved: z.boolean().optional(),
})

// PUT /api/documents/[id]/comments/[commentId] - Update comment
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id, commentId } = await context.params
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check document access
    const access = await canAccessDocument(userId, id)
    if (!access.allowed) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Get the comment to verify it exists and belongs to this document
    const existingComment = await getComment(commentId)
    if (!existingComment || existingComment.documentId !== id) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = updateCommentSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const { content, resolved } = validationResult.data

    // If updating content, verify ownership
    if (content !== undefined) {
      const isOwner = await userOwnsComment(commentId, userId)
      if (!isOwner) {
        return NextResponse.json(
          { error: 'Only the comment owner can edit the content' },
          { status: 403 }
        )
      }
    }

    // If resolving, use the resolveComment function
    let comment
    if (resolved === true && content === undefined) {
      comment = await resolveComment(commentId, userId)
    } else if (resolved !== undefined || content !== undefined) {
      const updateData: Parameters<typeof updateComment>[1] = {}
      if (content !== undefined) updateData.content = content
      if (resolved !== undefined) {
        updateData.resolved = resolved
        if (resolved) {
          updateData.resolvedAt = new Date()
          updateData.resolvedBy = userId
        }
      }
      comment = await updateComment(commentId, updateData)
    } else {
      comment = existingComment
    }

    return NextResponse.json({ comment })
  } catch (error) {
    console.error('Error in PUT /api/documents/[id]/comments/[commentId]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/documents/[id]/comments/[commentId] - Delete comment
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id, commentId } = await context.params
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check document access
    const access = await canAccessDocument(userId, id)
    if (!access.allowed) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Get the comment to verify it exists and belongs to this document
    const existingComment = await getComment(commentId)
    if (!existingComment || existingComment.documentId !== id) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    const isOwner = await userOwnsComment(commentId, userId)
    if (!isOwner) {
      return NextResponse.json(
        { error: 'Only the comment owner can delete it' },
        { status: 403 }
      )
    }

    // Delete the comment
    await deleteComment(commentId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/documents/[id]/comments/[commentId]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
