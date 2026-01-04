import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { documents, profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function NewDocumentPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Get user's current organization context
  const [profile] = await db
    .select({ currentOrganizationId: profiles.currentOrganizationId })
    .from(profiles)
    .where(eq(profiles.id, session.user.id))
    .limit(1);

  // Create a new blank document (in team context if applicable)
  const [newDocument] = await db
    .insert(documents)
    .values({
      userId: session.user.id,
      organizationId: profile?.currentOrganizationId || null,
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
