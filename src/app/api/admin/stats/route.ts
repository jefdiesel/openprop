import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { users, documents, subscriptions } from "@/lib/db/schema";
import { sql, and, eq, gte } from "drizzle-orm";

// GET /api/admin/stats - Get platform statistics
export async function GET() {
  const adminCheck = await requireAdmin();

  if (!adminCheck.authorized) {
    return NextResponse.json(
      { error: adminCheck.error },
      { status: adminCheck.error === "Unauthorized" ? 401 : 403 }
    );
  }

  try {
    // Total users
    const totalUsersResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users);
    const totalUsers = totalUsersResult[0]?.count || 0;

    // Total documents
    const totalDocsResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(documents);
    const totalDocuments = totalDocsResult[0]?.count || 0;

    // Total paid users (active subscriptions excluding 'free')
    const paidUsersResult = await db
      .select({ count: sql<number>`count(distinct ${subscriptions.userId})::int` })
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.status, "active"),
          sql`${subscriptions.planId} != 'free'`
        )
      );
    const totalPaidUsers = paidUsersResult[0]?.count || 0;

    // Calculate MRR from active subscriptions
    // Get all active subscriptions
    const activeSubscriptions = await db
      .select({
        planId: subscriptions.planId,
        billingInterval: subscriptions.billingInterval,
        isEarlyBird: subscriptions.isEarlyBird,
      })
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.status, "active"),
          sql`${subscriptions.planId} != 'free'`
        )
      );

    // Import plan pricing
    const { PLANS } = await import("@/lib/stripe");

    // Calculate MRR
    let totalRevenue = 0;
    for (const sub of activeSubscriptions) {
      const plan = PLANS[sub.planId];
      if (!plan) continue;

      // Get the monthly price
      let monthlyPrice: number;
      if (sub.billingInterval === "yearly") {
        // Convert yearly price to monthly equivalent
        const yearlyPrice = sub.isEarlyBird
          ? plan.earlyBirdPriceYearly
          : plan.priceYearly;
        monthlyPrice = yearlyPrice / 12;
      } else {
        monthlyPrice = sub.isEarlyBird
          ? plan.earlyBirdPriceMonthly
          : plan.priceMonthly;
      }

      totalRevenue += monthlyPrice;
    }

    // Recent signups (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentSignupsResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(gte(users.createdAt, sevenDaysAgo));
    const recentSignups = recentSignupsResult[0]?.count || 0;

    return NextResponse.json({
      totalUsers,
      totalDocuments,
      totalPaidUsers,
      totalRevenue: Math.round(totalRevenue), // in cents
      recentSignups,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
