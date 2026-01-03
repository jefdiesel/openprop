import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { getConnectAccountStatus } from "@/lib/stripe";

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user's profile with Stripe account ID
    const [profile] = await db.select({ stripeAccountId: profiles.stripeAccountId })
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1);

    // Check if user has a connected account
    if (!profile?.stripeAccountId) {
      return NextResponse.json({
        hasAccount: false,
      });
    }

    // Get account status from Stripe
    const status = await getConnectAccountStatus(profile.stripeAccountId);

    return NextResponse.json({
      hasAccount: true,
      status,
    });
  } catch (error) {
    console.error("Error getting connect account status:", error);
    return NextResponse.json(
      { error: "Failed to get account status" },
      { status: 500 }
    );
  }
}
