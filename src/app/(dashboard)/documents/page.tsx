import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { documents, recipients, profiles, users, organizationMembers } from "@/lib/db/schema";
import { eq, and, desc, sql, isNull, or } from "drizzle-orm";
import { DocumentsClient } from "./documents-client";
import { ExportDropdown } from "@/components/dashboard/export-dropdown";

export default async function DocumentsPage() {
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

  // Build query based on context
  // Team context: show all team documents
  // Personal context: show user's personal documents (no org)
  const isTeamContext = !!profile?.currentOrganizationId;
  const whereClause = isTeamContext
    ? and(
        eq(documents.organizationId, profile.currentOrganizationId!),
        eq(documents.isTemplate, false)
      )
    : and(
        eq(documents.userId, session.user.id),
        isNull(documents.organizationId),
        eq(documents.isTemplate, false)
      );

  // Get user's role in the team (for admin filter)
  let userRole: 'owner' | 'admin' | 'member' | null = null;
  let teamMembers: { id: string; name: string | null; email: string }[] = [];

  if (isTeamContext) {
    const [membership] = await db
      .select({ role: organizationMembers.role })
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, profile.currentOrganizationId!),
          eq(organizationMembers.userId, session.user.id),
          eq(organizationMembers.status, 'active')
        )
      )
      .limit(1);
    userRole = membership?.role || null;

    // Get team members for filter dropdown (admins/owners only)
    if (userRole === 'owner' || userRole === 'admin') {
      teamMembers = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
        })
        .from(organizationMembers)
        .innerJoin(users, eq(organizationMembers.userId, users.id))
        .where(
          and(
            eq(organizationMembers.organizationId, profile.currentOrganizationId!),
            eq(organizationMembers.status, 'active')
          )
        );
    }
  }

  // Fetch documents based on context with creator info
  const userDocs = await db
    .select({
      id: documents.id,
      title: documents.title,
      status: documents.status,
      createdAt: documents.createdAt,
      updatedAt: documents.updatedAt,
      lockedAt: documents.lockedAt,
      userId: documents.userId,
      creatorName: users.name,
      creatorEmail: users.email,
    })
    .from(documents)
    .leftJoin(users, eq(documents.userId, users.id))
    .where(whereClause)
    .orderBy(desc(documents.updatedAt));

  // Get recipients for each document (with payment info)
  const docIds = userDocs.map((d) => d.id);
  const docRecipients =
    docIds.length > 0
      ? await db
          .select({
            documentId: recipients.documentId,
            name: recipients.name,
            email: recipients.email,
            paymentStatus: recipients.paymentStatus,
            paymentAmount: recipients.paymentAmount,
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
      lockedAt: doc.lockedAt,
      paymentStatus: recipient?.paymentStatus as "pending" | "processing" | "succeeded" | "failed" | "refunded" | null,
      paymentAmount: recipient?.paymentAmount || null,
      createdBy: {
        id: doc.userId,
        name: doc.creatorName,
        email: doc.creatorEmail,
      },
      isOwnDocument: doc.userId === session.user!.id,
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
        <div className="flex gap-3">
          <ExportDropdown />
          <Button asChild>
            <Link href="/documents/new">
              <Plus className="mr-2 h-4 w-4" />
              New Document
            </Link>
          </Button>
        </div>
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
        <DocumentsClient
          documents={docsWithRecipients}
          statusCounts={statusCounts}
          isTeamContext={isTeamContext}
          teamMembers={teamMembers}
          canFilterByUser={userRole === 'owner' || userRole === 'admin'}
        />
      )}
    </div>
  );
}
