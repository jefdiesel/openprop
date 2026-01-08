"use client"

import { useEffect, useState, useCallback } from "react"
import { PLANS, type PlanId } from "@/lib/stripe"

interface SubscriptionState {
  planId: PlanId
  status: string
  isEarlyBird: boolean
  billingInterval: "monthly" | "yearly"
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  limits: {
    customBranding: boolean
    removeWatermark: boolean
    workspaces: number
    apiAccess: boolean
    prioritySupport: boolean
    analytics: boolean
    maxSeats: number
    storageGb: number
    maxTemplates: number
  }
  loading: boolean
  error: string | null
}

const defaultLimits = PLANS.free.limits

export function useSubscription() {
  const [state, setState] = useState<SubscriptionState>({
    planId: "free",
    status: "active",
    isEarlyBird: false,
    billingInterval: "monthly",
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    limits: defaultLimits,
    loading: true,
    error: null,
  })

  const fetchSubscription = useCallback(async () => {
    try {
      const res = await fetch("/api/billing/subscription")
      if (!res.ok) throw new Error("Failed to fetch subscription")

      const data = await res.json()
      setState({
        planId: data.subscription.plan_id,
        status: data.subscription.status,
        isEarlyBird: data.subscription.is_early_bird,
        billingInterval: data.subscription.billing_interval,
        currentPeriodEnd: data.subscription.current_period_end,
        cancelAtPeriodEnd: data.subscription.cancel_at_period_end,
        limits: data.limits,
        loading: false,
        error: null,
      })
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }))
    }
  }, [])

  useEffect(() => {
    fetchSubscription()
  }, [fetchSubscription])

  // Helper functions for checking limits
  const canRemoveBranding = state.limits.removeWatermark
  const canUseCustomBranding = state.limits.customBranding
  const canAccessAnalytics = state.limits.analytics
  const canAccessApi = state.limits.apiAccess
  const hasPrioritySupport = state.limits.prioritySupport
  const maxWorkspaces = state.limits.workspaces
  const canCreateTemplates = state.limits.maxTemplates !== 0
  const maxTemplates = state.limits.maxTemplates

  const isPaidPlan = state.planId !== "free"
  const isProPlan = state.planId === "pro"
  const isBusinessPlan = state.planId === "business"

  return {
    ...state,
    refetch: fetchSubscription,
    // Limit checks
    canRemoveBranding,
    canUseCustomBranding,
    canAccessAnalytics,
    canAccessApi,
    hasPrioritySupport,
    maxWorkspaces,
    canCreateTemplates,
    maxTemplates,
    // Plan checks
    isPaidPlan,
    isProPlan,
    isBusinessPlan,
  }
}

// Server-side subscription check
export async function getSubscriptionLimits(userId: string) {
  // This would be called from server components/actions
  // For now, return default limits - would integrate with Drizzle/database
  return PLANS.free.limits
}
