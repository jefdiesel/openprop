"use client";

import * as React from "react";
import Link from "next/link";
import { Save, Upload, Check, ExternalLink, Loader2, FileUp, CreditCard, Sparkles, Crown, Wallet, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/use-subscription";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface SettingsData {
  user: {
    name: string;
    email: string;
  };
  profile: {
    companyName: string;
    brandColor: string;
    stripeAccountId: string | null;
    stripeAccountEnabled: boolean;
    walletAddress: string | null;
  };
}

interface SubscriptionData {
  planId: string;
  status: string;
  isEarlyBird: boolean;
  billingInterval: "monthly" | "yearly";
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

interface PlanData {
  name: string;
  priceMonthly: number;
  priceYearly: number;
  earlyBirdPriceMonthly: number;
  earlyBirdPriceYearly: number;
  features: string[];
}

export default function SettingsPage() {
  const subscription = useSubscription();
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    companyName: "",
  });
  const [brandingData, setBrandingData] = React.useState({
    brandColor: "#000000",
  });
  const [stripeData, setStripeData] = React.useState({
    connected: false,
    accountId: null as string | null,
  });
  const [walletData, setWalletData] = React.useState({
    address: "",
    isSaving: false,
  });
  const [subscriptionData, setSubscriptionData] = React.useState<{
    subscription: SubscriptionData | null;
    plan: PlanData | null;
    loading: boolean;
    openingPortal: boolean;
  }>({
    subscription: null,
    plan: null,
    loading: true,
    openingPortal: false,
  });

  // Load settings on mount
  React.useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        if (!res.ok) throw new Error("Failed to load settings");
        const data: SettingsData = await res.json();

        setFormData({
          name: data.user.name,
          email: data.user.email,
          companyName: data.profile.companyName,
        });
        setBrandingData({
          brandColor: data.profile.brandColor,
        });
        setStripeData({
          connected: data.profile.stripeAccountEnabled,
          accountId: data.profile.stripeAccountId,
        });
        setWalletData({
          address: data.profile.walletAddress || "",
          isSaving: false,
        });
      } catch (error) {
        console.error("Failed to load settings:", error);
        toast.error("Failed to load settings");
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  // Load subscription data
  React.useEffect(() => {
    async function loadSubscription() {
      try {
        const res = await fetch("/api/billing/subscription");
        if (!res.ok) throw new Error("Failed to load subscription");
        const data = await res.json();

        setSubscriptionData({
          subscription: {
            planId: data.subscription.planId || data.subscription.plan_id || "free",
            status: data.subscription.status || "active",
            isEarlyBird: data.subscription.isEarlyBird || data.subscription.is_early_bird || false,
            billingInterval: data.subscription.billingInterval || data.subscription.billing_interval || "monthly",
            currentPeriodEnd: data.subscription.currentPeriodEnd || data.subscription.current_period_end || null,
            cancelAtPeriodEnd: data.subscription.cancelAtPeriodEnd || data.subscription.cancel_at_period_end || false,
          },
          plan: data.plan,
          loading: false,
          openingPortal: false,
        });
      } catch (error) {
        console.error("Failed to load subscription:", error);
        setSubscriptionData(prev => ({ ...prev, loading: false }));
      }
    }
    loadSubscription();
  }, []);

  const handleOpenBillingPortal = async () => {
    setSubscriptionData(prev => ({ ...prev, openingPortal: true }));
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      if (!res.ok) {
        const error = await res.json();
        if (res.status === 404) {
          toast.error("No active subscription found. Upgrade to a paid plan first.");
        } else {
          throw new Error(error.error || "Failed to open billing portal");
        }
        return;
      }
      const data = await res.json();
      window.location.href = data.url;
    } catch (error) {
      console.error("Failed to open billing portal:", error);
      toast.error("Failed to open billing portal");
    } finally {
      setSubscriptionData(prev => ({ ...prev, openingPortal: false }));
    }
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(0)}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          companyName: formData.companyName,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success("Profile saved");
    } catch (error) {
      console.error("Failed to save profile:", error);
      toast.error("Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveBranding = async () => {
    // Check if user has access to custom branding
    if (!subscription.canUseCustomBranding) {
      toast.error("Custom branding is only available on Pro and higher plans");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandColor: brandingData.brandColor,
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to save");
      }
      toast.success("Branding saved");
    } catch (error) {
      console.error("Failed to save branding:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save branding");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveWallet = async () => {
    setWalletData(prev => ({ ...prev, isSaving: true }));
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: walletData.address || null,
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to save");
      }
      toast.success("Wallet address saved");
    } catch (error) {
      console.error("Failed to save wallet:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save wallet");
    } finally {
      setWalletData(prev => ({ ...prev, isSaving: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and contact details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed
                  </p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="company">Company Name</Label>
                  <Input
                    id="company"
                    value={formData.companyName}
                    onChange={(e) =>
                      setFormData({ ...formData, companyName: e.target.value })
                    }
                    placeholder="Enter your company name"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-6">
              <Button onClick={handleSaveProfile} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Branding Tab */}
        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>Brand Settings</CardTitle>
                  <CardDescription>
                    Customize the appearance of your documents with your brand
                    colors and logo.
                  </CardDescription>
                </div>
                {!subscription.canUseCustomBranding && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    Pro Feature
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Upgrade Notice for Free Users */}
              {!subscription.canUseCustomBranding && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
                  <div className="flex items-start gap-3">
                    <Crown className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-amber-900 dark:text-amber-100">
                        Upgrade to Pro for Custom Branding
                      </h4>
                      <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                        Custom branding is available on Pro and higher plans. Upgrade to personalize your documents with your brand colors and logo.
                      </p>
                      <Button asChild size="sm" className="mt-3">
                        <Link href="/pricing">
                          <Sparkles className="mr-2 h-4 w-4" />
                          View Pro Plans
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Logo Upload */}
              <div className="space-y-4">
                <Label>Company Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="flex h-24 w-24 items-center justify-center rounded-lg border-2 border-dashed bg-muted">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" disabled>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Logo (Coming Soon)
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG or SVG. Max 2MB. Recommended: 200x200px
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Color Picker */}
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="brandColor">Brand Color</Label>
                  <div className="flex gap-2">
                    <div
                      className="h-10 w-10 rounded-md border"
                      style={{ backgroundColor: brandingData.brandColor }}
                    />
                    <Input
                      id="brandColor"
                      type="text"
                      value={brandingData.brandColor}
                      onChange={(e) =>
                        setBrandingData({
                          ...brandingData,
                          brandColor: e.target.value,
                        })
                      }
                      placeholder="#000000"
                      disabled={!subscription.canUseCustomBranding}
                    />
                    <Input
                      type="color"
                      value={brandingData.brandColor}
                      onChange={(e) =>
                        setBrandingData({
                          ...brandingData,
                          brandColor: e.target.value,
                        })
                      }
                      className="h-10 w-14 cursor-pointer p-1"
                      disabled={!subscription.canUseCustomBranding}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Used for headers and accents in your documents
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-6">
              <Button
                onClick={handleSaveBranding}
                disabled={isSaving || !subscription.canUseCustomBranding}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Branding
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing">
          <div className="space-y-6">
            {/* Current Plan */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle>Current Plan</CardTitle>
                      {subscriptionData.subscription?.isEarlyBird && (
                        <Badge className="bg-amber-500">
                          <Sparkles className="mr-1 h-3 w-3" />
                          Early Bird
                        </Badge>
                      )}
                    </div>
                    <CardDescription>
                      Manage your subscription and billing details.
                    </CardDescription>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Crown className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {subscriptionData.loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Plan Details */}
                    <div className="rounded-lg border bg-muted/50 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold">
                            {subscriptionData.plan?.name || "Free"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {subscriptionData.subscription?.planId === "free" ? (
                              "Self-hosted, forever free"
                            ) : (
                              <>
                                {subscriptionData.subscription?.isEarlyBird
                                  ? formatPrice(
                                      subscriptionData.subscription?.billingInterval === "yearly"
                                        ? subscriptionData.plan?.earlyBirdPriceYearly || 0
                                        : subscriptionData.plan?.earlyBirdPriceMonthly || 0
                                    )
                                  : formatPrice(
                                      subscriptionData.subscription?.billingInterval === "yearly"
                                        ? subscriptionData.plan?.priceYearly || 0
                                        : subscriptionData.plan?.priceMonthly || 0
                                    )}
                                /{subscriptionData.subscription?.billingInterval === "yearly" ? "year" : "month"}
                              </>
                            )}
                          </p>
                        </div>
                        {subscriptionData.subscription?.planId !== "free" && (
                          <Badge variant={subscriptionData.subscription?.status === "active" ? "default" : "secondary"}>
                            {subscriptionData.subscription?.cancelAtPeriodEnd
                              ? "Canceling"
                              : subscriptionData.subscription?.status}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Billing Info */}
                    {subscriptionData.subscription?.planId !== "free" && (
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Billing Cycle</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {subscriptionData.subscription?.billingInterval}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">
                            {subscriptionData.subscription?.cancelAtPeriodEnd
                              ? "Access Until"
                              : "Next Billing Date"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(subscriptionData.subscription?.currentPeriodEnd || null)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Plan Features */}
                    {subscriptionData.plan?.features && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Plan Features</p>
                        <ul className="grid gap-2 sm:grid-cols-2">
                          {subscriptionData.plan.features.map((feature, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Check className="h-4 w-4 text-green-600" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex gap-2 border-t pt-6">
                {subscriptionData.subscription?.planId === "free" ? (
                  <Button asChild>
                    <Link href="/pricing">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Upgrade to Pro
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleOpenBillingPortal}
                      disabled={subscriptionData.openingPortal}
                    >
                      {subscriptionData.openingPortal ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Opening...
                        </>
                      ) : (
                        <>
                          <CreditCard className="mr-2 h-4 w-4" />
                          Manage Billing
                        </>
                      )}
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/pricing">
                        View Plans
                      </Link>
                    </Button>
                  </>
                )}
              </CardFooter>
            </Card>

            {/* Payment Methods - For paid users */}
            {subscriptionData.subscription?.planId !== "free" && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                  <CardDescription>
                    Update your payment method through the Stripe billing portal.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Your payment method and billing history are managed securely through Stripe.
                    Click &quot;Manage Billing&quot; above to update your card, view invoices, or download receipts.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>Integrations</CardTitle>
                  <CardDescription>
                    Connect SendProp with your favorite tools and services.
                  </CardDescription>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <ExternalLink className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Manage all your integrations including DocuSign, Google Drive,
                  Dropbox, QuickBooks, and more from our dedicated integrations page.
                </p>
                <div className="rounded-lg border bg-muted/50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background">
                      <ExternalLink className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">Available Integrations</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Stripe - Accept payments directly</li>
                        <li>• DocuSign - E-signature capabilities</li>
                        <li>• Google Drive & Dropbox - Cloud storage</li>
                        <li>• HubSpot & Salesforce - CRM sync</li>
                        <li>• QuickBooks - Invoice management</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-6">
              <Button asChild size="lg">
                <Link href="/settings/integrations">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Manage All Integrations
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
