import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { earlyBirdSlots } from "@/lib/db/schema"
import { auth } from "@/lib/auth"
import { count } from "drizzle-orm"
import {
  createSubscriptionCheckout,
  PLANS,
  ADD_ONS,
  type PlanId,
} from "@/lib/stripe"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const userId = session?.user?.id
    const userEmail = session?.user?.email

    if (!userId || !userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { planId, interval = "monthly", addBlockchain = false } = body as {
      planId: PlanId
      interval?: "monthly" | "yearly"
      addBlockchain?: boolean
    }

    // Validate plan
    const plan = PLANS[planId]
    if (!plan || planId === "free") {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }

    // Check early bird availability
    const [{ total }] = await db.select({ total: count() }).from(earlyBirdSlots)
    const earlyBirdSlotsRemaining = 100 - (total || 0)
    const isEarlyBird = earlyBirdSlotsRemaining > 0

    // Get price ID based on interval and early bird status
    let priceId: string | null
    if (isEarlyBird) {
      priceId = interval === "yearly"
        ? plan.earlyBirdPriceIdYearly
        : plan.earlyBirdPriceIdMonthly
    } else {
      priceId = interval === "yearly"
        ? plan.stripePriceIdYearly
        : plan.stripePriceIdMonthly
    }

    if (!priceId) {
      return NextResponse.json(
        { error: "Stripe price not configured for this plan" },
        { status: 500 }
      )
    }

    // Get add-on price IDs
    const addOnPriceIds: string[] = []
    if (addBlockchain && ADD_ONS.blockchain_audit.stripePriceIdMonthly) {
      addOnPriceIds.push(ADD_ONS.blockchain_audit.stripePriceIdMonthly)
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    const { url } = await createSubscriptionCheckout({
      userId,
      email: userEmail,
      priceId,
      successUrl: `${baseUrl}/dashboard/settings/billing?success=true`,
      cancelUrl: `${baseUrl}/dashboard/settings/billing?canceled=true`,
      isEarlyBird,
      addOnPriceIds,
    })

    return NextResponse.json({ url })
  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}
