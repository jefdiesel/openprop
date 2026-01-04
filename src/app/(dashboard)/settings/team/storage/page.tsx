import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { profiles, organizations, organizationMembers, storageItems } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { HardDrive, ArrowLeft, FileIcon, Image, FileText } from "lucide-react";
import Link from "next/link";
import { StorageUsageBar } from "@/components/team/storage-usage-bar";
import { formatBytes } from "@/lib/storage";

export const dynamic = "force-dynamic";

function getFileIcon(fileType: string) {
  if (fileType.startsWith("image/")) {
    return <Image className="h-4 w-4" />;
  }
  if (fileType.includes("pdf") || fileType.includes("document")) {
    return <FileText className="h-4 w-4" />;
  }
  return <FileIcon className="h-4 w-4" />;
}

export default async function TeamStoragePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  // Get current organization context
  const [profile] = await db
    .select({ currentOrganizationId: profiles.currentOrganizationId })
    .from(profiles)
    .where(eq(profiles.id, session.user.id))
    .limit(1);

  if (!profile?.currentOrganizationId) {
    redirect("/settings/team");
  }

  // Get organization details
  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, profile.currentOrganizationId))
    .limit(1);

  if (!org) {
    redirect("/settings/team");
  }

  // Get storage items
  const items = await db.query.storageItems.findMany({
    where: eq(storageItems.organizationId, org.id),
    orderBy: [desc(storageItems.createdAt)],
    limit: 50,
    with: {
      uploadedByUser: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
      document: {
        columns: {
          id: true,
          title: true,
        },
      },
    },
  });

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href="/settings/team">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Team Settings
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Team Storage</h1>
        <p className="text-muted-foreground">View and manage your team's storage usage</p>
      </div>

      <div className="grid gap-6">
        {/* Storage Usage */}
        <StorageUsageBar />

        {/* Storage Items */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Files</CardTitle>
            <CardDescription>
              Files uploaded by your team members
            </CardDescription>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <HardDrive className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-1">No files yet</h3>
                <p className="text-sm text-muted-foreground">
                  Files uploaded in documents will appear here
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Document</TableHead>
                    <TableHead>Uploaded By</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getFileIcon(item.fileType)}
                          <span className="truncate max-w-[200px]" title={item.fileName}>
                            {item.fileName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatBytes(Number(item.fileSize))}
                      </TableCell>
                      <TableCell>
                        {item.document ? (
                          <Link
                            href={`/documents/${item.document.id}`}
                            className="text-primary hover:underline truncate max-w-[150px] block"
                            title={item.document.title}
                          >
                            {item.document.title}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.uploadedByUser?.name || item.uploadedByUser?.email || "Unknown"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
