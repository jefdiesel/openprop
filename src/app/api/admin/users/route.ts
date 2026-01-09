import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { users, subscriptions } from "@/lib/db/schema";
import { sql, or, ilike, desc, eq } from "drizzle-orm";

// GET /api/admin/users - List all users with pagination and search
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
    const search = searchParams.get("search") || "";

    // Validate pagination params
    const validatedPage = Math.max(1, page);
    const validatedLimit = Math.min(Math.max(1, limit), 100); // Max 100 items per page
    const offset = (validatedPage - 1) * validatedLimit;

    // Build where clause for search
    const whereClause = search
      ? or(
          ilike(users.email, `%${search}%`),
          ilike(users.name, `%${search}%`)
        )
      : undefined;

    // Get total count
    const totalCountResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(whereClause);
    const totalCount = totalCountResult[0]?.count || 0;

    // Fetch users with subscription info
    const usersWithSubscriptions = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
        isAdmin: users.isAdmin,
        subscriptionId: subscriptions.id,
        planId: subscriptions.planId,
        status: subscriptions.status,
        billingInterval: subscriptions.billingInterval,
        currentPeriodEnd: subscriptions.currentPeriodEnd,
      })
      .from(users)
      .leftJoin(subscriptions, eq(users.id, subscriptions.userId))
      .where(whereClause)
      .orderBy(desc(users.createdAt))
      .limit(validatedLimit)
      .offset(offset);

    // Format the results
    const formattedUsers = usersWithSubscriptions.map((user) => ({
      id: user.id,
      name: user.name || "",
      email: user.email,
      createdAt: user.createdAt.toISOString(),
      isAdmin: user.isAdmin,
      subscription: user.subscriptionId
        ? {
            planId: user.planId,
            status: user.status,
            billingInterval: user.billingInterval,
            currentPeriodEnd: user.currentPeriodEnd?.toISOString() || null,
          }
        : null,
    }));

    return NextResponse.json({
      users: formattedUsers,
      pagination: {
        page: validatedPage,
        limit: validatedLimit,
        totalCount,
        totalPages: Math.ceil(totalCount / validatedLimit),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
