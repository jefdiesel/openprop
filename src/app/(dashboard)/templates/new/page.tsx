import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { documents, subscriptions } from "@/lib/db/schema"
import { eq, and, count } from "drizzle-orm"
import { PLANS, type PlanId } from "@/lib/stripe"

export default async function NewTemplatePage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  // Get user's subscription
  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, session.user.id))
    .limit(1)

  const planId: PlanId = (subscription?.planId as PlanId) || "free"
  const plan = PLANS[planId]
  const limits = plan.limits

  // Check if user can create templates
  if (limits.maxTemplates === 0) {
    redirect("/pricing")
  }

  // If there's a limit, check current template count
  if (limits.maxTemplates !== -1) {
    const [{ total }] = await db
      .select({ total: count() })
      .from(documents)
      .where(
        and(
          eq(documents.userId, session.user.id),
          eq(documents.isTemplate, true)
        )
      )

    if (total >= limits.maxTemplates) {
      redirect("/pricing")
    }
  }

  // Create a new blank template
  const [newTemplate] = await db
    .insert(documents)
    .values({
      userId: session.user.id,
      title: "Untitled Template",
      status: "draft",
      content: [],
      variables: {},
      settings: {},
      isTemplate: true,
      templateCategory: "Custom",
    })
    .returning()

  // Redirect to the editor
  redirect(`/documents/${newTemplate.id}/edit`)
}
