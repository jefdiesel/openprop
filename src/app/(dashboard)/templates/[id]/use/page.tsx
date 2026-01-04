import { redirect, notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { documents, profiles } from "@/lib/db/schema"
import { eq, and, or, isNull } from "drizzle-orm"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function UseTemplatePage({ params }: PageProps) {
  const resolvedParams = await params
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  // Get user's current organization context
  const [profile] = await db
    .select({ currentOrganizationId: profiles.currentOrganizationId })
    .from(profiles)
    .where(eq(profiles.id, session.user.id))
    .limit(1)

  // Fetch the template (user's own or team's)
  const templateCondition = profile?.currentOrganizationId
    ? or(
        eq(documents.userId, session.user.id),
        eq(documents.organizationId, profile.currentOrganizationId)
      )
    : eq(documents.userId, session.user.id)

  const [template] = await db
    .select()
    .from(documents)
    .where(
      and(
        eq(documents.id, resolvedParams.id),
        templateCondition,
        eq(documents.isTemplate, true)
      )
    )
    .limit(1)

  if (!template) {
    notFound()
  }

  // Create a new document from the template (in team context if applicable)
  const [newDocument] = await db
    .insert(documents)
    .values({
      userId: session.user.id,
      organizationId: profile?.currentOrganizationId || null,
      title: `${template.title} (Copy)`,
      status: "draft",
      content: template.content,
      variables: template.variables,
      settings: template.settings,
      isTemplate: false,
    })
    .returning()

  // Redirect to the editor
  redirect(`/documents/${newDocument.id}/edit`)
}
