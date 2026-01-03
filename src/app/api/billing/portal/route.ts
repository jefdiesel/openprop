import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { subscriptions } from "@/lib/db/schema"
import { auth } from "@/lib/auth"
import { eq } from "drizzle-orm"
import { createBillingPortalSession } from "@/lib/stripe"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's subscription to find their Stripe customer ID
    const [subscription] = await db.select({ stripeCustomerId: subscriptions.stripeCustomerId })
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .limit(1)

    if (!subscription?.stripeCustomerId) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      )
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    const url = await createBillingPortalSession(
      subscription.stripeCustomerId,
      `${baseUrl}/dashboard/settings/billing`
    )

    return NextResponse.json({ url })
  } catch (error) {
    console.error("Portal error:", error)
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    )
  }
}
