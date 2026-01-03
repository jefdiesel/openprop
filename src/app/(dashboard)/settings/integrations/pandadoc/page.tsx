"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  ExternalLink,
  FileText,
  Loader2,
  RefreshCw,
  Trash2,
  Upload,
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
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Mock data - replace with real API calls
interface ImportJob {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  totalFiles: number;
  processedFiles: number;
  failedFiles: number;
  createdAt: string;
  completedAt?: string;
  errorMessage?: string;
}

const mockImportHistory: ImportJob[] = [
  {
    id: "1",
    status: "completed",
    totalFiles: 5,
    processedFiles: 5,
    failedFiles: 0,
    createdAt: "2024-01-15T10:30:00Z",
    completedAt: "2024-01-15T10:32:00Z",
  },
  {
    id: "2",
    status: "completed",
    totalFiles: 3,
    processedFiles: 2,
    failedFiles: 1,
    createdAt: "2024-01-10T14:20:00Z",
    completedAt: "2024-01-10T14:21:00Z",
    errorMessage: "1 document could not be imported due to unsupported format",
  },
];

const mockConnection = {
  connected: false,
  accountEmail: null,
  connectedAt: null,
  lastSync: null,
};

export default function PandaDocSettingsPage() {
  const router = useRouter();
  const [connection, setConnection] = React.useState(mockConnection);
  const [importHistory, setImportHistory] = React.useState<ImportJob[]>(mockImportHistory);
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [isDisconnecting, setIsDisconnecting] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // Redirect to OAuth flow
      const response = await fetch("/api/integrations/pandadoc/connect");
      const data = await response.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error("Failed to connect:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await fetch("/api/integrations/pandadoc/disconnect", { method: "POST" });
      setConnection({
        connected: false,
        accountEmail: null,
        connectedAt: null,
        lastSync: null,
      });
    } catch (error) {
      console.error("Failed to disconnect:", error);
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleRefreshConnection = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch("/api/integrations/pandadoc/status");
      const data = await response.json();
      setConnection(data);
    } catch (error) {
      console.error("Failed to refresh:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: ImportJob["status"]) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-600">
            <Check className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        );
      case "processing":
        return (
          <Badge className="bg-blue-600">
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            Processing
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive">
            <AlertCircle className="mr-1 h-3 w-3" />
            Failed
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/settings/integrations">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border bg-background">
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
          <div>
            <h1 className="text-2xl font-bold tracking-tight">PandaDoc</h1>
            <p className="text-sm text-muted-foreground">
              Import templates and documents from PandaDoc
            </p>
          </div>
        </div>
      </div>

      {/* Connection Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Connection Status</CardTitle>
              <CardDescription>
                Connect your PandaDoc account to import templates and documents.
              </CardDescription>
            </div>
            {connection.connected ? (
              <Badge className="bg-green-600">
                <Check className="mr-1 h-3 w-3" />
                Connected
              </Badge>
            ) : (
              <Badge variant="secondary">Not Connected</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {connection.connected ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium">Account</p>
                    <p className="text-sm text-muted-foreground">
                      {connection.accountEmail || "Connected Account"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Connected Since</p>
                    <p className="text-sm text-muted-foreground">
                      {connection.connectedAt
                        ? formatDate(connection.connectedAt)
                        : "Unknown"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Your PandaDoc account is connected. You can import templates and
                  documents.
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefreshConnection}
                  disabled={isRefreshing}
                >
                  {isRefreshing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border border-dashed p-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-medium">No Connection</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Connect your PandaDoc account to get started with importing.
                </p>
              </div>
              <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  What you can do after connecting:
                </h4>
                <ul className="mt-2 space-y-1 text-sm text-blue-800 dark:text-blue-200">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Import existing templates as SendProp templates
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Import completed documents for reference
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Preserve pricing tables, signatures, and content
                  </li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          {connection.connected ? (
            <>
              <Button
                variant="destructive"
                onClick={handleDisconnect}
                disabled={isDisconnecting}
              >
                {isDisconnecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Disconnecting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Disconnect
                  </>
                )}
              </Button>
              <Button asChild>
                <Link href="/import/pandadoc">
                  <Upload className="mr-2 h-4 w-4" />
                  Import Content
                </Link>
              </Button>
            </>
          ) : (
            <Button onClick={handleConnect} disabled={isConnecting} className="w-full">
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  Connect PandaDoc
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Import Actions */}
      {connection.connected && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Import content from your PandaDoc account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="border-2 hover:border-primary/50 transition-colors cursor-pointer">
                <Link href="/import/pandadoc">
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Upload className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Import Wizard</h3>
                      <p className="text-sm text-muted-foreground">
                        Step-by-step import process
                      </p>
                    </div>
                  </CardContent>
                </Link>
              </Card>
              <Card className="border-2 hover:border-primary/50 transition-colors cursor-pointer">
                <a
                  href="https://app.pandadoc.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
                      <ExternalLink className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-medium">Open PandaDoc</h3>
                      <p className="text-sm text-muted-foreground">
                        View your PandaDoc dashboard
                      </p>
                    </div>
                  </CardContent>
                </a>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import History */}
      <Card>
        <CardHeader>
          <CardTitle>Import History</CardTitle>
          <CardDescription>
            View your past imports from PandaDoc.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {importHistory.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Imported</TableHead>
                  <TableHead className="text-right">Failed</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {importHistory.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">
                      {formatDate(job.createdAt)}
                    </TableCell>
                    <TableCell>{getStatusBadge(job.status)}</TableCell>
                    <TableCell className="text-right">
                      {job.processedFiles} / {job.totalFiles}
                    </TableCell>
                    <TableCell className="text-right">
                      {job.failedFiles > 0 ? (
                        <span className="text-destructive">{job.failedFiles}</span>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                      {job.errorMessage || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-12 text-center">
              <Clock className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-sm font-medium">No import history</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Your import history will appear here after you import content.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
          <CardDescription>
            Learn more about importing from PandaDoc.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">What gets imported?</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>- Text content and formatting</li>
                <li>- Images and media</li>
                <li>- Pricing tables with items</li>
                <li>- Signature fields</li>
                <li>- Document variables</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Limitations</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>- Custom fields may need manual adjustment</li>
                <li>- Some complex layouts may be simplified</li>
                <li>- Workflows and automations are not imported</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
