"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  Cloud,
  ExternalLink,
  Loader2,
  RefreshCw,
  Settings2,
  Trash2,
  Users,
  Briefcase,
  FileText,
  CheckCircle2,
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface SalesforceStatus {
  connected: boolean;
  orgName: string | null;
  orgId: string | null;
  instanceUrl: string | null;
  userName: string | null;
  userEmail: string | null;
  isSandbox: boolean;
  connectedAt: string | null;
  lastSync: string | null;
  tokenExpired: boolean;
  syncSettings: SyncSettings | null;
}

interface SyncSettings {
  updateOpportunityOnSign: boolean;
  signedOpportunityStage: string;
  createTaskOnComplete: boolean;
  taskSubject: string;
  taskPriority: string;
  attachDocumentToOpportunity: boolean;
  attachDocumentToAccount: boolean;
  fieldMappings: Array<{
    id: string;
    openProposalField: string;
    salesforceObject: string;
    salesforceField: string;
    enabled: boolean;
  }>;
}

const defaultSyncSettings: SyncSettings = {
  updateOpportunityOnSign: true,
  signedOpportunityStage: "Closed Won",
  createTaskOnComplete: true,
  taskSubject: "Document signed - follow up required",
  taskPriority: "Normal",
  attachDocumentToOpportunity: true,
  attachDocumentToAccount: false,
  fieldMappings: [],
};

const opportunityStages = [
  "Prospecting",
  "Qualification",
  "Needs Analysis",
  "Value Proposition",
  "Proposal/Price Quote",
  "Negotiation/Review",
  "Closed Won",
  "Closed Lost",
];

const taskPriorities = ["High", "Normal", "Low"];

export default function SalesforceSettingsPage() {
  return (
    <React.Suspense fallback={
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <SalesforceSettingsContent />
    </React.Suspense>
  );
}

function SalesforceSettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = React.useState<SalesforceStatus | null>(null);
  const [syncSettings, setSyncSettings] = React.useState<SyncSettings>(defaultSyncSettings);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [isDisconnecting, setIsDisconnecting] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [isSavingSettings, setIsSavingSettings] = React.useState(false);
  const [useSandbox, setUseSandbox] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Check URL params for success/error messages
  React.useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");
    const message = searchParams.get("message");

    if (success === "connected") {
      setSuccessMessage("Successfully connected to Salesforce!");
      // Remove query params after showing message
      router.replace("/settings/integrations/salesforce");
    }

    if (error) {
      let errorMsg = "Failed to connect to Salesforce.";
      switch (error) {
        case "oauth_denied":
          errorMsg = message
            ? decodeURIComponent(message)
            : "OAuth authorization was denied.";
          break;
        case "missing_params":
          errorMsg = "Missing required parameters.";
          break;
        case "invalid_state":
          errorMsg = "Invalid state parameter. Please try again.";
          break;
        case "state_expired":
          errorMsg = "Authorization session expired. Please try again.";
          break;
        case "token_exchange_failed":
          errorMsg = "Failed to complete authorization. Please try again.";
          break;
        case "callback_failed":
          errorMsg = "An error occurred during authorization.";
          break;
      }
      setErrorMessage(errorMsg);
      router.replace("/settings/integrations/salesforce");
    }
  }, [searchParams, router]);

  // Fetch connection status
  const fetchStatus = React.useCallback(async () => {
    try {
      const response = await fetch("/api/integrations/salesforce/status");
      const data = await response.json();
      setStatus(data);
      if (data.syncSettings) {
        setSyncSettings(data.syncSettings);
      }
    } catch (error) {
      console.error("Failed to fetch status:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleConnect = async () => {
    setIsConnecting(true);
    setErrorMessage(null);
    try {
      const response = await fetch(
        `/api/integrations/salesforce/connect?sandbox=${useSandbox}`
      );
      const data = await response.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        setErrorMessage("Failed to get authorization URL.");
      }
    } catch (error) {
      console.error("Failed to connect:", error);
      setErrorMessage("Failed to initiate connection.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    setErrorMessage(null);
    try {
      await fetch("/api/integrations/salesforce/disconnect", { method: "POST" });
      setStatus({
        connected: false,
        orgName: null,
        orgId: null,
        instanceUrl: null,
        userName: null,
        userEmail: null,
        isSandbox: false,
        connectedAt: null,
        lastSync: null,
        tokenExpired: false,
        syncSettings: null,
      });
      setSuccessMessage("Successfully disconnected from Salesforce.");
    } catch (error) {
      console.error("Failed to disconnect:", error);
      setErrorMessage("Failed to disconnect.");
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleRefreshConnection = async () => {
    setIsRefreshing(true);
    await fetchStatus();
    setIsRefreshing(false);
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    setErrorMessage(null);
    try {
      const response = await fetch("/api/integrations/salesforce/sync", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(syncSettings),
      });

      if (response.ok) {
        setSuccessMessage("Settings saved successfully!");
      } else {
        setErrorMessage("Failed to save settings.");
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      setErrorMessage("Failed to save settings.");
    } finally {
      setIsSavingSettings(false);
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

  // Clear messages after 5 seconds
  React.useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  React.useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 10000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

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
              <rect width="32" height="32" rx="8" fill="#00A1E0" />
              <path
                d="M13 11c1.5-1.5 4-1.5 5.5 0s1.5 4 0 5.5M11 13c-1.5 1.5-1.5 4 0 5.5s4 1.5 5.5 0M18 18c1.5 1.5 4 1.5 5.5 0M9 15c-1 1.5-.5 3.5 1 4.5"
                stroke="white"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Salesforce</h1>
            <p className="text-sm text-muted-foreground">
              Sync opportunities, contacts, and documents with Salesforce CRM
            </p>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-900/20">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Connection Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Connection Status</CardTitle>
              <CardDescription>
                Connect your Salesforce account to sync opportunities and contacts.
              </CardDescription>
            </div>
            {status?.connected ? (
              <div className="flex items-center gap-2">
                {status.isSandbox && (
                  <Badge variant="outline" className="text-amber-600 border-amber-300">
                    Sandbox
                  </Badge>
                )}
                <Badge className="bg-green-600">
                  <Check className="mr-1 h-3 w-3" />
                  Connected
                </Badge>
              </div>
            ) : (
              <Badge variant="secondary">Not Connected</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {status?.connected ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <p className="text-sm font-medium">Organization</p>
                    <p className="text-sm text-muted-foreground">
                      {status.orgName || "Unknown Organization"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">User</p>
                    <p className="text-sm text-muted-foreground">
                      {status.userName || status.userEmail || "Unknown User"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Connected Since</p>
                    <p className="text-sm text-muted-foreground">
                      {status.connectedAt ? formatDate(status.connectedAt) : "Unknown"}
                    </p>
                  </div>
                </div>
              </div>
              {status.tokenExpired && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Token Expired</AlertTitle>
                  <AlertDescription>
                    Your Salesforce connection has expired. Please reconnect to continue
                    syncing.
                  </AlertDescription>
                </Alert>
              )}
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Your Salesforce account is connected. Data will sync automatically.
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
                  <Cloud className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-medium">No Connection</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Connect your Salesforce account to get started.
                </p>
              </div>
              <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  What you can do after connecting:
                </h4>
                <ul className="mt-2 space-y-1 text-sm text-blue-800 dark:text-blue-200">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Import contacts as document recipients
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Update opportunity stages when documents are signed
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Attach signed documents to Salesforce records
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Create follow-up tasks automatically
                  </li>
                </ul>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="sandbox-mode"
                    checked={useSandbox}
                    onCheckedChange={setUseSandbox}
                  />
                  <Label htmlFor="sandbox-mode" className="text-sm">
                    Connect to Sandbox environment
                  </Label>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          {status?.connected ? (
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
              {status.instanceUrl && (
                <Button variant="outline" asChild>
                  <a
                    href={status.instanceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open Salesforce
                  </a>
                </Button>
              )}
            </>
          ) : (
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  Connect Salesforce
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Sync Settings - Only show when connected */}
      {status?.connected && (
        <>
          {/* Opportunity Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Opportunity Settings
              </CardTitle>
              <CardDescription>
                Configure how signed documents affect Salesforce opportunities.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Update opportunity stage when document is signed</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically change the opportunity stage after a document is
                    signed.
                  </p>
                </div>
                <Switch
                  checked={syncSettings.updateOpportunityOnSign}
                  onCheckedChange={(checked) =>
                    setSyncSettings({ ...syncSettings, updateOpportunityOnSign: checked })
                  }
                />
              </div>

              {syncSettings.updateOpportunityOnSign && (
                <div className="space-y-2">
                  <Label>Stage to set after signing</Label>
                  <Select
                    value={syncSettings.signedOpportunityStage}
                    onValueChange={(value) =>
                      setSyncSettings({ ...syncSettings, signedOpportunityStage: value })
                    }
                  >
                    <SelectTrigger className="w-full max-w-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {opportunityStages.map((stage) => (
                        <SelectItem key={stage} value={stage}>
                          {stage}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Attach signed documents to opportunities</Label>
                  <p className="text-sm text-muted-foreground">
                    Upload the signed PDF to the Salesforce opportunity record.
                  </p>
                </div>
                <Switch
                  checked={syncSettings.attachDocumentToOpportunity}
                  onCheckedChange={(checked) =>
                    setSyncSettings({
                      ...syncSettings,
                      attachDocumentToOpportunity: checked,
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Task Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Task Settings
              </CardTitle>
              <CardDescription>
                Configure automatic task creation for follow-ups.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Create follow-up task when document is completed</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically create a task to remind you to follow up.
                  </p>
                </div>
                <Switch
                  checked={syncSettings.createTaskOnComplete}
                  onCheckedChange={(checked) =>
                    setSyncSettings({ ...syncSettings, createTaskOnComplete: checked })
                  }
                />
              </div>

              {syncSettings.createTaskOnComplete && (
                <>
                  <div className="space-y-2">
                    <Label>Task subject</Label>
                    <Input
                      value={syncSettings.taskSubject}
                      onChange={(e) =>
                        setSyncSettings({ ...syncSettings, taskSubject: e.target.value })
                      }
                      placeholder="Follow up on signed document"
                      className="max-w-md"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Task priority</Label>
                    <Select
                      value={syncSettings.taskPriority}
                      onValueChange={(value) =>
                        setSyncSettings({ ...syncSettings, taskPriority: value })
                      }
                    >
                      <SelectTrigger className="w-full max-w-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {taskPriorities.map((priority) => (
                          <SelectItem key={priority} value={priority}>
                            {priority}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSaveSettings} disabled={isSavingSettings}>
              {isSavingSettings ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Settings2 className="mr-2 h-4 w-4" />
                  Save Settings
                </>
              )}
            </Button>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Access Salesforce data directly from OpenProposal.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <Card className="cursor-pointer border-2 transition-colors hover:border-primary/50">
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                      <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-medium">Import Contacts</h3>
                      <p className="text-sm text-muted-foreground">
                        Use Salesforce contacts as recipients
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer border-2 transition-colors hover:border-primary/50">
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
                      <Briefcase className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-medium">View Opportunities</h3>
                      <p className="text-sm text-muted-foreground">
                        Link documents to opportunities
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Help Section */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
          <CardDescription>
            Learn more about the Salesforce integration.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">What gets synced?</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>- Contacts for document recipients</li>
                <li>- Opportunity stages on document completion</li>
                <li>- Signed documents as attachments</li>
                <li>- Follow-up tasks</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Requirements</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>- Salesforce Professional or higher</li>
                <li>- API access enabled</li>
                <li>- System Administrator or appropriate permissions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
