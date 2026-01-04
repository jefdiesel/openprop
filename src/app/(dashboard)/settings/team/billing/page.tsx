import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { profiles, organizations, organizationMembers, subscriptions } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, CreditCard, Calendar, Users, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PLANS, type PlanId } from "@/lib/stripe";
import { TeamBillingActions } from "./billing-actions";

export const dynamic = "force-dynamic";

export default async function TeamBillingPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  // Get current organization context
  const [profile] = await db
    .select({ currentOrganizationId: profiles.currentOrganizationId })
    .from(profiles)
    .where(eq(profiles.id, session.user.id))
    .limit(1);

  if (!profile?.currentOrganizationId) {
    redirect("/settings/team");
  }

  // Get organization details
  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, profile.currentOrganizationId))
    .limit(1);

  if (!org) {
    redirect("/settings/team");
  }

  // Get current user's role
  const [membership] = await db
    .select({ role: organizationMembers.role })
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.organizationId, org.id),
        eq(organizationMembers.userId, session.user.id)
      )
    )
    .limit(1);

  const isOwner = membership?.role === "owner";

  if (!isOwner) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Billing Access Restricted</h1>
          <p className="text-muted-foreground mb-6">
            Only the team owner can manage billing settings.
          </p>
          <Button asChild variant="outline">
            <Link href="/settings/team">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Team Settings
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Get subscription
  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.organizationId, org.id))
    .limit(1);

  const planId = (subscription?.planId || "free") as PlanId;
  const plan = PLANS[planId] || PLANS.free;
  const isActive = subscription?.status === "active";

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href="/settings/team">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Team Settings
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Team Billing</h1>
        <p className="text-muted-foreground">Manage your team's subscription and billing</p>
      </div>

      <div className="grid gap-6">
        {/* Current Plan */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>Your team's subscription details</CardDescription>
              </div>
              {subscription && (
                <Badge variant={isActive ? "default" : "secondary"}>
                  {subscription.status}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div>
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">
                  ${(plan.priceMonthly / 100).toFixed(0)}
                  <span className="text-sm font-normal text-muted-foreground">/mo</span>
                </div>
                {subscription?.billingInterval === "yearly" && (
                  <p className="text-xs text-muted-foreground">Billed annually</p>
                )}
              </div>
            </div>

            {subscription?.currentPeriodEnd && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {subscription.cancelAtPeriodEnd ? (
                  <span>Cancels on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</span>
                ) : (
                  <span>Renews on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</span>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>
                {plan.limits.maxSeats === -1 ? "Unlimited" : plan.limits.maxSeats} team members
              </span>
            </div>

            <TeamBillingActions
              organizationId={org.id}
              hasSubscription={!!subscription?.stripeSubscriptionId}
              currentPlanId={planId}
            />
          </CardContent>
        </Card>

        {/* Available Plans */}
        <Card>
          <CardHeader>
            <CardTitle>Available Plans</CardTitle>
            <CardDescription>Choose a plan that fits your team</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Pro Team */}
              <div className={`rounded-lg border p-4 ${planId === "pro_team" ? "border-primary bg-primary/5" : ""}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold">Pro Team</h3>
                  {planId === "pro_team" && (
                    <Badge variant="outline">Current</Badge>
                  )}
                </div>
                <div className="text-2xl font-bold mb-2">
                  $29<span className="text-sm font-normal text-muted-foreground">/mo</span>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>Up to 10 team members</li>
                  <li>5GB shared storage</li>
                  <li>Shared Stripe Connect</li>
                  <li>Priority support</li>
                </ul>
              </div>

              {/* Business Team */}
              <div className={`rounded-lg border p-4 ${planId === "business_team" ? "border-primary bg-primary/5" : ""}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold">Business Team</h3>
                  {planId === "business_team" && (
                    <Badge variant="outline">Current</Badge>
                  )}
                </div>
                <div className="text-2xl font-bold mb-2">
                  $99<span className="text-sm font-normal text-muted-foreground">/mo</span>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>Unlimited team members</li>
                  <li>25GB shared storage</li>
                  <li>Remove branding</li>
                  <li>Analytics & CRM integrations</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
