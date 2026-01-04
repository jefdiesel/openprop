import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getOrganizationStorageUsage, formatBytes } from "@/lib/storage";

// GET /api/storage/usage - Get storage usage for current context
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current organization context
    const [profile] = await db
      .select({ currentOrganizationId: profiles.currentOrganizationId })
      .from(profiles)
      .where(eq(profiles.id, session.user.id))
      .limit(1);

    if (!profile?.currentOrganizationId) {
      // Personal context - no storage tracking for solo users yet
      return NextResponse.json({
        usedBytes: 0,
        usedGb: 0,
        limitGb: -1, // Unlimited for solo/free
        limitBytes: -1,
        percentUsed: 0,
        isAtLimit: false,
        formatted: {
          used: "0 B",
          limit: "Unlimited",
        },
      });
    }

    const usage = await getOrganizationStorageUsage(profile.currentOrganizationId);

    return NextResponse.json({
      ...usage,
      formatted: {
        used: formatBytes(usage.usedBytes),
        limit: usage.limitGb > 0 ? `${usage.limitGb} GB` : "Unlimited",
      },
    });
  } catch (error) {
    console.error("Error fetching storage usage:", error);
    return NextResponse.json(
      { error: "Failed to fetch storage usage" },
      { status: 500 }
    );
  }
}
