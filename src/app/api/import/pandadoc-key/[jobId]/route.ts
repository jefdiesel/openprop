import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { importJobs } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

type RouteContext = {
  params: Promise<{ jobId: string }>
}

// GET /api/import/pandadoc-key/[jobId] - Get import job status
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { jobId } = await context.params
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const [job] = await db.select()
      .from(importJobs)
      .where(and(eq(importJobs.id, jobId), eq(importJobs.userId, userId)))
      .limit(1)

    if (!job) {
      return NextResponse.json(
        { error: 'Import job not found' },
        { status: 404 }
      )
    }

    // Calculate progress percentage
    const progress = job.totalFiles > 0
      ? Math.round((job.processedFiles / job.totalFiles) * 100)
      : 0

    // Extract importedCount from metadata
    const metadata = job.metadata as Record<string, unknown> | null
    const importedCount = (metadata?.importedCount as number) || 0

    return NextResponse.json({
      job: {
        id: job.id,
        status: job.status,
        progress,
        totalItems: job.totalFiles,
        processedItems: job.processedFiles,
        importedItems: importedCount,
        failedItems: job.failedFiles,
        createdAt: job.createdAt?.toISOString(),
        completedAt: job.completedAt?.toISOString(),
        errorMessage: job.errorMessage,
        metadata: job.metadata,
      },
    })
  } catch (error) {
    console.error('Error getting import job status:', error)
    return NextResponse.json(
      { error: 'Failed to get import status' },
      { status: 500 }
    )
  }
}
