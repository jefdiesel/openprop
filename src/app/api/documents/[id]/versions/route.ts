import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { documents, documentVersions, users } from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { eq, and, desc } from 'drizzle-orm'

type RouteContext = {
  params: Promise<{ id: string }>
}

// GET /api/documents/[id]/versions - Get all versions of a document
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

    // Check if document exists and belongs to user
    const [document] = await db.select({
      id: documents.id,
      title: documents.title,
      content: documents.content,
      currentVersion: documents.currentVersion,
      status: documents.status,
    })
      .from(documents)
      .where(and(eq(documents.id, id), eq(documents.userId, userId)))
      .limit(1)

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Fetch all versions
    const versions = await db.select({
      id: documentVersions.id,
      versionNumber: documentVersions.versionNumber,
      title: documentVersions.title,
      content: documentVersions.content,
      variables: documentVersions.variables,
      changeType: documentVersions.changeType,
      changeDescription: documentVersions.changeDescription,
      createdBy: documentVersions.createdBy,
      createdAt: documentVersions.createdAt,
    })
      .from(documentVersions)
      .where(eq(documentVersions.documentId, id))
      .orderBy(desc(documentVersions.versionNumber))

    // Get user info for each version
    const versionsWithUsers = await Promise.all(
      versions.map(async (version) => {
        const [user] = await db.select({
          name: users.name,
          email: users.email,
        })
          .from(users)
          .where(eq(users.id, version.createdBy))
          .limit(1)

        return {
          ...version,
          createdAt: version.createdAt.toISOString(),
          createdByUser: user || { name: 'Unknown', email: null },
        }
      })
    )

    // Add current version as the "latest"
    const currentVersion = {
      id: 'current',
      versionNumber: document.currentVersion,
      title: document.title,
      content: document.content,
      variables: null,
      changeType: 'current' as const,
      changeDescription: 'Current version',
      createdAt: new Date().toISOString(),
      createdByUser: { name: 'Current', email: null },
    }

    return NextResponse.json({
      document: {
        id: document.id,
        title: document.title,
        currentVersion: document.currentVersion,
        status: document.status,
      },
      versions: [currentVersion, ...versionsWithUsers],
    })
  } catch (error) {
    console.error('Error in GET /api/documents/[id]/versions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
