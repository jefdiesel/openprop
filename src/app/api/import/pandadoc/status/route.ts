import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { importJobs } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const jobId = searchParams.get('jobId');

    if (jobId) {
      // Get specific job status
      const job = await db.query.importJobs.findFirst({
        where: and(
          eq(importJobs.id, jobId),
          eq(importJobs.userId, session.user.id)
        ),
      });

      if (!job) {
        return NextResponse.json(
          { error: 'Import job not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        id: job.id,
        status: job.status,
        totalFiles: job.totalFiles,
        processedFiles: job.processedFiles,
        failedFiles: job.failedFiles,
        errorMessage: job.errorMessage,
        startedAt: job.startedAt?.toISOString(),
        completedAt: job.completedAt?.toISOString(),
        progress: job.totalFiles > 0
          ? Math.round((job.processedFiles / job.totalFiles) * 100)
          : 0,
      });
    }

    // Get recent import jobs
    const jobs = await db.query.importJobs.findMany({
      where: and(
        eq(importJobs.userId, session.user.id),
        eq(importJobs.provider, 'pandadoc')
      ),
      orderBy: [desc(importJobs.createdAt)],
      limit: 10,
    });

    return NextResponse.json({
      jobs: jobs.map((job) => ({
        id: job.id,
        status: job.status,
        totalFiles: job.totalFiles,
        processedFiles: job.processedFiles,
        failedFiles: job.failedFiles,
        errorMessage: job.errorMessage,
        startedAt: job.startedAt?.toISOString(),
        completedAt: job.completedAt?.toISOString(),
        createdAt: job.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Failed to get import status:', error);
    return NextResponse.json(
      { error: 'Failed to get status' },
      { status: 500 }
    );
  }
}
