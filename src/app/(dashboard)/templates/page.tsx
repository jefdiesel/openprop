"use client";

import Link from "next/link";
import { Plus, FileText, Pencil, Copy, Crown } from "lucide-react";
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
import { SeedTemplatesButton } from "./seed-button";
import { useSubscription } from "@/hooks/use-subscription";
import { useEffect, useState } from "react";

interface Template {
  id: string;
  title: string;
  template_category: string | null;
  created_at: string;
  updated_at: string;
  source: "user" | "starter";
}

export default function TemplatesPage() {
  const subscription = useSubscription();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const res = await fetch("/api/templates?include_public=false");
        if (res.ok) {
          const data = await res.json();
          // Filter only user templates
          const userTemplates = (data.templates || []).filter(
            (t: Template) => t.source === "user"
          );
          setTemplates(userTemplates);
        }
      } catch (error) {
        console.error("Failed to fetch templates:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTemplates();
  }, []);

  if (isLoading || subscription.loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const templateCount = templates.length;
  const canCreateMore = subscription.canCreateTemplates &&
    (subscription.maxTemplates === -1 || templateCount < subscription.maxTemplates);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
          <p className="text-muted-foreground">
            Start with a template to create professional documents faster.
          </p>
          {subscription.canCreateTemplates && subscription.maxTemplates !== -1 && (
            <p className="text-sm text-muted-foreground mt-1">
              {templateCount} of {subscription.maxTemplates} templates used
            </p>
          )}
        </div>
        {subscription.canCreateTemplates ? (
          canCreateMore ? (
            <Button asChild>
              <Link href="/templates/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Template
              </Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/pricing">
                <Crown className="mr-2 h-4 w-4" />
                Upgrade for More Templates
              </Link>
            </Button>
          )
        ) : (
          <Button asChild>
            <Link href="/pricing">
              <Crown className="mr-2 h-4 w-4" />
              Upgrade to Create Templates
            </Link>
          </Button>
        )}
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
              {subscription.canCreateTemplates ? (
                <Button variant="outline" asChild>
                  <Link href="/templates/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Blank
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" asChild>
                  <Link href="/pricing">
                    <Crown className="mr-2 h-4 w-4" />
                    Upgrade to Create
                  </Link>
                </Button>
              )}
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
                    {template.template_category ? (
                      <Badge variant="secondary">{template.template_category}</Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(template.updated_at).toLocaleDateString()}
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
