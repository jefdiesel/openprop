import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { profiles, organizations, organizationMembers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, CreditCard, HardDrive, Settings, Building2, Link2 } from "lucide-react";
import Link from "next/link";
import { MemberList } from "@/components/team/member-list";
import { InviteDialog } from "@/components/team/invite-dialog";
import { StorageUsageBar } from "@/components/team/storage-usage-bar";
import { getOrganizationMembers, getOrganizationSubscription, getOrganizationMemberCount } from "@/lib/organizations";
import { PLAN_LIMITS, type PlanId } from "@/lib/organizations";

export const dynamic = "force-dynamic";

export default async function TeamSettingsPage() {
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
    // Not in a team context
    return (
      <div className="container max-w-4xl py-8">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">No Team Selected</h1>
          <p className="text-muted-foreground mb-6 max-w-md">
            You're currently in your personal context. Switch to a team or create one to access team settings.
          </p>
          <Button asChild>
            <Link href="/create-team">Create a Team</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Get organization details
  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, profile.currentOrganizationId))
    .limit(1);

  if (!org) {
    redirect("/dashboard");
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

  const userRole = membership?.role || "member";
  const isOwner = userRole === "owner";
  const canManage = userRole === "owner" || userRole === "admin";

  // Get members and subscription
  const members = await getOrganizationMembers(org.id);
  const subscription = await getOrganizationSubscription(org.id);
  const memberCount = await getOrganizationMemberCount(org.id);

  const planId = (subscription?.planId || "free") as PlanId;
  const limits = PLAN_LIMITS[planId] || PLAN_LIMITS.free;
  const seatLimit = limits.seats;

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{org.name}</h1>
        <p className="text-muted-foreground">Manage your team settings</p>
      </div>

      <div className="grid gap-6">
        {/* Quick Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {memberCount}
                {planId !== "free" && seatLimit !== null && seatLimit > 1 && (
                  <span className="text-sm font-normal text-muted-foreground">
                    /{seatLimit}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {subscription?.planId === "pro_team"
                  ? "Pro"
                  : subscription?.planId === "business_team"
                  ? "Business"
                  : "Free"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Your Role
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{userRole}</div>
            </CardContent>
          </Card>
        </div>

        {/* Storage Usage */}
        <StorageUsageBar />

        {/* Team Members */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                {memberCount} member{memberCount !== 1 ? "s" : ""}
                {planId !== "free" && seatLimit && seatLimit > 1 && ` of ${seatLimit} seats`}
              </CardDescription>
            </div>
            {canManage && (
              <InviteDialog
                organizationId={org.id}
                canInviteAdmin={isOwner}
              />
            )}
          </CardHeader>
          <CardContent>
            <MemberList
              organizationId={org.id}
              members={members as any}
              currentUserRole={userRole as "owner" | "admin" | "member"}
              currentUserId={session.user.id}
            />
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isOwner && (
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <Link href="/settings/team/billing" className="block">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-lg">Billing</CardTitle>
                  </div>
                  <CardDescription>
                    Manage your subscription and payment methods
                  </CardDescription>
                </CardHeader>
              </Link>
            </Card>
          )}

          {canManage && (
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <Link href="/settings/team/stripe-connect" className="block">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Link2 className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-lg">Stripe Connect</CardTitle>
                  </div>
                  <CardDescription>
                    Shared payment account for the team
                  </CardDescription>
                </CardHeader>
              </Link>
            </Card>
          )}

          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <Link href="/settings/team/storage" className="block">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <HardDrive className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-lg">Storage</CardTitle>
                </div>
                <CardDescription>
                  View storage usage and manage files
                </CardDescription>
              </CardHeader>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
