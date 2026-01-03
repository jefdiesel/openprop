import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { documents } from "@/lib/db/schema"

export default async function NewTemplatePage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
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
