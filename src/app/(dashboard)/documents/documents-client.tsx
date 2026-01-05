"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, MoreHorizontal, Pencil, Copy, Send, Trash2, Eye, User, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

type DocumentStatus = "draft" | "sent" | "viewed" | "signed" | "completed" | "expired" | "declined";
type PaymentStatus = "pending" | "processing" | "succeeded" | "failed" | "refunded" | null;

interface Document {
  id: string;
  title: string;
  status: DocumentStatus;
  recipient: { name: string; email: string };
  createdAt: Date;
  updatedAt: Date;
  lockedAt: Date | null;
  paymentStatus?: PaymentStatus;
  paymentAmount?: number | null;
  createdBy?: {
    id: string;
    name: string | null;
    email: string | null;
  };
  isOwnDocument?: boolean;
}

interface TeamMember {
  id: string;
  name: string | null;
  email: string;
}

interface DocumentsClientProps {
  documents: Document[];
  statusCounts: Record<string, number>;
  isTeamContext?: boolean;
  teamMembers?: TeamMember[];
  canFilterByUser?: boolean;
}

type TabValue = "all" | DocumentStatus;

const tabs: { value: TabValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "completed", label: "Completed" },
];

const statusColors: Record<DocumentStatus, string> = {
  draft: "bg-gray-100 text-gray-800",
  sent: "bg-blue-100 text-blue-800",
  viewed: "bg-yellow-100 text-yellow-800",
  signed: "bg-green-100 text-green-800",
  completed: "bg-green-100 text-green-800",
  expired: "bg-red-100 text-red-800",
  declined: "bg-red-100 text-red-800",
};

// Format relative time
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

// Get activity label based on status
function getActivityLabel(status: DocumentStatus): string {
  switch (status) {
    case "draft": return "Edited";
    case "sent": return "Sent";
    case "viewed": return "Viewed";
    case "signed": return "Signed";
    case "completed": return "Completed";
    case "expired": return "Expired";
    case "declined": return "Declined";
    default: return "Updated";
  }
}

export function DocumentsClient({
  documents,
  statusCounts,
  isTeamContext = false,
  teamMembers = [],
  canFilterByUser = false,
}: DocumentsClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<TabValue>("all");
  const [userFilter, setUserFilter] = React.useState<string>("all");

  // Split docs into "mine" and "team" for team context
  const myDocuments = React.useMemo(
    () => documents.filter((doc) => doc.isOwnDocument),
    [documents]
  );

  const filteredDocuments = React.useMemo(() => {
    let docs = documents;

    // Filter by user (for admins)
    if (userFilter === "mine") {
      docs = docs.filter((doc) => doc.isOwnDocument);
    } else if (userFilter !== "all") {
      docs = docs.filter((doc) => doc.createdBy?.id === userFilter);
    }

    if (activeTab !== "all") {
      docs = docs.filter((doc) => doc.status === activeTab);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      docs = docs.filter(
        (doc) =>
          doc.title.toLowerCase().includes(query) ||
          doc.recipient.name.toLowerCase().includes(query) ||
          doc.recipient.email.toLowerCase().includes(query) ||
          doc.createdBy?.name?.toLowerCase().includes(query) ||
          doc.createdBy?.email?.toLowerCase().includes(query)
      );
    }

    return docs;
  }, [documents, activeTab, searchQuery, userFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Document deleted");
      router.refresh();
    } catch {
      toast.error("Failed to delete document");
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const res = await fetch(`/api/documents/${id}/duplicate`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to duplicate");
      const data = await res.json();
      toast.success("Document duplicated");
      router.push(`/documents/${data.document.id}/edit`);
    } catch {
      toast.error("Failed to duplicate document");
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {isTeamContext ? (
                <>
                  <Users className="h-5 w-5" />
                  Team Documents
                </>
              ) : (
                "All Documents"
              )}
            </CardTitle>
            {isTeamContext && (
              <CardDescription>
                {myDocuments.length} created by you, {documents.length - myDocuments.length} by teammates
              </CardDescription>
            )}
          </div>
          <div className="flex gap-2">
            {isTeamContext && canFilterByUser && teamMembers.length > 0 && (
              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger className="w-[180px]">
                  <User className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by creator" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All team members</SelectItem>
                  <SelectItem value="mine">My documents</SelectItem>
                  <SelectItem value="_separator" disabled className="font-semibold text-muted-foreground">
                    ──────────
                  </SelectItem>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name || member.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
          <TabsList className="mb-4">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
                <span className="ml-1.5 rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                  {statusCounts[tab.value] || 0}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value={activeTab}>
            {filteredDocuments.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No documents found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    {isTeamContext && <TableHead>Created by</TableHead>}
                    <TableHead>Recipient</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((doc) => {
                    const viewUrl = doc.status === "draft"
                      ? `/documents/${doc.id}/edit`
                      : `/documents/${doc.id}`;
                    return (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <Link
                          href={viewUrl}
                          className="font-medium hover:underline"
                        >
                          {doc.title}
                        </Link>
                      </TableCell>
                      {isTeamContext && (
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {doc.isOwnDocument ? (
                              <Badge variant="secondary" className="text-xs">You</Badge>
                            ) : (
                              <span className="text-sm text-muted-foreground">
                                {doc.createdBy?.name || doc.createdBy?.email || "Unknown"}
                              </span>
                            )}
                          </div>
                        </TableCell>
                      )}
                      <TableCell>
                        {doc.recipient.name || doc.recipient.email ? (
                          <div>
                            <div className="text-sm">{doc.recipient.name || "—"}</div>
                            <div className="text-xs text-muted-foreground">
                              {doc.recipient.email}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className={statusColors[doc.status]}>
                            {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                          </Badge>
                          {doc.paymentStatus === "succeeded" && (
                            <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-800 border-emerald-200">
                              Paid {doc.paymentAmount ? `$${(doc.paymentAmount / 100).toFixed(2)}` : ""}
                            </Badge>
                          )}
                          {(doc.status === "sent" || doc.status === "viewed") && !doc.lockedAt && (
                            <Badge variant="outline" className="text-xs border-green-300 text-green-700 bg-green-50">
                              Editable
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <span className="font-medium text-foreground">{getActivityLabel(doc.status)}</span>{" "}
                        {formatRelativeTime(doc.updatedAt)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {doc.status === "draft" ? (
                              <DropdownMenuItem asChild>
                                <Link href={`/documents/${doc.id}/edit`}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                            ) : (
                              <>
                                <DropdownMenuItem asChild>
                                  <Link href={`/documents/${doc.id}`}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View
                                  </Link>
                                </DropdownMenuItem>
                                {(doc.status === "sent" || doc.status === "viewed") && !doc.lockedAt && (
                                  <DropdownMenuItem asChild>
                                    <Link href={`/documents/${doc.id}/edit`}>
                                      <Pencil className="mr-2 h-4 w-4" />
                                      Edit
                                    </Link>
                                  </DropdownMenuItem>
                                )}
                              </>
                            )}
                            <DropdownMenuItem onClick={() => handleDuplicate(doc.id)}>
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicate
                            </DropdownMenuItem>
                            {doc.status === "draft" && (
                              <DropdownMenuItem asChild>
                                <Link href={`/documents/${doc.id}/edit`}>
                                  <Send className="mr-2 h-4 w-4" />
                                  Send
                                </Link>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDelete(doc.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );})}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
