"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  FileText,
  Link2,
  Settings,
  Zap,
  Loader2,
  AlertTriangle,
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

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: "document" | "payment" | "crm" | "storage";
  connected: boolean;
  available: boolean;
  href?: string;
  comingSoon?: boolean;
}

// Base integration configurations (connection status will be fetched from API)
const baseIntegrations: Integration[] = [
  {
    id: "stripe",
    name: "Stripe",
    description: "Accept payments directly within your proposals and contracts.",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="#635BFF">
        <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" />
      </svg>
    ),
    category: "payment",
    connected: true, // Stripe is hardcoded as connected (profile-based)
    available: true,
    href: "/settings",
  },
  {
    id: "docusign",
    name: "DocuSign",
    description: "Import templates and leverage DocuSign's e-signature capabilities.",
    icon: (
      <svg
        className="h-6 w-6"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="32" height="32" rx="8" fill="#FFC107" />
        <path
          d="M8 16c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8-8-3.6-8-8zm8-6c-3.3 0-6 2.7-6 6s2.7 6 6 6 6-2.7 6-6-2.7-6-6-6z"
          fill="white"
        />
        <path d="M14 14l2 2 4-4" stroke="white" strokeWidth="2" fill="none" />
      </svg>
    ),
    category: "document",
    connected: false,
    available: true,
    href: "/settings/integrations/docusign",
  },
  {
    id: "hubspot",
    name: "HubSpot",
    description: "Sync contacts and deals with your HubSpot CRM.",
    icon: (
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
    ),
    category: "crm",
    connected: false,
    available: false,
    comingSoon: true,
    href: "/settings/integrations/hubspot",
  },
  {
    id: "salesforce",
    name: "Salesforce",
    description: "Connect your Salesforce account to sync opportunities and contacts.",
    icon: (
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
    ),
    category: "crm",
    connected: false,
    available: false,
    comingSoon: true,
    href: "/settings/integrations/salesforce",
  },
  {
    id: "google_drive",
    name: "Google Drive",
    description: "Save signed documents directly to your Google Drive.",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M12 11L7.5 3h9L12 11z" />
        <path fill="#FBBC05" d="M7.5 3L3 11l4.5 8h9L12 11 7.5 3z" />
        <path fill="#34A853" d="M16.5 11L12 19l4.5 8h9l-9-16z" />
        <path fill="#EA4335" d="M3 11l4.5 8h9l-4.5-8H3z" />
      </svg>
    ),
    category: "storage",
    connected: false,
    available: true,
    href: "/settings/integrations/google-drive",
  },
  {
    id: "dropbox",
    name: "Dropbox",
    description: "Automatically backup signed documents to your Dropbox.",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="#0061FF">
        <path d="M6 2l6 4-6 4 6 4-6 4-6-4 6-4-6-4 6-4zm12 0l6 4-6 4 6 4-6 4-6-4 6-4-6-4 6-4z" />
      </svg>
    ),
    category: "storage",
    connected: false,
    available: true,
    href: "/settings/integrations/dropbox",
  },
  {
    id: "quickbooks",
    name: "QuickBooks",
    description: "Sync invoices and payment data with QuickBooks.",
    icon: (
      <svg
        className="h-6 w-6"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="32" height="32" rx="8" fill="#2CA01C" />
        <circle cx="16" cy="16" r="8" stroke="white" strokeWidth="2" fill="none" />
        <path d="M13 16h6M16 13v6" stroke="white" strokeWidth="2" />
      </svg>
    ),
    category: "payment",
    connected: false,
    available: true,
    href: "/settings/integrations/quickbooks",
  },
];

const categoryLabels: Record<Integration["category"], string> = {
  document: "Document Management",
  payment: "Payments",
  crm: "CRM",
  storage: "Cloud Storage",
};

const categoryIcons: Record<Integration["category"], React.ReactNode> = {
  document: <FileText className="h-4 w-4" />,
  payment: <Zap className="h-4 w-4" />,
  crm: <Link2 className="h-4 w-4" />,
  storage: <Settings className="h-4 w-4" />,
};

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = React.useState<Integration[]>(baseIntegrations);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchIntegrationStatuses() {
      setIsLoading(true);

      // Map of integration IDs to their status API endpoints
      const statusEndpoints: Record<string, string> = {
        quickbooks: '/api/integrations/quickbooks/status',
        docusign: '/api/integrations/docusign/status',
        google_drive: '/api/integrations/google-drive/status',
        dropbox: '/api/integrations/dropbox/status',
        hubspot: '/api/integrations/hubspot/status',
        salesforce: '/api/integrations/salesforce/status',
      };

      // Fetch status for all integrations in parallel
      const statusPromises = Object.entries(statusEndpoints).map(
        async ([integrationId, endpoint]) => {
          try {
            const response = await fetch(endpoint);
            if (!response.ok) {
              console.error(`Failed to fetch ${integrationId} status:`, response.statusText);
              return { id: integrationId, connected: false };
            }
            const data = await response.json();
            return { id: integrationId, connected: data.connected };
          } catch (error) {
            console.error(`Error fetching ${integrationId} status:`, error);
            return { id: integrationId, connected: false };
          }
        }
      );

      const statuses = await Promise.all(statusPromises);

      // Update integrations with fetched statuses
      setIntegrations(prevIntegrations =>
        prevIntegrations.map(integration => {
          // Skip Stripe - it's hardcoded as connected
          if (integration.id === 'stripe') {
            return integration;
          }

          const status = statuses.find(s => s.id === integration.id);
          if (status) {
            return { ...integration, connected: status.connected };
          }
          return integration;
        })
      );

      setIsLoading(false);
    }

    fetchIntegrationStatuses();
  }, []);

  const connectedCount = integrations.filter((i) => i.connected).length;
  const categories = Array.from(new Set(integrations.map((i) => i.category)));

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integrations (Beta)</h1>
          <p className="text-muted-foreground">
            Connect SendProp with your favorite tools and services.
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {isLoading ? (
            <>
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              Loading...
            </>
          ) : (
            `${connectedCount} connected`
          )}
        </Badge>
      </div>

      {/* Beta Warning Banner */}
      <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900 dark:text-amber-100">
                Integrations (Beta)
              </h3>
              <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">
                These integrations are currently in development. Some features may be limited or use sandbox/test environments.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
                {isLoading ? (
                  <Loader2 className="h-6 w-6 text-green-600 dark:text-green-400 animate-spin" />
                ) : (
                  <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                )}
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {isLoading ? "-" : connectedCount}
                </p>
                <p className="text-sm text-muted-foreground">Connected</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                {isLoading ? (
                  <Loader2 className="h-6 w-6 text-blue-600 dark:text-blue-400 animate-spin" />
                ) : (
                  <Link2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                )}
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {isLoading ? "-" : integrations.filter((i) => i.available && !i.connected).length}
                </p>
                <p className="text-sm text-muted-foreground">Available</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/20">
                {isLoading ? (
                  <Loader2 className="h-6 w-6 text-amber-600 dark:text-amber-400 animate-spin" />
                ) : (
                  <Zap className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                )}
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {isLoading ? "-" : integrations.filter((i) => i.comingSoon).length}
                </p>
                <p className="text-sm text-muted-foreground">Coming Soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Integrations by Category */}
      {categories.map((category) => {
        const categoryIntegrations = integrations.filter(
          (i) => i.category === category
        );
        return (
          <div key={category} className="space-y-4">
            <div className="flex items-center gap-2">
              {categoryIcons[category]}
              <h2 className="text-lg font-semibold">{categoryLabels[category]}</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categoryIntegrations.map((integration) => (
                <Card
                  key={integration.id}
                  className={integration.comingSoon ? "border-dashed opacity-75" : ""}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg border bg-background">
                          {integration.icon}
                        </div>
                        <div>
                          <CardTitle className="text-base">
                            {integration.name}
                          </CardTitle>
                          {integration.connected ? (
                            <Badge className="mt-1 bg-green-600">
                              <Check className="mr-1 h-3 w-3" />
                              Connected
                            </Badge>
                          ) : integration.comingSoon ? (
                            <Badge variant="secondary" className="mt-1">
                              Coming Soon
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="line-clamp-2">
                      {integration.description}
                    </CardDescription>
                  </CardContent>
                  <CardFooter className="border-t pt-4">
                    {integration.available && integration.href ? (
                      <Button
                        variant={integration.connected ? "outline" : "default"}
                        className="w-full"
                        asChild
                      >
                        <Link href={integration.href}>
                          {integration.connected ? (
                            <>
                              <Settings className="mr-2 h-4 w-4" />
                              Manage
                            </>
                          ) : (
                            <>
                              Connect
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Link>
                      </Button>
                    ) : (
                      <Button variant="outline" className="w-full" disabled>
                        Coming Soon
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
            <Separator className="my-8" />
          </div>
        );
      })}

      {/* Request Integration */}
      <Card className="border-dashed">
        <CardHeader className="text-center">
          <CardTitle>Need a different integration?</CardTitle>
          <CardDescription>
            Let us know what tools you use and we will prioritize adding them.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button variant="outline">
            Request Integration
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
