"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Download, Check, Clock, Eye, X, History, Lock, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DocumentViewer } from "@/components/signing/document-viewer";
import { ActivityTimeline } from "@/components/documents/activity-timeline";
import { DocumentAnalytics } from "@/components/documents/document-analytics";
import { VerificationSection } from "@/components/blockchain";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Block as DbBlock } from "@/types/database";

interface Recipient {
  id: string;
  name: string | null;
  email: string;
  role: string;
  status: string;
  signedAt: string | null;
}

interface DocumentData {
  id: string;
  title: string;
  status: string;
  content: DbBlock[];
  createdAt: string;
  updatedAt: string;
  sentAt: string | null;
  lockedAt: string | null;
  currentVersion: number;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  draft: { color: "bg-gray-100 text-gray-800", icon: <Clock className="h-3 w-3" />, label: "Draft" },
  sent: { color: "bg-blue-100 text-blue-800", icon: <Clock className="h-3 w-3" />, label: "Sent" },
  viewed: { color: "bg-yellow-100 text-yellow-800", icon: <Eye className="h-3 w-3" />, label: "Viewed" },
  signed: { color: "bg-green-100 text-green-800", icon: <Check className="h-3 w-3" />, label: "Signed" },
  completed: { color: "bg-green-100 text-green-800", icon: <Check className="h-3 w-3" />, label: "Completed" },
  expired: { color: "bg-red-100 text-red-800", icon: <X className="h-3 w-3" />, label: "Expired" },
  declined: { color: "bg-red-100 text-red-800", icon: <X className="h-3 w-3" />, label: "Declined" },
};

export default function DocumentViewPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [document, setDocument] = useState<DocumentData | null>(null);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDocument() {
      try {
        const res = await fetch(`/api/documents/${resolvedParams.id}?include_recipients=true`);
        if (!res.ok) throw new Error("Failed to load document");
        const data = await res.json();
        // Map API response to our format
        setDocument({
          id: data.document.id,
          title: data.document.title,
          status: data.document.status,
          content: data.document.content || [],
          createdAt: data.document.created_at,
          updatedAt: data.document.updated_at,
          sentAt: data.document.sent_at,
          lockedAt: data.document.locked_at,
          currentVersion: data.document.current_version || 1,
        });
        // Map recipients
        const mappedRecipients = (data.recipients || []).map((r: any) => ({
          id: r.id,
          name: r.name,
          email: r.email,
          role: r.role,
          status: r.status,
          signedAt: r.signed_at,
        }));
        setRecipients(mappedRecipients);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load document");
      } finally {
        setIsLoading(false);
      }
    }
    fetchDocument();
  }, [resolvedParams.id]);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">{error || "Document not found"}</p>
          <Button variant="outline" className="mt-4" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const status = statusConfig[document.status] || statusConfig.draft;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/documents">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{document.title}</h1>
              <Badge variant="secondary" className={status.color}>
                {status.icon}
                <span className="ml-1">{status.label}</span>
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Last updated {new Date(document.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {/* History button - show if we have versions */}
          {document.currentVersion > 1 && (
            <Button variant="outline" asChild>
              <Link href={`/documents/${document.id}/history`}>
                <History className="mr-2 h-4 w-4" />
                History
              </Link>
            </Button>
          )}

          {/* Edit button - show for drafts and unlocked sent/viewed docs */}
          {(document.status === "draft" ||
            ((document.status === "sent" || document.status === "viewed") && !document.lockedAt)) && (
            <Button asChild>
              <Link href={`/documents/${document.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
          )}

          {/* Show locked indicator for locked docs */}
          {document.lockedAt && (document.status === "sent" || document.status === "viewed") && (
            <Badge variant="secondary" className="bg-amber-100 text-amber-800 flex items-center gap-1">
              <Lock className="h-3 w-3" />
              Locked (signed)
            </Badge>
          )}
        </div>
      </div>

      {/* Blockchain Verification Section */}
      <VerificationSection
        documentId={document.id}
        documentTitle={document.title}
        documentStatus={document.status}
      />

      {/* Recipient info for signed/completed documents */}
      {recipients.length > 0 && (
        <Card>
          <CardContent className="py-4">
            <h3 className="font-medium mb-3">Recipients</h3>
            <div className="space-y-2">
              {recipients.map((recipient) => (
                <div key={recipient.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{recipient.name || recipient.email}</p>
                    {recipient.name && (
                      <p className="text-sm text-muted-foreground">{recipient.email}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={
                        recipient.status === "signed"
                          ? "bg-green-100 text-green-800"
                          : recipient.status === "viewed"
                          ? "bg-yellow-100 text-yellow-800"
                          : recipient.status === "declined"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }
                    >
                      {recipient.status === "signed" && <Check className="h-3 w-3 mr-1" />}
                      {recipient.status.charAt(0).toUpperCase() + recipient.status.slice(1)}
                    </Badge>
                    {recipient.signedAt && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(recipient.signedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Document content and Activity Timeline side by side on larger screens */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Document content - takes 2/3 of width on large screens */}
        <Card className="overflow-hidden lg:col-span-2">
          <CardContent className="p-0">
            <div className="max-h-[70vh] overflow-auto">
              <DocumentViewer
                content={document.content}
                title=""
                mode="view"
                className="border-0"
              />
            </div>
          </CardContent>
        </Card>

        {/* Activity & Analytics - takes 1/3 of width on large screens */}
        <div className="lg:col-span-1">
          <Tabs defaultValue="activity" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="activity">
                <Clock className="mr-2 h-4 w-4" />
                Activity
              </TabsTrigger>
              <TabsTrigger value="analytics">
                <BarChart3 className="mr-2 h-4 w-4" />
                Analytics
              </TabsTrigger>
            </TabsList>
            <TabsContent value="activity" className="mt-4">
              <ActivityTimeline documentId={document.id} />
            </TabsContent>
            <TabsContent value="analytics" className="mt-4">
              <DocumentAnalytics documentId={document.id} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
