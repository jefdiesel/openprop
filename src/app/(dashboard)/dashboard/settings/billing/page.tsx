"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import {
  Check,
  CreditCard,
  Loader2,
  Sparkles,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PLANS, ADD_ONS, formatCurrency, type PlanId } from "@/lib/stripe"

interface SubscriptionData {
  subscription: {
    plan_id: PlanId
    status: string
    is_early_bird: boolean
    billing_interval: "monthly" | "yearly"
    current_period_end: string | null
    cancel_at_period_end: boolean
  }
  plan: (typeof PLANS)[PlanId]
  earlyBird: {
    isEarlyBird: boolean
    slotNumber?: number
    slotsRemaining: number
  }
  limits: (typeof PLANS)[PlanId]["limits"]
}

function BillingPageContent() {
  const searchParams = useSearchParams()
  const [data, setData] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState<string | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)

  const success = searchParams.get("success")
  const canceled = searchParams.get("canceled")

  useEffect(() => {
    fetchSubscription()
  }, [])

  async function fetchSubscription() {
    try {
      const res = await fetch("/api/billing/subscription")
      const json = await res.json()
      setData(json)
    } catch (error) {
      console.error("Failed to fetch subscription:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleUpgrade(planId: PlanId, interval: "monthly" | "yearly" = "monthly") {
    setUpgrading(planId)
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, interval }),
      })
      const { url } = await res.json()
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error("Failed to start checkout:", error)
    } finally {
      setUpgrading(null)
    }
  }

  async function handleManageBilling() {
    setPortalLoading(true)
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" })
      const { url } = await res.json()
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error("Failed to open billing portal:", error)
    } finally {
      setPortalLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    )
  }

  const currentPlan = data?.subscription.plan_id || "free"
  const isEarlyBird = data?.earlyBird.isEarlyBird
  const earlyBirdSlotsRemaining = data?.earlyBird.slotsRemaining || 0

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Manage your subscription and billing
        </p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-200">
          <Check className="h-5 w-5" />
          <span>Your subscription has been updated successfully!</span>
        </div>
      )}
      {canceled && (
        <div className="flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
          <AlertCircle className="h-5 w-5" />
          <span>Checkout was canceled. No changes were made.</span>
        </div>
      )}

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>
                {data?.subscription.cancel_at_period_end
                  ? "Your subscription will end on "
                  : "Your subscription renews on "}
                {data?.subscription.current_period_end
                  ? new Date(data.subscription.current_period_end).toLocaleDateString()
                  : "N/A"}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {isEarlyBird && (
                <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                  <Sparkles className="mr-1 h-3 w-3" />
                  Early Bird #{data?.earlyBird.slotNumber}
                </Badge>
              )}
              <Badge variant={currentPlan === "free" ? "secondary" : "default"}>
                {PLANS[currentPlan].name}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">
              {formatCurrency(
                isEarlyBird
                  ? PLANS[currentPlan].earlyBirdPriceMonthly
                  : PLANS[currentPlan].priceMonthly,
                "usd"
              )}
            </span>
            <span className="text-zinc-500">/month</span>
          </div>
          <ul className="mt-4 space-y-2">
            {PLANS[currentPlan].features.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-600" />
                {feature}
              </li>
            ))}
          </ul>
        </CardContent>
        {currentPlan !== "free" && (
          <CardFooter>
            <Button
              variant="outline"
              onClick={handleManageBilling}
              disabled={portalLoading}
            >
              {portalLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CreditCard className="mr-2 h-4 w-4" />
              )}
              Manage Billing
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Early Bird Banner */}
      {earlyBirdSlotsRemaining > 0 && currentPlan === "free" && (
        <div className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            <span className="font-semibold">Early Bird Special</span>
          </div>
          <p className="mt-2 text-amber-100">
            {earlyBirdSlotsRemaining} of 100 spots remaining at 50% off forever!
          </p>
        </div>
      )}

      {/* Available Plans */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Available Plans</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {(Object.keys(PLANS) as PlanId[]).map((planId) => {
            const plan = PLANS[planId]
            const isCurrent = planId === currentPlan
            const canUpgrade = planId !== "free" && !isCurrent
            const showEarlyBird = earlyBirdSlotsRemaining > 0 && planId !== "free"

            return (
              <Card
                key={planId}
                className={
                  isCurrent
                    ? "border-green-600 ring-1 ring-green-600"
                    : ""
                }
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{plan.name}</CardTitle>
                    {isCurrent && (
                      <Badge variant="secondary">Current</Badge>
                    )}
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    {showEarlyBird ? (
                      <>
                        <span className="text-2xl font-bold">
                          {formatCurrency(plan.earlyBirdPriceMonthly, "usd")}
                        </span>
                        <span className="text-sm text-zinc-400 line-through">
                          {formatCurrency(plan.priceMonthly, "usd")}
                        </span>
                      </>
                    ) : (
                      <span className="text-2xl font-bold">
                        {formatCurrency(plan.priceMonthly, "usd")}
                      </span>
                    )}
                    <span className="text-zinc-500">/mo</span>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {plan.features.slice(0, 4).map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  {planId === "free" ? (
                    <Button variant="outline" className="w-full" disabled>
                      {isCurrent ? "Current Plan" : "Self-Host Free"}
                    </Button>
                  ) : (
                    <Button
                      className={`w-full ${
                        showEarlyBird
                          ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                          : ""
                      }`}
                      variant={isCurrent ? "outline" : "default"}
                      disabled={isCurrent || upgrading === planId}
                      onClick={() => handleUpgrade(planId)}
                    >
                      {upgrading === planId ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      {isCurrent
                        ? "Current Plan"
                        : canUpgrade
                        ? showEarlyBird
                          ? "Claim Early Bird"
                          : "Upgrade"
                        : "Get Started"}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Blockchain Add-on */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Blockchain Audit Trail</CardTitle>
              <CardDescription>
                Immutable proof of signing on Base L2
              </CardDescription>
            </div>
            <Badge variant="outline">Add-on</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">
              {formatCurrency(ADD_ONS.blockchain_audit.priceMonthly, "usd")}
            </span>
            <span className="text-zinc-500">/month</span>
          </div>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Every signed document is hashed to the blockchain with a verifiable timestamp.
            Perfect for legal compliance, contracts, and high-stakes documents.
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" disabled={currentPlan === "free"}>
            {currentPlan === "free" ? "Upgrade to add" : "Add to subscription"}
          </Button>
        </CardFooter>
      </Card>

      {/* Plan Limits */}
      {data?.limits && (
        <Card>
          <CardHeader>
            <CardTitle>Your Plan Limits</CardTitle>
            <CardDescription>
              What&apos;s included in your current plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <span className="text-sm">Custom Branding</span>
                {data.limits.customBranding ? (
                  <Check className="h-5 w-5 text-green-600" />
                ) : (
                  <span className="text-sm text-zinc-400">Pro+</span>
                )}
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <span className="text-sm">Remove Watermark</span>
                {data.limits.removeWatermark ? (
                  <Check className="h-5 w-5 text-green-600" />
                ) : (
                  <span className="text-sm text-zinc-400">Business</span>
                )}
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <span className="text-sm">Workspaces</span>
                <span className="text-sm font-medium">{data.limits.workspaces}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <span className="text-sm">API Access</span>
                {data.limits.apiAccess ? (
                  <Check className="h-5 w-5 text-green-600" />
                ) : (
                  <span className="text-sm text-zinc-400">-</span>
                )}
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <span className="text-sm">Priority Support</span>
                {data.limits.prioritySupport ? (
                  <Check className="h-5 w-5 text-green-600" />
                ) : (
                  <span className="text-sm text-zinc-400">Pro+</span>
                )}
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <span className="text-sm">Analytics Dashboard</span>
                {data.limits.analytics ? (
                  <Check className="h-5 w-5 text-green-600" />
                ) : (
                  <span className="text-sm text-zinc-400">Business</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default function BillingPage() {
  return (
    <Suspense fallback={
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    }>
      <BillingPageContent />
    </Suspense>
  )
}
