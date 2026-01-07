import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { canAccessDocument } from '@/lib/document-access'
import { getBlockCommentCounts } from '@/lib/db/queries/comments'

type RouteContext = {
  params: Promise<{ id: string }>
}

// GET /api/documents/[id]/comments/counts - Get comment counts per block
export async function GET(
  request: Request,
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

    const counts = await getBlockCommentCounts(id)

    return NextResponse.json({ counts })
  } catch (error) {
    console.error('Failed to fetch comment counts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comment counts' },
      { status: 500 }
    )
  }
}
