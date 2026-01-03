"use client";

import * as React from "react";
import Link from "next/link";
import {
  MoreHorizontal,
  FileText,
  Edit,
  Copy,
  Send,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type DocumentStatus =
  | "draft"
  | "sent"
  | "viewed"
  | "signed"
  | "completed"
  | "expired"
  | "declined";

export interface Document {
  id: string;
  title: string;
  status: DocumentStatus;
  recipient: {
    name: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
  value?: number;
}

interface DocumentListProps {
  documents: Document[];
  onEdit?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onSend?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const statusConfig: Record<
  DocumentStatus,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  draft: { label: "Draft", variant: "secondary" },
  sent: { label: "Sent", variant: "default" },
  viewed: { label: "Viewed", variant: "outline" },
  signed: { label: "Signed", variant: "default" },
  completed: { label: "Completed", variant: "default" },
  expired: { label: "Expired", variant: "destructive" },
  declined: { label: "Declined", variant: "destructive" },
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(value);
}

export function DocumentList({
  documents,
  onEdit,
  onDuplicate,
  onSend,
  onDelete,
}: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="text-lg font-medium">No documents yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Create your first document to get started.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Document</TableHead>
          <TableHead>Recipient</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Value</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="w-12">
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {documents.map((doc) => {
          const status = statusConfig[doc.status] || { label: doc.status, variant: "secondary" as const };
          return (
            <TableRow key={doc.id}>
              <TableCell>
                <Link
                  href={`/documents/${doc.id}`}
                  className="flex items-center gap-3 font-medium hover:underline"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <span>{doc.title}</span>
                </Link>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{doc.recipient.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {doc.recipient.email}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant={status.variant}
                  className={cn(
                    doc.status === "completed" && "bg-green-600 text-white",
                    doc.status === "signed" && "bg-blue-600 text-white"
                  )}
                >
                  {status.label}
                </Badge>
              </TableCell>
              <TableCell>
                {doc.value ? formatCurrency(doc.value) : "-"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(doc.updatedAt)}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit?.(doc.id)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDuplicate?.(doc.id)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    {doc.status === "draft" && (
                      <DropdownMenuItem onClick={() => onSend?.(doc.id)}>
                        <Send className="mr-2 h-4 w-4" />
                        Send
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => onDelete?.(doc.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
