import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { createConnectAccount } from "@/lib/stripe";

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

    // Check if user already has a Stripe account
    const [profile] = await db.select({ stripeAccountId: profiles.stripeAccountId })
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1);

    if (profile?.stripeAccountId) {
      return NextResponse.json(
        { error: "You already have a connected Stripe account" },
        { status: 400 }
      );
    }

    // Create Stripe Connect account
    // Use a modified email to avoid conflict with platform account
    const userEmail = session.user?.email || "user@example.com";
    const connectEmail = userEmail.includes("+")
      ? userEmail
      : userEmail.replace("@", "+connect@");

    const { accountId, onboardingUrl } = await createConnectAccount({
      email: connectEmail,
      userId,
    });

    // Save account ID to profile (upsert in case profile doesn't exist)
    const [existingProfile] = await db.select({ id: profiles.id })
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1);

    if (existingProfile) {
      await db.update(profiles)
        .set({ stripeAccountId: accountId })
        .where(eq(profiles.id, userId));
    } else {
      await db.insert(profiles).values({
        id: userId,
        stripeAccountId: accountId,
      });
    }

    return NextResponse.json({
      accountId,
      onboardingUrl,
    });
  } catch (error) {
    console.error("Error creating connect account:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error details:", errorMessage);
    return NextResponse.json(
      { error: `Failed to create Stripe account: ${errorMessage}` },
      { status: 500 }
    );
  }
}
