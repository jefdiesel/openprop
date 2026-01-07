import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { documentEvents } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq, sql, and, gte } from "drizzle-orm";
import { canAccessDocument } from "@/lib/document-access";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET /api/documents/[id]/analytics - Get analytics for a document
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check access (owner or team member)
    const access = await canAccessDocument(userId, id);
    if (!access.allowed) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Fetch all events for this document
    const events = await db
      .select({
        id: documentEvents.id,
        recipientId: documentEvents.recipientId,
        eventType: documentEvents.eventType,
        eventData: documentEvents.eventData,
        createdAt: documentEvents.createdAt,
      })
      .from(documentEvents)
      .where(eq(documentEvents.documentId, id));

    // Calculate summary metrics
    const documentViewedEvents = events.filter(
      (e) => e.eventType === "document_viewed" || e.eventType === "page_view"
    );
    const sessionEndEvents = events.filter((e) => e.eventType === "session_end");
    const blockEvents = events.filter(
      (e) => e.eventType === "block_viewed" || e.eventType === "block_times"
    );

    const totalViews = documentViewedEvents.length;

    // Unique viewers - count distinct recipient_ids
    const uniqueViewers = new Set(
      documentViewedEvents
        .map((e) => e.recipientId)
        .filter((id) => id !== null)
    ).size;

    // Total time spent - sum time_spent from session_end events
    const totalTimeSpent = sessionEndEvents.reduce((sum, event) => {
      const timeSpent = (event.eventData as any)?.total_time ||
                        (event.eventData as any)?.time_spent ||
                        0;
      return sum + timeSpent;
    }, 0);

    // Average time spent per session
    const avgTimeSpent = sessionEndEvents.length > 0
      ? totalTimeSpent / sessionEndEvents.length
      : 0;

    // Average scroll depth from session_end events
    const scrollDepths = sessionEndEvents
      .map((e) => (e.eventData as any)?.max_scroll_depth || 0)
      .filter((d) => d > 0);
    const avgScrollDepth = scrollDepths.length > 0
      ? scrollDepths.reduce((sum, d) => sum + d, 0) / scrollDepths.length
      : 0;

    // Completion rate - % of sessions that reached 90%+ scroll
    const completedSessions = sessionEndEvents.filter(
      (e) => ((e.eventData as any)?.max_scroll_depth || 0) >= 90
    ).length;
    const completionRate = sessionEndEvents.length > 0
      ? (completedSessions / sessionEndEvents.length) * 100
      : 0;

    // Views by day - last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const viewsByDay = documentViewedEvents
      .filter((e) => e.createdAt && e.createdAt >= thirtyDaysAgo)
      .reduce((acc, event) => {
        if (!event.createdAt) return acc;
        const date = event.createdAt.toISOString().split("T")[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const viewsByDayArray = Object.entries(viewsByDay)
      .map(([date, views]) => ({ date, views }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Peak hour - most common viewing hour (0-23)
    const hourCounts = documentViewedEvents.reduce((acc, event) => {
      if (!event.createdAt) return acc;
      const hour = event.createdAt.getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    let peakHour = 0;
    let maxCount = 0;
    Object.entries(hourCounts).forEach(([hour, count]) => {
      if (count > maxCount) {
        maxCount = count;
        peakHour = parseInt(hour);
      }
    });

    // Block engagement metrics
    const blockMetrics = blockEvents.reduce((acc, event) => {
      const data = event.eventData as any;
      const blockId = data?.block_id;
      const blockType = data?.block_type;
      const timeSpent = data?.time_spent || 0;

      if (!blockId) return acc;

      if (!acc[blockId]) {
        acc[blockId] = {
          blockId,
          blockType: blockType || "unknown",
          viewCount: 0,
          totalTime: 0,
        };
      }

      acc[blockId].viewCount += 1;
      acc[blockId].totalTime += timeSpent;

      return acc;
    }, {} as Record<string, { blockId: string; blockType: string; viewCount: number; totalTime: number }>);

    const blocks = Object.values(blockMetrics).map((block) => ({
      blockId: block.blockId,
      blockType: block.blockType,
      viewCount: block.viewCount,
      avgTimeSpent: block.viewCount > 0 ? block.totalTime / block.viewCount : 0,
    }));

    // Return analytics response
    return NextResponse.json({
      summary: {
        totalViews,
        uniqueViewers,
        totalTimeSpent: Math.round(totalTimeSpent),
        avgTimeSpent: Math.round(avgTimeSpent),
        avgScrollDepth: Math.round(avgScrollDepth * 10) / 10,
        completionRate: Math.round(completionRate * 10) / 10,
      },
      engagement: {
        viewsByDay: viewsByDayArray,
        peakHour,
      },
      blocks,
    });
  } catch (error) {
    console.error("Error in GET /api/documents/[id]/analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
