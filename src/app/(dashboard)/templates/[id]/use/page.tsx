import { redirect, notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { documents } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function UseTemplatePage({ params }: PageProps) {
  const resolvedParams = await params
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  // Fetch the template
  const [template] = await db
    .select()
    .from(documents)
    .where(
      and(
        eq(documents.id, resolvedParams.id),
        eq(documents.userId, session.user.id),
        eq(documents.isTemplate, true)
      )
    )
    .limit(1)

  if (!template) {
    notFound()
  }

  // Create a new document from the template
  const [newDocument] = await db
    .insert(documents)
    .values({
      userId: session.user.id,
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
