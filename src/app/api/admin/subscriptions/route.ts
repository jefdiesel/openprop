import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { subscriptions, users, organizations } from "@/lib/db/schema";
import { sql, desc, eq } from "drizzle-orm";

// GET /api/admin/subscriptions - List all subscriptions with pagination
export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin();

  if (!adminCheck.authorized) {
    return NextResponse.json(
      { error: adminCheck.error },
      { status: adminCheck.error === "Unauthorized" ? 401 : 403 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const statusFilter = searchParams.get("status") || "";

    // Validate pagination params
    const validatedPage = Math.max(1, page);
    const validatedLimit = Math.min(Math.max(1, limit), 100);
    const offset = (validatedPage - 1) * validatedLimit;

    // Build where clause for status filter
    const whereClause =
      statusFilter &&
      ["active", "canceled", "past_due", "trialing", "incomplete", "incomplete_expired"].includes(
        statusFilter
      )
        ? eq(
            subscriptions.status,
            statusFilter as
              | "active"
              | "canceled"
              | "past_due"
              | "trialing"
              | "incomplete"
              | "incomplete_expired"
          )
        : undefined;

    // Get total count
    const totalCountResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(subscriptions)
      .where(whereClause);
    const totalCount = totalCountResult[0]?.count || 0;

    // Fetch subscriptions with user/organization info
    const subscriptionsWithDetails = await db
      .select({
        id: subscriptions.id,
        userId: subscriptions.userId,
        organizationId: subscriptions.organizationId,
        planId: subscriptions.planId,
        status: subscriptions.status,
        billingInterval: subscriptions.billingInterval,
        isEarlyBird: subscriptions.isEarlyBird,
        currentPeriodStart: subscriptions.currentPeriodStart,
        currentPeriodEnd: subscriptions.currentPeriodEnd,
        cancelAtPeriodEnd: subscriptions.cancelAtPeriodEnd,
        canceledAt: subscriptions.canceledAt,
        createdAt: subscriptions.createdAt,
        stripeSubscriptionId: subscriptions.stripeSubscriptionId,
        userName: users.name,
        userEmail: users.email,
        orgName: organizations.name,
      })
      .from(subscriptions)
      .leftJoin(users, eq(subscriptions.userId, users.id))
      .leftJoin(organizations, eq(subscriptions.organizationId, organizations.id))
      .where(whereClause)
      .orderBy(desc(subscriptions.createdAt))
      .limit(validatedLimit)
      .offset(offset);

    // Format the results
    const formattedSubscriptions = subscriptionsWithDetails.map((sub) => ({
      id: sub.id,
      planId: sub.planId,
      status: sub.status,
      billingInterval: sub.billingInterval,
      isEarlyBird: sub.isEarlyBird,
      currentPeriodStart: sub.currentPeriodStart?.toISOString() || null,
      currentPeriodEnd: sub.currentPeriodEnd?.toISOString() || null,
      cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
      canceledAt: sub.canceledAt?.toISOString() || null,
      createdAt: sub.createdAt.toISOString(),
      stripeSubscriptionId: sub.stripeSubscriptionId,
      user: sub.userId
        ? {
            id: sub.userId,
            name: sub.userName || "",
            email: sub.userEmail || "",
          }
        : null,
      organization: sub.organizationId
        ? {
            id: sub.organizationId,
            name: sub.orgName || "",
          }
        : null,
    }));

    return NextResponse.json({
      subscriptions: formattedSubscriptions,
      pagination: {
        page: validatedPage,
        limit: validatedLimit,
        totalCount,
        totalPages: Math.ceil(totalCount / validatedLimit),
      },
    });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscriptions" },
      { status: 500 }
    );
  }
}
