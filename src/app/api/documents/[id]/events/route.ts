import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { documents, documentEvents, recipients } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq, and, desc } from "drizzle-orm";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET /api/documents/[id]/events - Get all events for a document
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user owns the document
    const [document] = await db
      .select({ id: documents.id })
      .from(documents)
      .where(and(eq(documents.id, id), eq(documents.userId, userId)))
      .limit(1);

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Fetch events with recipient info
    const events = await db
      .select({
        id: documentEvents.id,
        documentId: documentEvents.documentId,
        recipientId: documentEvents.recipientId,
        eventType: documentEvents.eventType,
        eventData: documentEvents.eventData,
        createdAt: documentEvents.createdAt,
        recipientName: recipients.name,
        recipientEmail: recipients.email,
      })
      .from(documentEvents)
      .leftJoin(recipients, eq(documentEvents.recipientId, recipients.id))
      .where(eq(documentEvents.documentId, id))
      .orderBy(desc(documentEvents.createdAt));

    // Transform to API response format
    const transformedEvents = events.map((event) => ({
      id: event.id,
      document_id: event.documentId,
      recipient_id: event.recipientId,
      event_type: event.eventType,
      event_data: event.eventData,
      created_at: event.createdAt?.toISOString() || null,
      recipient: event.recipientId
        ? {
            name: event.recipientName,
            email: event.recipientEmail,
          }
        : null,
    }));

    return NextResponse.json({ events: transformedEvents });
  } catch (error) {
    console.error("Error in GET /api/documents/[id]/events:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
