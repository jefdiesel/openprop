import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, FileText, Pencil, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { SeedTemplatesButton } from "./seed-button";

export default async function TemplatesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch user's templates
  const templates = await db
    .select({
      id: documents.id,
      title: documents.title,
      category: documents.templateCategory,
      createdAt: documents.createdAt,
      updatedAt: documents.updatedAt,
    })
    .from(documents)
    .where(and(eq(documents.userId, session.user.id), eq(documents.isTemplate, true)))
    .orderBy(desc(documents.updatedAt));

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
          <p className="text-muted-foreground">
            Start with a template to create professional documents faster.
          </p>
        </div>
        <Button asChild>
          <Link href="/templates/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Template
          </Link>
        </Button>
      </div>

      {/* Templates List */}
      {templates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="mb-4 h-16 w-16 text-muted-foreground/50" />
            <h3 className="text-xl font-medium">No templates yet</h3>
            <p className="mt-2 text-center text-muted-foreground max-w-sm">
              Get started with our pre-built templates or create your own from scratch.
            </p>
            <div className="mt-6 flex gap-3">
              <SeedTemplatesButton />
              <Button variant="outline" asChild>
                <Link href="/templates/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Blank
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Template</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-32 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>
                    <Link
                      href={`/documents/${template.id}/edit`}
                      className="font-medium hover:underline"
                    >
                      {template.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {template.category ? (
                      <Badge variant="secondary">{template.category}</Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {template.updatedAt.toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/documents/${template.id}/edit`}>
                          <Pencil className="mr-1 h-3 w-3" />
                          Edit
                        </Link>
                      </Button>
                      <Button size="sm" asChild>
                        <Link href={`/templates/${template.id}/use`}>
                          <Copy className="mr-1 h-3 w-3" />
                          Use
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
