"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  FileText,
  Loader2,
  AlertCircle,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Template {
  templateId: string;
  name: string;
  created: string;
  lastModified?: string;
}

interface Envelope {
  envelopeId: string;
  emailSubject: string;
  status: string;
  sentDateTime?: string;
  completedDateTime?: string;
}

export default function DocuSignImportPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(true);
  const [isLoadingTemplates, setIsLoadingTemplates] = React.useState(false);
  const [isLoadingEnvelopes, setIsLoadingEnvelopes] = React.useState(false);
  const [isImporting, setIsImporting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [connected, setConnected] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'templates' | 'envelopes'>('templates');

  const [templates, setTemplates] = React.useState<Template[]>([]);
  const [envelopes, setEnvelopes] = React.useState<Envelope[]>([]);
  const [selectedItems, setSelectedItems] = React.useState<Set<string>>(new Set());

  const [importAsTemplates, setImportAsTemplates] = React.useState(true);
  const [preserveVariables, setPreserveVariables] = React.useState(true);

  React.useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const response = await fetch("/api/integrations/docusign/status");
      const data = await response.json();

      if (!data.connected) {
        router.push('/settings/integrations/docusign');
        return;
      }

      setConnected(true);
      await loadTemplates();
    } catch (error) {
      console.error("Failed to check connection:", error);
      setError("Failed to check DocuSign connection");
    } finally {
      setIsLoading(false);
    }
  };

  const loadTemplates = async () => {
    setIsLoadingTemplates(true);
    setError(null);
    try {
      const response = await fetch("/api/integrations/docusign/templates?count=50");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load templates");
      }

      setTemplates(data.templates || []);
    } catch (error: any) {
      console.error("Failed to load templates:", error);
      setError(error.message || "Failed to load templates");
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const loadEnvelopes = async () => {
    setIsLoadingEnvelopes(true);
    setError(null);
    try {
      // Load envelopes from the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const response = await fetch(
        `/api/integrations/docusign/envelopes?from_date=${thirtyDaysAgo.toISOString()}&count=50`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load envelopes");
      }

      setEnvelopes(data.envelopes || []);
    } catch (error: any) {
      console.error("Failed to load envelopes:", error);
      setError(error.message || "Failed to load envelopes");
    } finally {
      setIsLoadingEnvelopes(false);
    }
  };

  const handleTabChange = async (tab: 'templates' | 'envelopes') => {
    setActiveTab(tab);
    setSelectedItems(new Set());

    if (tab === 'envelopes' && envelopes.length === 0) {
      await loadEnvelopes();
    }
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const toggleSelectAll = () => {
    const items = activeTab === 'templates' ? templates : envelopes;
    const ids = items.map(item =>
      activeTab === 'templates'
        ? (item as Template).templateId
        : (item as Envelope).envelopeId
    );

    if (selectedItems.size === ids.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(ids));
    }
  };

  const handleImport = async () => {
    if (selectedItems.size === 0) {
      setError("Please select at least one item to import");
      return;
    }

    setIsImporting(true);
    setError(null);

    try {
      const items = Array.from(selectedItems).map(id => ({
        id,
        type: activeTab === 'templates' ? 'template' : 'envelope',
      }));

      const response = await fetch("/api/integrations/docusign/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          options: {
            asTemplates: importAsTemplates,
            preserveVariables,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to start import");
      }

      // Poll for job status
      const jobId = data.jobId;
      await pollImportStatus(jobId);

    } catch (error: any) {
      console.error("Import failed:", error);
      setError(error.message || "Import failed");
      setIsImporting(false);
    }
  };

  const pollImportStatus = async (jobId: string) => {
    let attempts = 0;
    const maxAttempts = 60; // 1 minute max

    const poll = async () => {
      try {
        const response = await fetch(`/api/integrations/docusign/import?jobId=${jobId}`);
        const data = await response.json();

        if (data.status === 'completed') {
          setIsImporting(false);
          router.push('/documents?imported=true');
          return;
        }

        if (data.status === 'failed') {
          setError(data.errors?.[0]?.error || "Import failed");
          setIsImporting(false);
          return;
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 1000);
        } else {
          setError("Import timed out");
          setIsImporting(false);
        }
      } catch (error) {
        console.error("Failed to check import status:", error);
        setError("Failed to check import status");
        setIsImporting(false);
      }
    };

    poll();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="container max-w-6xl py-8">
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  const items = activeTab === 'templates' ? templates : envelopes;
  const isLoadingItems = activeTab === 'templates' ? isLoadingTemplates : isLoadingEnvelopes;

  return (
    <div className="container max-w-6xl py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/settings/integrations/docusign"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to DocuSign Settings
        </Link>
        <h1 className="text-3xl font-bold">Import from DocuSign</h1>
        <p className="text-muted-foreground mt-2">
          Select templates or envelopes to import into OpenProposal.
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Card */}
      <Card>
        <CardHeader>
          <CardTitle>Select Items to Import</CardTitle>
          <CardDescription>
            Choose DocuSign templates or envelopes to import as documents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tabs */}
          <div className="flex gap-2 border-b">
            <button
              onClick={() => handleTabChange('templates')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'templates'
                  ? 'border-b-2 border-primary text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Templates
            </button>
            <button
              onClick={() => handleTabChange('envelopes')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'envelopes'
                  ? 'border-b-2 border-primary text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Envelopes
            </button>
          </div>

          {/* Items Table */}
          {isLoadingItems ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No {activeTab === 'templates' ? 'templates' : 'envelopes'} found
              </h3>
              <p className="text-sm text-muted-foreground">
                {activeTab === 'templates'
                  ? "You don't have any templates in your DocuSign account."
                  : "No envelopes found from the last 30 days."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedItems.size === items.length}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  {activeTab === 'envelopes' && <TableHead>Status</TableHead>}
                  <TableHead>
                    {activeTab === 'templates' ? 'Created' : 'Sent'}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const id = activeTab === 'templates'
                    ? (item as Template).templateId
                    : (item as Envelope).envelopeId;
                  const name = activeTab === 'templates'
                    ? (item as Template).name
                    : (item as Envelope).emailSubject;
                  const date = activeTab === 'templates'
                    ? (item as Template).created
                    : (item as Envelope).sentDateTime;

                  return (
                    <TableRow key={id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedItems.has(id)}
                          onCheckedChange={() => toggleSelection(id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{name}</TableCell>
                      {activeTab === 'envelopes' && (
                        <TableCell>
                          <Badge variant="outline">
                            {(item as Envelope).status}
                          </Badge>
                        </TableCell>
                      )}
                      <TableCell className="text-muted-foreground">
                        {date ? formatDate(date) : '-'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}

          {/* Import Options */}
          {items.length > 0 && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold">Import Options</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="as-templates"
                    checked={importAsTemplates}
                    onCheckedChange={(checked) => setImportAsTemplates(checked as boolean)}
                  />
                  <Label htmlFor="as-templates" className="text-sm font-normal">
                    Import as reusable templates
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="preserve-variables"
                    checked={preserveVariables}
                    onCheckedChange={(checked) => setPreserveVariables(checked as boolean)}
                  />
                  <Label htmlFor="preserve-variables" className="text-sm font-normal">
                    Preserve custom fields as variables
                  </Label>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
          </div>
          <Button
            onClick={handleImport}
            disabled={selectedItems.size === 0 || isImporting}
          >
            {isImporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Import Selected
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
