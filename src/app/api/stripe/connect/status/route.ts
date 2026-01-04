import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { profiles, organizations } from "@/lib/db/schema";
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

    // Get user's profile with Stripe account ID and current org context
    const [profile] = await db.select({
      stripeAccountId: profiles.stripeAccountId,
      currentOrganizationId: profiles.currentOrganizationId,
    })
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1);

    // If in organization context, check org's Stripe account
    if (profile?.currentOrganizationId) {
      const [org] = await db.select({
        stripeAccountId: organizations.stripeAccountId,
        stripeAccountEnabled: organizations.stripeAccountEnabled,
        name: organizations.name,
      })
        .from(organizations)
        .where(eq(organizations.id, profile.currentOrganizationId))
        .limit(1);

      if (!org?.stripeAccountId) {
        return NextResponse.json({
          hasAccount: false,
          isTeam: true,
          teamName: org?.name,
        });
      }

      const status = await getConnectAccountStatus(org.stripeAccountId);

      return NextResponse.json({
        hasAccount: true,
        isTeam: true,
        teamName: org.name,
        status,
      });
    }

    // Personal context - check user's Stripe account
    if (!profile?.stripeAccountId) {
      return NextResponse.json({
        hasAccount: false,
        isTeam: false,
      });
    }

    // Get account status from Stripe
    const status = await getConnectAccountStatus(profile.stripeAccountId);

    return NextResponse.json({
      hasAccount: true,
      isTeam: false,
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
