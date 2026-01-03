import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { documents, recipients } from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { DocumentsClient } from "./documents-client";

export default async function DocumentsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch user's documents (not templates)
  const userDocs = await db
    .select({
      id: documents.id,
      title: documents.title,
      status: documents.status,
      createdAt: documents.createdAt,
      updatedAt: documents.updatedAt,
    })
    .from(documents)
    .where(and(eq(documents.userId, session.user.id), eq(documents.isTemplate, false)))
    .orderBy(desc(documents.updatedAt));

  // Get recipients for each document
  const docIds = userDocs.map((d) => d.id);
  const docRecipients =
    docIds.length > 0
      ? await db
          .select({
            documentId: recipients.documentId,
            name: recipients.name,
            email: recipients.email,
          })
          .from(recipients)
          .where(sql`${recipients.documentId} IN ${docIds}`)
      : [];

  // Transform to expected format
  const docsWithRecipients = userDocs.map((doc) => {
    const recipient = docRecipients.find((r) => r.documentId === doc.id);
    return {
      id: doc.id,
      title: doc.title,
      status: doc.status as "draft" | "sent" | "viewed" | "signed" | "completed" | "expired" | "declined",
      recipient: recipient
        ? { name: recipient.name || "", email: recipient.email }
        : { name: "", email: "" },
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  });

  // Count by status
  const statusCounts = {
    all: docsWithRecipients.length,
    draft: docsWithRecipients.filter((d) => d.status === "draft").length,
    sent: docsWithRecipients.filter((d) => d.status === "sent").length,
    viewed: docsWithRecipients.filter((d) => d.status === "viewed").length,
    signed: docsWithRecipients.filter((d) => d.status === "signed").length,
    completed: docsWithRecipients.filter((d) => d.status === "completed").length,
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">
            Manage and track all your proposals and contracts.
          </p>
        </div>
        <Button asChild>
          <Link href="/documents/new">
            <Plus className="mr-2 h-4 w-4" />
            New Document
          </Link>
        </Button>
      </div>

      {/* Documents List */}
      {docsWithRecipients.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="mb-4 h-16 w-16 text-muted-foreground/50" />
            <h3 className="text-xl font-medium">No documents yet</h3>
            <p className="mt-2 text-center text-muted-foreground max-w-sm">
              Create your first document to get started with proposals and contracts.
            </p>
            <Button asChild className="mt-6">
              <Link href="/documents/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Document
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <DocumentsClient documents={docsWithRecipients} statusCounts={statusCounts} />
      )}
    </div>
  );
}
