import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { subscriptions, subscriptionAddons, earlyBirdSlots } from "@/lib/db/schema"
import { auth } from "@/lib/auth"
import { eq, count } from "drizzle-orm"
import { PLANS, type PlanId } from "@/lib/stripe"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get subscription
    const [subscription] = await db.select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .limit(1)

    // Get subscription addons if subscription exists
    let addons: Array<typeof subscriptionAddons.$inferSelect> = []
    if (subscription) {
      addons = await db.select()
        .from(subscriptionAddons)
        .where(eq(subscriptionAddons.subscriptionId, subscription.id))
    }

    // Get early bird status
    const [earlyBirdSlot] = await db.select()
      .from(earlyBirdSlots)
      .where(eq(earlyBirdSlots.userId, userId))
      .limit(1)

    // Get remaining early bird slots
    const [{ total }] = await db.select({ total: count() }).from(earlyBirdSlots)
    const earlyBirdSlotsRemaining = 100 - (total || 0)

    // Default to free plan if no subscription
    const planId: PlanId = (subscription?.planId as PlanId) || "free"
    const plan = PLANS[planId]

    // Transform subscription to expected format
    const subscriptionData = subscription ? {
      id: subscription.id,
      userId: subscription.userId,
      stripeCustomerId: subscription.stripeCustomerId,
      stripeSubscriptionId: subscription.stripeSubscriptionId,
      planId: subscription.planId,
      status: subscription.status,
      isEarlyBird: subscription.isEarlyBird,
      billingInterval: subscription.billingInterval,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      canceledAt: subscription.canceledAt,
    } : {
      planId: "free",
      status: "active",
      isEarlyBird: false,
      billingInterval: "monthly",
    }

    return NextResponse.json({
      subscription: subscriptionData,
      plan,
      addons: addons.map(a => ({
        id: a.id,
        subscriptionId: a.subscriptionId,
        addonId: a.addonId,
        stripeSubscriptionItemId: a.stripeSubscriptionItemId,
        status: a.status,
        createdAt: a.createdAt,
      })),
      earlyBird: {
        isEarlyBird: !!earlyBirdSlot,
        slotNumber: earlyBirdSlot?.slotNumber,
        slotsRemaining: earlyBirdSlotsRemaining,
      },
      limits: plan.limits,
    })
  } catch (error) {
    console.error("Subscription fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    )
  }
}
