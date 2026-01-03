"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Upload,
  XCircle,
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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

// Types for the import job status
interface ImportJobStats {
  total: number;
  processed: number;
  imported: number;
  failed: number;
}

interface ImportJobError {
  item: string;
  message: string;
}

interface ImportJobStatus {
  jobId: string;
  status: "processing" | "completed" | "failed";
  progress: number;
  stats: ImportJobStats;
  errors: ImportJobError[];
}

type ImportState = "idle" | "importing" | "completed" | "failed";

export default function PandaDocImportPage() {
  // Form state
  const [apiKey, setApiKey] = React.useState("");
  const [showApiKey, setShowApiKey] = React.useState(false);
  const [importTemplates, setImportTemplates] = React.useState(true);
  const [importContentLibrary, setImportContentLibrary] = React.useState(false);

  // Import state
  const [importState, setImportState] = React.useState<ImportState>("idle");
  const [jobId, setJobId] = React.useState<string | null>(null);
  const [progress, setProgress] = React.useState(0);
  const [stats, setStats] = React.useState<ImportJobStats>({
    total: 0,
    processed: 0,
    imported: 0,
    failed: 0,
  });
  const [errors, setErrors] = React.useState<ImportJobError[]>([]);
  const [startError, setStartError] = React.useState<string | null>(null);

  // Polling interval ref
  const pollingIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  // Cleanup polling on unmount
  React.useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Poll for job status
  const pollJobStatus = React.useCallback(async (currentJobId: string) => {
    try {
      const response = await fetch(`/api/import/pandadoc-key/${currentJobId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch job status");
      }

      const data: ImportJobStatus = await response.json();

      setProgress(data.progress);
      setStats(data.stats);
      setErrors(data.errors);

      if (data.status === "completed") {
        setImportState("completed");
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      } else if (data.status === "failed") {
        setImportState("failed");
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      }
    } catch (error) {
      console.error("Error polling job status:", error);
      // Don't stop polling on temporary errors
    }
  }, []);

  // Start the import
  const handleStartImport = async () => {
    if (!apiKey.trim()) {
      setStartError("Please enter your PandaDoc API key");
      return;
    }

    if (!importTemplates && !importContentLibrary) {
      setStartError("Please select at least one type of content to import");
      return;
    }

    setStartError(null);
    setImportState("importing");
    setProgress(0);
    setStats({ total: 0, processed: 0, imported: 0, failed: 0 });
    setErrors([]);

    try {
      const response = await fetch("/api/import/pandadoc-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey: apiKey.trim(),
          options: {
            importTemplates,
            importContentLibrary,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to start import");
      }

      const data = await response.json();
      setJobId(data.jobId);

      // Start polling for status updates
      pollingIntervalRef.current = setInterval(() => {
        pollJobStatus(data.jobId);
      }, 2000);

      // Initial poll
      pollJobStatus(data.jobId);
    } catch (error) {
      console.error("Error starting import:", error);
      setImportState("failed");
      setStartError(
        error instanceof Error ? error.message : "Failed to start import"
      );
    }
  };

  // Reset to start a new import
  const handleReset = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setImportState("idle");
    setJobId(null);
    setProgress(0);
    setStats({ total: 0, processed: 0, imported: 0, failed: 0 });
    setErrors([]);
    setStartError(null);
  };

  // Render the status badge
  const renderStatusBadge = () => {
    switch (importState) {
      case "importing":
        return (
          <Badge className="bg-blue-600">
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            Processing
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-green-600">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Failed
          </Badge>
        );
      default:
        return null;
    }
  };

  // Render the progress section
  const renderProgressSection = () => {
    if (importState === "idle") return null;

    return (
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Import Progress</CardTitle>
              <CardDescription>
                {importState === "importing"
                  ? "Importing your content from PandaDoc..."
                  : importState === "completed"
                  ? "Import completed successfully"
                  : "Import encountered an error"}
              </CardDescription>
            </div>
            {renderStatusBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  importState === "failed"
                    ? "bg-red-500"
                    : importState === "completed"
                    ? "bg-green-500"
                    : "bg-primary"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Items</p>
            </div>
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-2xl font-bold">{stats.processed}</p>
              <p className="text-sm text-muted-foreground">Processed</p>
            </div>
            <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4 text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.imported}
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                Imported
              </p>
            </div>
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-center">
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {stats.failed}
              </p>
              <p className="text-sm text-red-700 dark:text-red-300">Failed</p>
            </div>
          </div>

          {/* Errors List */}
          {errors.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-red-600 dark:text-red-400">
                Failed Items ({errors.length})
              </h4>
              <div className="max-h-48 overflow-y-auto rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20">
                {errors.map((error, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 border-b border-red-200 p-3 last:border-b-0 dark:border-red-900"
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-red-800 dark:text-red-200">
                        {error.item}
                      </p>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        {error.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        {(importState === "completed" || importState === "failed") && (
          <CardFooter className="border-t pt-6">
            <div className="flex w-full gap-3">
              <Button variant="outline" onClick={handleReset} className="flex-1">
                Start New Import
              </Button>
              {importState === "completed" && (
                <Button asChild className="flex-1">
                  <Link href="/templates">View Templates</Link>
                </Button>
              )}
            </div>
          </CardFooter>
        )}
      </Card>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/settings">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Import from PandaDoc
          </h1>
          <p className="text-sm text-muted-foreground">
            Import your templates and content library from PandaDoc using your
            API key
          </p>
        </div>
      </div>

      {/* Import Form */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle>PandaDoc API Key</CardTitle>
              </div>
              <CardDescription>
                Enter your PandaDoc API key to import your content. You can find
                your API key in your{" "}
                <a
                  href="https://app.pandadoc.com/a/#/settings/integrations/api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline hover:no-underline"
                >
                  PandaDoc account settings
                </a>
                .
              </CardDescription>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
              <svg
                className="h-6 w-6"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="32" height="32" rx="8" fill="#4CAF50" />
                <path
                  d="M8 10h5c2.5 0 4.5 2 4.5 4.5S15.5 19 13 19H10v4H8V10zm5 7c1.4 0 2.5-1.1 2.5-2.5S14.4 12 13 12h-3v5h3z"
                  fill="white"
                />
                <path d="M19 10h5v2h-3v3h2v2h-2v6h-2V10z" fill="white" />
              </svg>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* API Key Input */}
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <div className="relative">
              <Input
                id="apiKey"
                type={showApiKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your PandaDoc API key"
                disabled={importState === "importing"}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showApiKey ? "Hide API key" : "Show API key"}
              >
                {showApiKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Your API key is used only for this import and is not stored.
            </p>
          </div>

          {/* Import Options */}
          <div className="space-y-4">
            <Label>Import Options</Label>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={importTemplates}
                  onCheckedChange={(checked) =>
                    setImportTemplates(checked === true)
                  }
                  disabled={importState === "importing"}
                />
                <div className="space-y-0.5">
                  <span className="text-sm font-medium">Templates</span>
                  <p className="text-xs text-muted-foreground">
                    Import your PandaDoc templates as reusable templates
                  </p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={importContentLibrary}
                  onCheckedChange={(checked) =>
                    setImportContentLibrary(checked === true)
                  }
                  disabled={importState === "importing"}
                />
                <div className="space-y-0.5">
                  <span className="text-sm font-medium">Content Library</span>
                  <p className="text-xs text-muted-foreground">
                    Import your saved content blocks and snippets
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Error Message */}
          {startError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
                <p className="text-sm text-red-800 dark:text-red-200">
                  {startError}
                </p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t pt-6">
          <Button
            onClick={handleStartImport}
            disabled={importState === "importing"}
            className="w-full sm:w-auto"
          >
            {importState === "importing" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Start Import
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Progress Section */}
      {renderProgressSection()}
    </div>
  );
}
