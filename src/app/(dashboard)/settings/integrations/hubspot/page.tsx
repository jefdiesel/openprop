"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  ExternalLink,
  Loader2,
  RefreshCw,
  Settings2,
  Trash2,
  Users,
  Building2,
  TrendingUp,
  Bell,
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
import { Separator } from "@/components/ui/separator";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

interface HubSpotStatus {
  connected: boolean;
  accountEmail: string | null;
  accountId: string | null;
  hubDomain: string | null;
  connectedAt: string | null;
  lastSync: string | null;
  tokenExpired?: boolean;
  syncSettings: SyncSettings | null;
}

interface SyncSettings {
  enabled: boolean;
  syncOnDocumentSent: boolean;
  syncOnDocumentViewed: boolean;
  syncOnDocumentSigned: boolean;
  syncOnDocumentCompleted: boolean;
  createDealsOnCompletion: boolean;
  createTasksOnCompletion: boolean;
  defaultPipeline?: string;
  defaultDealStage?: string;
}

export default function HubSpotSettingsPage() {
  return (
    <React.Suspense fallback={
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <HubSpotSettingsContent />
    </React.Suspense>
  );
}

function HubSpotSettingsContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = React.useState<HubSpotStatus | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [isDisconnecting, setIsDisconnecting] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [isSavingSettings, setIsSavingSettings] = React.useState(false);
  const [syncSettings, setSyncSettings] = React.useState<SyncSettings>({
    enabled: true,
    syncOnDocumentSent: true,
    syncOnDocumentViewed: false,
    syncOnDocumentSigned: true,
    syncOnDocumentCompleted: true,
    createDealsOnCompletion: false,
    createTasksOnCompletion: false,
  });

  // Check for URL params (success/error messages)
  const successMessage = searchParams.get("success");
  const errorMessage = searchParams.get("error");

  const fetchStatus = React.useCallback(async () => {
    try {
      const response = await fetch("/api/integrations/hubspot/status");
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
    try {
      const response = await fetch("/api/integrations/hubspot/connect");
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
    if (!confirm("Are you sure you want to disconnect HubSpot? This will stop syncing document events to your CRM.")) {
      return;
    }

    setIsDisconnecting(true);
    try {
      await fetch("/api/integrations/hubspot/disconnect", { method: "POST" });
      setStatus({
        connected: false,
        accountEmail: null,
        accountId: null,
        hubDomain: null,
        connectedAt: null,
        lastSync: null,
        syncSettings: null,
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
      await fetchStatus();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSyncSettingsChange = async (key: keyof SyncSettings, value: boolean) => {
    const newSettings = { ...syncSettings, [key]: value };
    setSyncSettings(newSettings);

    setIsSavingSettings(true);
    try {
      await fetch("/api/integrations/hubspot/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ syncSettings: { [key]: value } }),
      });
    } catch (error) {
      console.error("Failed to save settings:", error);
      // Revert on error
      setSyncSettings(syncSettings);
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

  const getErrorMessage = (error: string) => {
    const errorMessages: Record<string, string> = {
      oauth_denied: "You denied the authorization request.",
      missing_params: "Missing required OAuth parameters.",
      invalid_state: "Invalid state parameter. Please try again.",
      state_expired: "The authorization request expired. Please try again.",
      callback_failed: "Failed to complete authorization. Please try again.",
      token_exchange_failed: "Failed to exchange authorization code.",
      not_configured: "HubSpot integration is not configured.",
    };
    return errorMessages[error] || "An unknown error occurred.";
  };

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
              <rect width="32" height="32" rx="8" fill="#FF7A59" />
              <circle cx="16" cy="16" r="4" fill="white" />
              <circle cx="16" cy="8" r="2" fill="white" />
              <circle cx="16" cy="24" r="2" fill="white" />
              <circle cx="8" cy="16" r="2" fill="white" />
              <circle cx="24" cy="16" r="2" fill="white" />
              <path d="M16 10v4M16 18v4M10 16h4M18 16h4" stroke="white" strokeWidth="1.5" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">HubSpot</h1>
            <p className="text-sm text-muted-foreground">
              Sync contacts and deals with your HubSpot CRM
            </p>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage === "connected" && (
        <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
          <Check className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800 dark:text-green-200">Connected Successfully</AlertTitle>
          <AlertDescription className="text-green-700 dark:text-green-300">
            Your HubSpot account has been connected. Document events will now sync to your CRM.
          </AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Connection Failed</AlertTitle>
          <AlertDescription>{getErrorMessage(errorMessage)}</AlertDescription>
        </Alert>
      )}

      {/* Connection Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Connection Status</CardTitle>
              <CardDescription>
                Connect your HubSpot account to sync document events and manage contacts.
              </CardDescription>
            </div>
            {status?.connected ? (
              <Badge className="bg-green-600">
                <Check className="mr-1 h-3 w-3" />
                Connected
              </Badge>
            ) : status?.tokenExpired ? (
              <Badge variant="destructive">
                <AlertCircle className="mr-1 h-3 w-3" />
                Token Expired
              </Badge>
            ) : (
              <Badge variant="secondary">Not Connected</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {status?.connected ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-sm font-medium">Account</p>
                    <p className="text-sm text-muted-foreground">
                      {status.accountEmail || "Connected Account"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Hub ID</p>
                    <p className="text-sm text-muted-foreground">
                      {status.accountId || "N/A"}
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
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Last synced: {status.lastSync ? formatDate(status.lastSync) : "Never"}
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
                  <Users className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-medium">No Connection</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Connect your HubSpot account to sync document events.
                </p>
              </div>
              <div className="rounded-lg bg-orange-50 p-4 dark:bg-orange-900/20">
                <h4 className="text-sm font-medium text-orange-900 dark:text-orange-100">
                  What happens when you connect:
                </h4>
                <ul className="mt-2 space-y-1 text-sm text-orange-800 dark:text-orange-200">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Sync document events (sent, viewed, signed) to contacts
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Automatically add timeline notes when documents are signed
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Optionally create deals when documents are completed
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Pick recipients from your HubSpot contacts
                  </li>
                </ul>
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
              <Button asChild variant="outline">
                <a
                  href={status.hubDomain ? `https://app.hubspot.com/contacts/${status.accountId}` : "https://app.hubspot.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open HubSpot
                </a>
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
                  Connect HubSpot
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Sync Settings */}
      {status?.connected && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              <CardTitle>Sync Settings</CardTitle>
            </div>
            <CardDescription>
              Configure what events get synced to HubSpot
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Master toggle */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Enable Sync</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically sync document events to HubSpot
                </p>
              </div>
              <Switch
                checked={syncSettings.enabled}
                onCheckedChange={(checked) => handleSyncSettingsChange("enabled", checked)}
                disabled={isSavingSettings}
              />
            </div>

            <Separator />

            {/* Event toggles */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Sync Events</h4>

              <div className="space-y-4 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Document Sent</Label>
                    <p className="text-sm text-muted-foreground">
                      Add note when a document is sent to a recipient
                    </p>
                  </div>
                  <Switch
                    checked={syncSettings.syncOnDocumentSent}
                    onCheckedChange={(checked) => handleSyncSettingsChange("syncOnDocumentSent", checked)}
                    disabled={isSavingSettings || !syncSettings.enabled}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Document Viewed</Label>
                    <p className="text-sm text-muted-foreground">
                      Add note when a recipient views a document
                    </p>
                  </div>
                  <Switch
                    checked={syncSettings.syncOnDocumentViewed}
                    onCheckedChange={(checked) => handleSyncSettingsChange("syncOnDocumentViewed", checked)}
                    disabled={isSavingSettings || !syncSettings.enabled}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Document Signed</Label>
                    <p className="text-sm text-muted-foreground">
                      Add note when a recipient signs a document
                    </p>
                  </div>
                  <Switch
                    checked={syncSettings.syncOnDocumentSigned}
                    onCheckedChange={(checked) => handleSyncSettingsChange("syncOnDocumentSigned", checked)}
                    disabled={isSavingSettings || !syncSettings.enabled}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Document Completed</Label>
                    <p className="text-sm text-muted-foreground">
                      Add note when all signatures are collected
                    </p>
                  </div>
                  <Switch
                    checked={syncSettings.syncOnDocumentCompleted}
                    onCheckedChange={(checked) => handleSyncSettingsChange("syncOnDocumentCompleted", checked)}
                    disabled={isSavingSettings || !syncSettings.enabled}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Advanced options */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Advanced Options</h4>

              <div className="space-y-4 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Create Deals
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically create a deal when a document is completed
                    </p>
                  </div>
                  <Switch
                    checked={syncSettings.createDealsOnCompletion}
                    onCheckedChange={(checked) => handleSyncSettingsChange("createDealsOnCompletion", checked)}
                    disabled={isSavingSettings || !syncSettings.enabled}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      Create Follow-up Tasks
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Create a task to follow up after document completion
                    </p>
                  </div>
                  <Switch
                    checked={syncSettings.createTasksOnCompletion}
                    onCheckedChange={(checked) => handleSyncSettingsChange("createTasksOnCompletion", checked)}
                    disabled={isSavingSettings || !syncSettings.enabled}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Features Card */}
      {status?.connected && (
        <Card>
          <CardHeader>
            <CardTitle>HubSpot Features</CardTitle>
            <CardDescription>
              What you can do with HubSpot integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="mt-3 font-medium">Contact Sync</h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  Pick recipients from your HubSpot contacts when sending documents.
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
                  <Building2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <h4 className="mt-3 font-medium">Timeline Events</h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  Document activities appear in your contacts timeline.
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/20">
                  <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <h4 className="mt-3 font-medium">Deal Creation</h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  Automatically create deals when documents are signed.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Section */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
          <CardDescription>
            Learn more about the HubSpot integration.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">How does sync work?</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>- Events sync automatically based on your settings</li>
                <li>- Notes are added to the contact timeline</li>
                <li>- New contacts are created if they do not exist</li>
                <li>- Deals can be created on document completion</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Required permissions</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>- Read/write contacts</li>
                <li>- Read companies</li>
                <li>- Read/write deals</li>
                <li>- Read owners</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
