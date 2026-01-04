import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { subscriptions, organizations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  getOrganization,
  getOrganizationSubscription,
} from "@/lib/organizations";
import { requireOrgPermission } from "@/lib/permissions";
import {
  PLANS,
  createOrganizationSubscriptionCheckout,
  createBillingPortalSession,
  getPlanSeatLimit,
  type PlanId,
} from "@/lib/stripe";

// GET /api/organizations/[id]/billing - Get billing info
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: orgId } = await context.params;
  try {
    const authCheck = await requireOrgPermission(orgId, "billing:read");
    if (!authCheck.authorized) {
      return NextResponse.json(
        { error: authCheck.error },
        { status: authCheck.error === "Unauthorized" ? 401 : 403 }
      );
    }

    const org = await getOrganization(orgId);
    if (!org) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    const subscription = await getOrganizationSubscription(orgId);

    // Get available team plans
    const teamPlans = {
      pro_team: PLANS.pro_team,
      business_team: PLANS.business_team,
    };

    return NextResponse.json({
      subscription: subscription
        ? {
            id: subscription.id,
            planId: subscription.planId,
            status: subscription.status,
            seatLimit: subscription.seatLimit,
            billingInterval: subscription.billingInterval,
            isEarlyBird: subscription.isEarlyBird,
            currentPeriodStart: subscription.currentPeriodStart,
            currentPeriodEnd: subscription.currentPeriodEnd,
            cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
          }
        : null,
      plans: teamPlans,
      canManageBilling: authCheck.role === "owner",
    });
  } catch (error) {
    console.error("Error fetching billing:", error);
    return NextResponse.json(
      { error: "Failed to fetch billing info" },
      { status: 500 }
    );
  }
}

// POST /api/organizations/[id]/billing - Create checkout session
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: orgId } = await context.params;
  try {
    const authCheck = await requireOrgPermission(orgId, "billing:manage");
    if (!authCheck.authorized) {
      return NextResponse.json(
        { error: authCheck.error },
        { status: authCheck.error === "Unauthorized" ? 401 : 403 }
      );
    }

    // Only owner can manage billing
    if (authCheck.role !== "owner") {
      return NextResponse.json(
        { error: "Only the owner can manage billing" },
        { status: 403 }
      );
    }

    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const body = await request.json();
    const { planId, billingInterval = "monthly" } = body;

    if (!planId || !["pro_team", "business_team"].includes(planId)) {
      return NextResponse.json(
        { error: "Invalid plan. Must be 'pro_team' or 'business_team'" },
        { status: 400 }
      );
    }

    const org = await getOrganization(orgId);
    if (!org) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    const plan = PLANS[planId as PlanId];
    if (!plan) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const priceId =
      billingInterval === "yearly"
        ? plan.stripePriceIdYearly
        : plan.stripePriceIdMonthly;

    if (!priceId) {
      return NextResponse.json(
        { error: "Plan price not configured" },
        { status: 500 }
      );
    }

    const seatLimit = getPlanSeatLimit(planId as PlanId);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const checkout = await createOrganizationSubscriptionCheckout({
      organizationId: orgId,
      organizationName: org.name,
      userId: authCheck.userId!,
      email: session.user.email,
      priceId,
      successUrl: `${appUrl}/settings/team/billing?success=true`,
      cancelUrl: `${appUrl}/settings/team/billing?canceled=true`,
      seatLimit: seatLimit || undefined,
    });

    return NextResponse.json({
      sessionId: checkout.sessionId,
      url: checkout.url,
    });
  } catch (error) {
    console.error("Error creating checkout:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

// PUT /api/organizations/[id]/billing - Access billing portal
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: orgId } = await context.params;
  try {
    const authCheck = await requireOrgPermission(orgId, "billing:manage");
    if (!authCheck.authorized) {
      return NextResponse.json(
        { error: authCheck.error },
        { status: authCheck.error === "Unauthorized" ? 401 : 403 }
      );
    }

    if (authCheck.role !== "owner") {
      return NextResponse.json(
        { error: "Only the owner can access billing portal" },
        { status: 403 }
      );
    }

    const subscription = await getOrganizationSubscription(orgId);
    if (!subscription?.stripeCustomerId) {
      return NextResponse.json(
        { error: "No billing account found. Subscribe to a plan first." },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const portalUrl = await createBillingPortalSession(
      subscription.stripeCustomerId,
      `${appUrl}/settings/team/billing`
    );

    return NextResponse.json({ url: portalUrl });
  } catch (error) {
    console.error("Error creating portal session:", error);
    return NextResponse.json(
      { error: "Failed to access billing portal" },
      { status: 500 }
    );
  }
}
