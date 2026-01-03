import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { recipients, documentEvents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import * as z from "zod";

const trackEventSchema = z.object({
  eventType: z.string(),
  eventData: z.record(z.string(), z.unknown()).optional(),
});

// POST: Track engagement events
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await request.json();

    const validation = trackEventSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid event data" },
        { status: 400 }
      );
    }

    const { eventType, eventData } = validation.data;

    // Find the recipient by access token
    const [recipientData] = await db.select({
      id: recipients.id,
      documentId: recipients.documentId,
    })
      .from(recipients)
      .where(eq(recipients.accessToken, token))
      .limit(1);

    if (!recipientData) {
      return NextResponse.json(
        { error: "Invalid access link" },
        { status: 404 }
      );
    }

    // Get additional context
    const userAgent = request.headers.get("user-agent") || undefined;
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ipAddress = forwardedFor ? forwardedFor.split(",")[0].trim() : null;

    // Record the event
    await db.insert(documentEvents).values({
      documentId: recipientData.documentId,
      recipientId: recipientData.id,
      eventType,
      eventData: {
        ...eventData,
        user_agent: userAgent,
        ip_address: ipAddress,
        timestamp: new Date().toISOString(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking event:", error);
    return NextResponse.json(
      { error: "Failed to track event" },
      { status: 500 }
    );
  }
}
