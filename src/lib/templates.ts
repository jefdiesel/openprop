import { db } from "@/lib/db"
import { documents, subscriptions } from "@/lib/db/schema"
import { eq, and, count } from "drizzle-orm"
import { PLANS, type PlanId } from "@/lib/stripe"

interface CanCreateTemplateResult {
  allowed: boolean
  current: number
  limit: number
  reason?: string
}

// Check if user can create a new template
export async function canCreateTemplate(userId: string): Promise<CanCreateTemplateResult> {
  // Get user's subscription
  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1)

  const planId: PlanId = (subscription?.planId as PlanId) || 'free'
  const plan = PLANS[planId]
  const maxTemplates = plan?.limits?.maxTemplates ?? 0

  // Get current template count for user
  const [result] = await db
    .select({ count: count() })
    .from(documents)
    .where(
      and(
        eq(documents.userId, userId),
        eq(documents.isTemplate, true)
      )
    )

  const currentCount = result?.count ?? 0

  // -1 means unlimited
  if (maxTemplates === -1) {
    return { allowed: true, current: currentCount, limit: -1 }
  }

  // 0 means no templates allowed (free tier)
  if (maxTemplates === 0) {
    return {
      allowed: false,
      current: currentCount,
      limit: 0,
      reason: "Upgrade to Team or Business plan to create custom templates"
    }
  }

  // Check against limit
  if (currentCount >= maxTemplates) {
    return {
      allowed: false,
      current: currentCount,
      limit: maxTemplates,
      reason: `Template limit reached (${currentCount}/${maxTemplates}). Upgrade to Business for unlimited templates.`
    }
  }

  return { allowed: true, current: currentCount, limit: maxTemplates }
}

// Get template usage stats for a user
export async function getTemplateUsage(userId: string): Promise<{
  current: number
  limit: number
  planId: PlanId
}> {
  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1)

  const planId: PlanId = (subscription?.planId as PlanId) || 'free'
  const plan = PLANS[planId]
  const maxTemplates = plan?.limits?.maxTemplates ?? 0

  const [result] = await db
    .select({ count: count() })
    .from(documents)
    .where(
      and(
        eq(documents.userId, userId),
        eq(documents.isTemplate, true)
      )
    )

  return {
    current: result?.count ?? 0,
    limit: maxTemplates,
    planId
  }
}
