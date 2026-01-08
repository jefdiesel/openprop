'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle2, XCircle, Building2, Calendar, RefreshCw } from 'lucide-react';

interface QuickBooksStatus {
  connected: boolean;
  companyName: string | null;
  realmId: string | null;
  environment: string;
  connectedAt: string | null;
  lastSync: string | null;
  tokenExpired: boolean;
  autoCreateInvoice: boolean;
}

function QuickBooksIntegrationContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<QuickBooksStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Check for OAuth callback results
  useEffect(() => {
    const errorParam = searchParams.get('error');
    const successParam = searchParams.get('success');

    if (errorParam) {
      setError(getErrorMessage(errorParam));
    } else if (successParam === 'connected') {
      setSuccess('Successfully connected to QuickBooks!');
    }
  }, [searchParams]);

  // Load integration status
  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/integrations/quickbooks/status');
      if (!response.ok) {
        throw new Error('Failed to load status');
      }
      const data = await response.json();
      setStatus(data);
    } catch (err) {
      setError('Failed to load QuickBooks integration status');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setConnecting(true);
      setError(null);

      const response = await fetch('/api/integrations/quickbooks/connect');
      if (!response.ok) {
        throw new Error('Failed to initiate connection');
      }

      const data = await response.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (err) {
      setError('Failed to connect to QuickBooks');
      console.error(err);
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect QuickBooks? This will stop automatic invoice syncing.')) {
      return;
    }

    try {
      setDisconnecting(true);
      setError(null);

      const response = await fetch('/api/integrations/quickbooks/disconnect', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to disconnect');
      }

      setSuccess('Successfully disconnected from QuickBooks');
      await loadStatus();
    } catch (err) {
      setError('Failed to disconnect from QuickBooks');
      console.error(err);
    } finally {
      setDisconnecting(false);
    }
  };

  const handleToggleAutoInvoice = async (enabled: boolean) => {
    // This would require a new API endpoint to update settings
    // For now, we'll just update the UI optimistically
    if (status) {
      setStatus({ ...status, autoCreateInvoice: enabled });
    }
  };

  const getErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'oauth_denied':
        return 'QuickBooks authorization was denied';
      case 'missing_params':
        return 'Missing required parameters from QuickBooks';
      case 'invalid_state':
        return 'Invalid state parameter - possible CSRF attack';
      case 'state_expired':
        return 'Authorization request expired - please try again';
      case 'token_exchange_failed':
        return 'Failed to exchange authorization code for tokens';
      case 'callback_failed':
        return 'Failed to complete QuickBooks authorization';
      default:
        return 'An error occurred with QuickBooks integration';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">QuickBooks Integration</h1>
        <p className="text-muted-foreground mt-2">
          Sync your proposals and payments with QuickBooks Online for seamless accounting.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Connection Status</CardTitle>
          <CardDescription>
            Manage your QuickBooks Online integration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {status?.connected ? (
            <>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Connected to QuickBooks</span>
                  {status.tokenExpired && (
                    <span className="text-sm text-amber-600">(Token expired - please reconnect)</span>
                  )}
                </div>

                {status.companyName && (
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span>{status.companyName}</span>
                    {status.environment === 'sandbox' && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs rounded">
                        Sandbox
                      </span>
                    )}
                  </div>
                )}

                {status.connectedAt && (
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Connected {new Date(status.connectedAt).toLocaleDateString()}</span>
                  </div>
                )}

                {status.lastSync && (
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <RefreshCw className="h-4 w-4" />
                    <span>Last synced {new Date(status.lastSync).toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="auto-invoice">Auto-create invoices</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically create QuickBooks invoices when proposals are accepted
                    </p>
                  </div>
                  <Switch
                    id="auto-invoice"
                    checked={status.autoCreateInvoice}
                    onCheckedChange={handleToggleAutoInvoice}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                {status.tokenExpired && (
                  <Button onClick={handleConnect} disabled={connecting}>
                    {connecting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Reconnecting...
                      </>
                    ) : (
                      'Reconnect'
                    )}
                  </Button>
                )}
                <Button
                  variant="destructive"
                  onClick={handleDisconnect}
                  disabled={disconnecting}
                >
                  {disconnecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Disconnecting...
                    </>
                  ) : (
                    'Disconnect'
                  )}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <XCircle className="h-5 w-5" />
                  <span>Not connected to QuickBooks</span>
                </div>

                <p className="text-sm text-muted-foreground">
                  Connect your QuickBooks Online account to automatically sync customers,
                  create invoices, and record payments when proposals are accepted.
                </p>

                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <p className="font-medium text-sm">What you can do with this integration:</p>
                  <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                    <li>Automatically find or create customers from proposal recipients</li>
                    <li>Create invoices with line items from your pricing tables</li>
                    <li>Record payments when proposals are paid</li>
                    <li>Keep your accounting synchronized with your proposals</li>
                  </ul>
                </div>
              </div>

              <Button onClick={handleConnect} disabled={connecting}>
                {connecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  'Connect QuickBooks'
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How it works</CardTitle>
          <CardDescription>
            Understanding the QuickBooks sync process
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div>
                <p className="font-medium">Customer Creation</p>
                <p className="text-sm text-muted-foreground">
                  When a proposal is accepted, we search for the recipient by email in QuickBooks.
                  If not found, we create a new customer automatically.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <div>
                <p className="font-medium">Invoice Generation</p>
                <p className="text-sm text-muted-foreground">
                  An invoice is created with line items from your pricing table, including
                  descriptions, quantities, and prices.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <div>
                <p className="font-medium">Payment Recording</p>
                <p className="text-sm text-muted-foreground">
                  If payment was collected, we automatically record the payment against the
                  invoice in QuickBooks.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function QuickBooksIntegrationPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <QuickBooksIntegrationContent />
    </Suspense>
  );
}
