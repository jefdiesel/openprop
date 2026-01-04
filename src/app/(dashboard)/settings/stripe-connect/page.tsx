"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  CreditCard,
  DollarSign,
  RefreshCw,
  Building,
} from "lucide-react";

interface ConnectAccountStatus {
  accountId: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  requirements: {
    currentlyDue: string[];
    pastDue: string[];
    eventuallyDue: string[];
  };
}

function StripeConnectContent() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [accountStatus, setAccountStatus] = useState<ConnectAccountStatus | null>(null);
  const [hasAccount, setHasAccount] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for success/refresh from URL params
  useEffect(() => {
    const success = searchParams.get("success");
    const refresh = searchParams.get("refresh");

    if (success === "true") {
      toast.success("Stripe account connected successfully!");
    }
    if (refresh === "true") {
      toast.info("Please complete your Stripe account setup.");
    }
  }, [searchParams]);

  // Fetch account status on mount
  useEffect(() => {
    async function fetchAccountStatus() {
      try {
        const response = await fetch("/api/stripe/connect/status");
        const data = await response.json();

        if (response.ok && data.hasAccount) {
          setHasAccount(true);
          setAccountStatus(data.status);
        } else {
          setHasAccount(false);
        }
      } catch (err) {
        console.error("Error fetching account status:", err);
        setError("Failed to load account status");
      } finally {
        setIsLoading(false);
      }
    }

    fetchAccountStatus();
  }, []);

  // Handle connect account
  const handleConnect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const response = await fetch("/api/stripe/connect/create", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create Stripe account");
      }

      // Redirect to Stripe onboarding
      window.location.href = data.onboardingUrl;
    } catch (err) {
      console.error("Error connecting Stripe:", err);
      setError(err instanceof Error ? err.message : "Failed to connect Stripe");
      toast.error("Failed to start Stripe onboarding");
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Handle continue onboarding
  const handleContinueOnboarding = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const response = await fetch("/api/stripe/connect/onboarding-link", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get onboarding link");
      }

      window.location.href = data.url;
    } catch (err) {
      console.error("Error getting onboarding link:", err);
      setError(err instanceof Error ? err.message : "Failed to continue onboarding");
      toast.error("Failed to continue Stripe onboarding");
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Handle open dashboard
  const handleOpenDashboard = useCallback(async () => {
    try {
      const response = await fetch("/api/stripe/connect/dashboard-link", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get dashboard link");
      }

      window.open(data.url, "_blank");
    } catch (err) {
      console.error("Error getting dashboard link:", err);
      toast.error("Failed to open Stripe dashboard");
    }
  }, []);

  // Handle refresh status
  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/stripe/connect/status");
      const data = await response.json();

      if (response.ok && data.hasAccount) {
        setHasAccount(true);
        setAccountStatus(data.status);
        toast.success("Status refreshed");
      }
    } catch (err) {
      console.error("Error refreshing status:", err);
      toast.error("Failed to refresh status");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Stripe Connect</h1>
          <p className="text-muted-foreground">
            Connect your Stripe account to receive payments
          </p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Account fully connected
  const isFullyConnected =
    accountStatus?.chargesEnabled && accountStatus?.payoutsEnabled;

  // Account needs attention
  const needsAttention =
    hasAccount && accountStatus && !isFullyConnected;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Stripe Connect</h1>
          <p className="text-muted-foreground">
            Connect your Stripe account to receive payments from documents
          </p>
        </div>
        {hasAccount && (
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Not connected */}
      {!hasAccount && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Connect Stripe</CardTitle>
            </div>
            <CardDescription>
              Connect your Stripe account to start accepting payments from your
              documents. Payments will be deposited directly to your bank account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Collect Payments</p>
                  <p className="text-sm text-muted-foreground">
                    Accept credit cards and other payment methods
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <Building className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Direct Deposits</p>
                  <p className="text-sm text-muted-foreground">
                    Payments go directly to your bank account
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Easy Setup</p>
                  <p className="text-sm text-muted-foreground">
                    Connect in minutes with Stripe Express
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <Button onClick={handleConnect} disabled={isConnecting} size="lg">
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Connecting...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Connect with Stripe
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground">
              By connecting, you agree to Stripe&apos;s{" "}
              <a
                href="https://stripe.com/connect-account/legal"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground"
              >
                Connected Account Agreement
              </a>
              .
            </p>
          </CardContent>
        </Card>
      )}

      {/* Connected but needs attention */}
      {needsAttention && (
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <CardTitle className="text-yellow-800 dark:text-yellow-200">
                  Action Required
                </CardTitle>
              </div>
              <Badge variant="outline" className="border-yellow-600 text-yellow-600">
                Incomplete
              </Badge>
            </div>
            <CardDescription className="text-yellow-700 dark:text-yellow-300">
              Your Stripe account needs additional information before you can
              receive payments.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md bg-white/50 dark:bg-black/20 p-4">
              <h4 className="font-medium mb-2">Account Status</h4>
              <div className="grid gap-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Can accept payments:</span>
                  <Badge variant={accountStatus.chargesEnabled ? "default" : "secondary"}>
                    {accountStatus.chargesEnabled ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Can receive payouts:</span>
                  <Badge variant={accountStatus.payoutsEnabled ? "default" : "secondary"}>
                    {accountStatus.payoutsEnabled ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Details submitted:</span>
                  <Badge variant={accountStatus.detailsSubmitted ? "default" : "secondary"}>
                    {accountStatus.detailsSubmitted ? "Yes" : "No"}
                  </Badge>
                </div>
              </div>

              {accountStatus.requirements.currentlyDue.length > 0 && (
                <div className="mt-4">
                  <h5 className="text-sm font-medium mb-1">Required information:</h5>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {accountStatus.requirements.currentlyDue.map((req, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-yellow-600" />
                        {req.replace(/_/g, " ").replace(/\./g, " > ")}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <Button onClick={handleContinueOnboarding} disabled={isConnecting}>
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Loading...
                </>
              ) : (
                <>
                  Continue Setup
                  <ExternalLink className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>

            <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-4">
              <strong>Note:</strong> Stripe&apos;s verification process may not request all information upfront.
              If you&apos;ve already submitted details, click Continue Setup to see if additional information
              is now required. ID verification and full SSN are sometimes requested in later steps, not during
              the initial setup.
            </p>

            <p className="text-xs text-muted-foreground">
              Having trouble?{" "}
              <a
                href="https://dashboard.stripe.com/express"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground"
              >
                Manage your account directly on Stripe
              </a>
            </p>
          </CardContent>
        </Card>
      )}

      {/* Fully connected */}
      {isFullyConnected && (
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                <CardTitle className="text-green-800 dark:text-green-200">
                  Connected
                </CardTitle>
              </div>
              <Badge className="bg-green-600">Active</Badge>
            </div>
            <CardDescription className="text-green-700 dark:text-green-300">
              Your Stripe account is connected and ready to receive payments.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md bg-white/50 dark:bg-black/20 p-4">
              <div className="grid gap-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Account ID:</span>
                  <code className="rounded bg-muted px-2 py-0.5 text-xs">
                    {accountStatus?.accountId}
                  </code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Payments:</span>
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Enabled
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Payouts:</span>
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Enabled
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleOpenDashboard}>
                Open Stripe Dashboard
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">How it works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            When you enable payment collection on a document, recipients will be
            able to pay directly through the signing flow. Payments are processed
            by Stripe and deposited to your connected bank account.
          </p>
          <div className="grid gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                1
              </span>
              <span>Enable payments in document settings</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                2
              </span>
              <span>Set payment amount (fixed or from pricing table)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                3
              </span>
              <span>Recipient pays when signing the document</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                4
              </span>
              <span>Funds are deposited to your Stripe account</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function StripeConnectPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Stripe Connect</h1>
            <p className="text-muted-foreground">
              Connect your Stripe account to receive payments
            </p>
          </div>
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        </div>
      }
    >
      <StripeConnectContent />
    </Suspense>
  );
}
