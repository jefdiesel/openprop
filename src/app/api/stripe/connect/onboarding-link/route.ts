import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { createAccountLink } from "@/lib/stripe";

export async function POST() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user's Stripe account ID
    const [profile] = await db.select({ stripeAccountId: profiles.stripeAccountId })
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1);

    if (!profile?.stripeAccountId) {
      return NextResponse.json(
        { error: "No Stripe account found" },
        { status: 404 }
      );
    }

    // Create new account link
    const url = await createAccountLink(profile.stripeAccountId);

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Error creating onboarding link:", error);
    return NextResponse.json(
      { error: "Failed to create onboarding link" },
      { status: 500 }
    );
  }
}
