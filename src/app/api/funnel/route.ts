import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { documents, recipients } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { eq, and, sql, count, or } from 'drizzle-orm';

// GET /api/funnel - Get funnel metrics for authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Sent: COUNT of documents WHERE status IN ('sent', 'viewed', 'completed')
    const [sentResult] = await db
      .select({ count: count() })
      .from(documents)
      .where(
        and(
          eq(documents.userId, userId),
          sql`${documents.status} IN ('sent', 'viewed', 'completed')`
        )
      );

    const sentCount = sentResult?.count || 0;

    // Viewed: COUNT of documents WHERE status IN ('viewed', 'completed')
    const [viewedResult] = await db
      .select({ count: count() })
      .from(documents)
      .where(
        and(
          eq(documents.userId, userId),
          sql`${documents.status} IN ('viewed', 'completed')`
        )
      );

    const viewedCount = viewedResult?.count || 0;

    // Completed: COUNT of documents WHERE status = 'completed'
    const [completedResult] = await db
      .select({ count: count() })
      .from(documents)
      .where(
        and(
          eq(documents.userId, userId),
          eq(documents.status, 'completed')
        )
      );

    const completedCount = completedResult?.count || 0;

    // Signed: COUNT of documents WHERE status = 'completed' OR has any recipient with status = 'signed'
    // First get completed documents count
    const completedDocIds = await db
      .select({ id: documents.id })
      .from(documents)
      .where(
        and(
          eq(documents.userId, userId),
          eq(documents.status, 'completed')
        )
      );

    // Get documents with signed recipients
    const signedRecipientDocs = await db
      .select({ documentId: recipients.documentId })
      .from(recipients)
      .innerJoin(documents, eq(recipients.documentId, documents.id))
      .where(
        and(
          eq(documents.userId, userId),
          eq(recipients.status, 'signed')
        )
      );

    // Combine and deduplicate document IDs
    const signedDocIds = new Set<string>();
    completedDocIds.forEach((doc) => signedDocIds.add(doc.id));
    signedRecipientDocs.forEach((doc) => signedDocIds.add(doc.documentId));
    const signedCount = signedDocIds.size;

    // Calculate percentages relative to Sent
    const sentPercentage = 100;
    const viewedPercentage = sentCount > 0 ? Math.round((viewedCount / sentCount) * 100) : 0;
    const signedPercentage = sentCount > 0 ? Math.round((signedCount / sentCount) * 100) : 0;
    const completedPercentage = sentCount > 0 ? Math.round((completedCount / sentCount) * 100) : 0;

    // Calculate conversion rate (Sent → Completed)
    const conversionRate = sentCount > 0 ? Math.round((completedCount / sentCount) * 100) : 0;

    // Calculate average time to complete (from sentAt to updatedAt for completed docs)
    const completedDocs = await db
      .select({
        sentAt: documents.sentAt,
        updatedAt: documents.updatedAt,
      })
      .from(documents)
      .where(
        and(
          eq(documents.userId, userId),
          eq(documents.status, 'completed'),
          sql`${documents.sentAt} IS NOT NULL`
        )
      );

    let avgTimeToComplete: number | null = null;
    if (completedDocs.length > 0) {
      const totalHours = completedDocs.reduce((sum, doc) => {
        if (doc.sentAt && doc.updatedAt) {
          const sentTime = new Date(doc.sentAt).getTime();
          const completedTime = new Date(doc.updatedAt).getTime();
          const hours = (completedTime - sentTime) / (1000 * 60 * 60);
          return sum + hours;
        }
        return sum;
      }, 0);

      avgTimeToComplete = Math.round(totalHours / completedDocs.length);
    }

    return NextResponse.json({
      stages: [
        { name: 'Sent', count: sentCount, percentage: sentPercentage },
        { name: 'Viewed', count: viewedCount, percentage: viewedPercentage },
        { name: 'Signed', count: signedCount, percentage: signedPercentage },
        { name: 'Completed', count: completedCount, percentage: completedPercentage },
      ],
      conversionRate,
      avgTimeToComplete,
    });
  } catch (error) {
    console.error('Error in GET /api/funnel:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
