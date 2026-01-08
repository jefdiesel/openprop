"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  ExternalLink,
  FileText,
  Loader2,
  RefreshCw,
  Trash2,
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
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ConnectionStatus {
  connected: boolean;
  accountEmail?: string;
  accountName?: string;
  userName?: string;
  connectedAt?: string;
  tokenExpired?: boolean;
}

function DocuSignSettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [connection, setConnection] = React.useState<ConnectionStatus | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [isDisconnecting, setIsDisconnecting] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  // Check for OAuth callback errors/success
  React.useEffect(() => {
    const errorParam = searchParams.get('error');
    const successParam = searchParams.get('success');

    if (errorParam) {
      const errorMessages: Record<string, string> = {
        oauth_denied: 'OAuth authorization was denied',
        missing_params: 'Missing required parameters',
        invalid_state: 'Invalid state parameter',
        state_expired: 'Authorization request expired',
        token_exchange_failed: 'Failed to exchange authorization code',
        callback_failed: 'Callback failed',
        config_missing: 'DocuSign not properly configured',
        no_account: 'No DocuSign account found',
      };
      setError(errorMessages[errorParam] || 'An unknown error occurred');
    } else if (successParam === 'connected') {
      setSuccess('Successfully connected to DocuSign');
      // Refresh connection status
      fetchConnectionStatus();
    }

    // Clear URL parameters
    if (errorParam || successParam) {
      router.replace('/settings/integrations/docusign');
    }
  }, [searchParams, router]);

  const fetchConnectionStatus = React.useCallback(async () => {
    try {
      const response = await fetch("/api/integrations/docusign/status");
      const data = await response.json();
      setConnection(data);
    } catch (error) {
      console.error("Failed to fetch connection status:", error);
      setError("Failed to fetch connection status");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchConnectionStatus();
  }, [fetchConnectionStatus]);

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const response = await fetch("/api/integrations/docusign/connect");
      const data = await response.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        setError("Failed to get authorization URL");
      }
    } catch (error) {
      console.error("Failed to connect:", error);
      setError("Failed to initiate connection");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect DocuSign? This will remove access to your templates and envelopes.")) {
      return;
    }

    setIsDisconnecting(true);
    setError(null);
    try {
      const response = await fetch("/api/integrations/docusign/disconnect", { method: "POST" });
      if (response.ok) {
        setConnection({
          connected: false,
        });
        setSuccess("Successfully disconnected from DocuSign");
      } else {
        setError("Failed to disconnect");
      }
    } catch (error) {
      console.error("Failed to disconnect:", error);
      setError("Failed to disconnect");
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleRefreshConnection = async () => {
    setIsRefreshing(true);
    setError(null);
    await fetchConnectionStatus();
    setIsRefreshing(false);
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

  if (isLoading) {
    return (
      <div className="container max-w-5xl py-8">
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/settings/integrations"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Integrations
        </Link>
        <h1 className="text-3xl font-bold">DocuSign Integration</h1>
        <p className="text-muted-foreground mt-2">
          Connect your DocuSign account to import templates and send documents for signature.
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 border-green-600 text-green-600">
          <Check className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Connection Status Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Connection Status</CardTitle>
            {connection?.connected && (
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
            )}
          </div>
        </CardHeader>
        <CardContent>
          {connection?.connected ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className="bg-green-600">
                  <Check className="mr-1 h-3 w-3" />
                  Connected
                </Badge>
                {connection.tokenExpired && (
                  <Badge variant="destructive">
                    <AlertCircle className="mr-1 h-3 w-3" />
                    Token Expired
                  </Badge>
                )}
              </div>

              <Separator />

              <div className="grid gap-2">
                {connection.accountEmail && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Account Email</span>
                    <span className="text-sm font-medium">{connection.accountEmail}</span>
                  </div>
                )}
                {connection.accountName && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Account Name</span>
                    <span className="text-sm font-medium">{connection.accountName}</span>
                  </div>
                )}
                {connection.userName && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">User</span>
                    <span className="text-sm font-medium">{connection.userName}</span>
                  </div>
                )}
                {connection.connectedAt && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Connected At</span>
                    <span className="text-sm font-medium">{formatDate(connection.connectedAt)}</span>
                  </div>
                )}
              </div>

              {connection.tokenExpired && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Your DocuSign token has expired. Please reconnect to continue using the integration.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="flex justify-center mb-4">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">Not Connected</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Connect your DocuSign account to start importing templates and sending documents.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {connection?.connected ? (
            <>
              <Button
                variant="outline"
                onClick={() => router.push('/import/docusign')}
              >
                <FileText className="mr-2 h-4 w-4" />
                Import Templates
              </Button>
              <Button
                variant="destructive"
                onClick={handleDisconnect}
                disabled={isDisconnecting}
              >
                {isDisconnecting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Disconnect
              </Button>
            </>
          ) : (
            <Button onClick={handleConnect} disabled={isConnecting} className="w-full">
              {isConnecting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ExternalLink className="mr-2 h-4 w-4" />
              )}
              Connect DocuSign
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* About DocuSign Card */}
      <Card>
        <CardHeader>
          <CardTitle>About DocuSign Integration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Features</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Import DocuSign templates as OpenProposal documents</li>
              <li>Import sent envelopes with signature status</li>
              <li>Send documents via DocuSign for signature</li>
              <li>Two-way sync of signature fields and tabs</li>
              <li>Preserve custom fields and recipients</li>
            </ul>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-2">Security</h3>
            <p className="text-sm text-muted-foreground">
              We use OAuth 2.0 to securely connect to your DocuSign account. Your credentials are never stored,
              and you can revoke access at any time.
            </p>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-2">Learn More</h3>
            <a
              href="https://www.docusign.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline inline-flex items-center"
            >
              Visit DocuSign
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DocuSignSettingsPage() {
  return (
    <Suspense fallback={
      <div className="container max-w-5xl py-8">
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    }>
      <DocuSignSettingsContent />
    </Suspense>
  );
}
