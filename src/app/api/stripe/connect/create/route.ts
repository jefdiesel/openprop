import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { profiles, organizations, organizationMembers } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
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

    // Check if user is in organization context
    const [profile] = await db.select({
      stripeAccountId: profiles.stripeAccountId,
      currentOrganizationId: profiles.currentOrganizationId,
    })
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1);

    // If in organization context, check permissions and use org's Stripe account
    if (profile?.currentOrganizationId) {
      // Verify user is owner or admin
      const [membership] = await db.select({ role: organizationMembers.role })
        .from(organizationMembers)
        .where(
          and(
            eq(organizationMembers.organizationId, profile.currentOrganizationId),
            eq(organizationMembers.userId, userId)
          )
        )
        .limit(1);

      if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
        return NextResponse.json(
          { error: "Only team owners and admins can manage Stripe Connect" },
          { status: 403 }
        );
      }

      // Check if organization already has a Stripe account
      const [org] = await db.select({ stripeAccountId: organizations.stripeAccountId })
        .from(organizations)
        .where(eq(organizations.id, profile.currentOrganizationId))
        .limit(1);

      if (org?.stripeAccountId) {
        return NextResponse.json(
          { error: "This team already has a connected Stripe account" },
          { status: 400 }
        );
      }

      // Create Stripe Connect account for the organization
      const userEmail = session.user?.email || "user@example.com";
      const connectEmail = userEmail.includes("+")
        ? userEmail
        : userEmail.replace("@", "+team@");

      const { accountId, onboardingUrl } = await createConnectAccount({
        email: connectEmail,
        userId: profile.currentOrganizationId, // Use org ID in metadata
      });

      // Save account ID to organization
      await db.update(organizations)
        .set({ stripeAccountId: accountId, updatedAt: new Date() })
        .where(eq(organizations.id, profile.currentOrganizationId));

      return NextResponse.json({
        accountId,
        onboardingUrl,
        isTeam: true,
      });
    }

    // Personal context - use user's Stripe account
    if (profile?.stripeAccountId) {
      return NextResponse.json(
        { error: "You already have a connected Stripe account" },
        { status: 400 }
      );
    }

    // Create Stripe Connect account for user
    const userEmail = session.user?.email || "user@example.com";
    const connectEmail = userEmail.includes("+")
      ? userEmail
      : userEmail.replace("@", "+connect@");

    const { accountId, onboardingUrl } = await createConnectAccount({
      email: connectEmail,
      userId,
    });

    // Save account ID to profile (upsert in case profile doesn't exist)
    if (profile) {
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
      isTeam: false,
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
