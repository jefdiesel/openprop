import Link from "next/link";
import { redirect } from "next/navigation";
import {
  FileText,
  Clock,
  CheckCircle,
  DollarSign,
  Plus,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/dashboard/stats-card";
import {
  DocumentList,
  type Document,
} from "@/components/dashboard/document-list";
import {
  ActivityFeed,
  type Activity,
} from "@/components/dashboard/activity-feed";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { documents, recipients, documentEvents, payments } from "@/lib/db/schema";
import { eq, desc, and, count, sql } from "drizzle-orm";

async function getDashboardData(userId: string) {
  // Get document counts by status
  const [sentCount] = await db
    .select({ count: count() })
    .from(documents)
    .where(and(eq(documents.userId, userId), eq(documents.status, "sent")));

  const [completedCount] = await db
    .select({ count: count() })
    .from(documents)
    .where(and(eq(documents.userId, userId), eq(documents.status, "completed")));

  // Get pending signatures count (documents that are sent but not completed)
  const pendingDocs = await db
    .select({ id: documents.id })
    .from(documents)
    .where(
      and(
        eq(documents.userId, userId),
        sql`${documents.status} IN ('sent', 'viewed')`
      )
    );

  // Get total revenue from completed payments
  const [revenueResult] = await db
    .select({ total: sql<number>`COALESCE(SUM(${payments.amount}), 0)` })
    .from(payments)
    .innerJoin(documents, eq(payments.documentId, documents.id))
    .where(and(eq(documents.userId, userId), eq(payments.status, "succeeded")));

  // Get recent documents with recipients
  const recentDocs = await db
    .select({
      id: documents.id,
      title: documents.title,
      status: documents.status,
      createdAt: documents.createdAt,
      updatedAt: documents.updatedAt,
    })
    .from(documents)
    .where(and(eq(documents.userId, userId), eq(documents.isTemplate, false)))
    .orderBy(desc(documents.updatedAt))
    .limit(5);

  // Get recipients for recent documents
  const docIds = recentDocs.map((d) => d.id);
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

  // Get recent activity
  const recentEvents = await db
    .select({
      id: documentEvents.id,
      eventType: documentEvents.eventType,
      createdAt: documentEvents.createdAt,
      documentId: documentEvents.documentId,
      recipientId: documentEvents.recipientId,
    })
    .from(documentEvents)
    .innerJoin(documents, eq(documentEvents.documentId, documents.id))
    .where(eq(documents.userId, userId))
    .orderBy(desc(documentEvents.createdAt))
    .limit(5);

  // Get document titles and recipient names for events
  const eventDocIds = recentEvents.map((e) => e.documentId);
  const eventRecipientIds = recentEvents
    .map((e) => e.recipientId)
    .filter(Boolean) as string[];

  const eventDocs =
    eventDocIds.length > 0
      ? await db
          .select({ id: documents.id, title: documents.title })
          .from(documents)
          .where(sql`${documents.id} IN ${eventDocIds}`)
      : [];

  const eventRecipients =
    eventRecipientIds.length > 0
      ? await db
          .select({ id: recipients.id, name: recipients.name, email: recipients.email })
          .from(recipients)
          .where(sql`${recipients.id} IN ${eventRecipientIds}`)
      : [];

  return {
    stats: {
      documentsSent: (sentCount?.count || 0) + (completedCount?.count || 0),
      pendingSignatures: pendingDocs.length,
      completed: completedCount?.count || 0,
      revenue: (revenueResult?.total || 0) / 100, // Convert cents to dollars
    },
    recentDocuments: recentDocs.map((doc) => {
      const recipient = docRecipients.find((r) => r.documentId === doc.id);
      return {
        id: doc.id,
        title: doc.title,
        status: doc.status as Document["status"],
        recipient: recipient
          ? { name: recipient.name || "", email: recipient.email }
          : { name: "", email: "" },
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      };
    }),
    recentActivity: recentEvents.map((event) => {
      const doc = eventDocs.find((d) => d.id === event.documentId);
      const recipient = event.recipientId
        ? eventRecipients.find((r) => r.id === event.recipientId)
        : null;
      return {
        id: event.id,
        type: event.eventType as Activity["type"],
        documentTitle: doc?.title || "Unknown Document",
        recipientName: recipient?.name || recipient?.email || "Unknown",
        timestamp: event.createdAt,
      };
    }),
  };
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { stats, recentDocuments, recentActivity } = await getDashboardData(
    session.user.id
  );
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s what&apos;s happening with your proposals.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/templates">
              <FolderOpen className="mr-2 h-4 w-4" />
              New from Template
            </Link>
          </Button>
          <Button asChild>
            <Link href="/documents/new">
              <Plus className="mr-2 h-4 w-4" />
              New Document
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Documents Sent"
          value={stats.documentsSent}
          icon={FileText}
          description="Total documents"
        />
        <StatsCard
          title="Pending Signatures"
          value={stats.pendingSignatures}
          icon={Clock}
          description="Awaiting response"
        />
        <StatsCard
          title="Completed"
          value={stats.completed}
          icon={CheckCircle}
          description="Signed documents"
        />
        <StatsCard
          title="Revenue"
          value={stats.revenue > 0 ? `$${stats.revenue.toLocaleString()}` : "$0"}
          icon={DollarSign}
          description="Total collected"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Documents */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Documents</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/documents">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <DocumentList documents={recentDocuments} />
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityFeed activities={recentActivity} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
