import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema";

export default async function NewDocumentPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Create a new blank document
  const [newDocument] = await db
    .insert(documents)
    .values({
      userId: session.user.id,
      title: "Untitled Document",
      status: "draft",
      content: [],
      variables: {},
      settings: {},
      isTemplate: false,
    })
    .returning();

  // Redirect to the editor
  redirect(`/documents/${newDocument.id}/edit`);
}
