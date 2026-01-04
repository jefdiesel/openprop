import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { organizations, organizationMembers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import {
  getOrganization,
  getOrganizationSubscription,
  getOrganizationMemberCount,
} from "@/lib/organizations";
import { requireOrgPermission } from "@/lib/permissions";
import { PLAN_LIMITS, PlanId } from "@/lib/organizations";

// GET /api/organizations/[id] - Get organization details
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: orgId } = await context.params;
  try {
    const authCheck = await requireOrgPermission(orgId, "org:read");
    if (!authCheck.authorized) {
      return NextResponse.json(
        { error: authCheck.error },
        { status: authCheck.error === "Unauthorized" ? 401 : 403 }
      );
    }

    const org = await getOrganization(orgId);
    if (!org) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    const subscription = await getOrganizationSubscription(orgId);
    const memberCount = await getOrganizationMemberCount(orgId);
    const planId = (subscription?.planId || "free") as PlanId;
    const limits = PLAN_LIMITS[planId] || PLAN_LIMITS.free;

    return NextResponse.json({
      organization: {
        ...org,
        subscription: subscription
          ? {
              planId: subscription.planId,
              status: subscription.status,
              seatLimit: subscription.seatLimit,
              billingInterval: subscription.billingInterval,
              currentPeriodEnd: subscription.currentPeriodEnd,
              cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
            }
          : null,
        memberCount,
        limits: {
          storageGb: limits.storageGb,
          seats: limits.seats,
        },
        storageUsedGb: org.storageUsedBytes
          ? Number(org.storageUsedBytes) / (1024 * 1024 * 1024)
          : 0,
      },
      role: authCheck.role,
    });
  } catch (error) {
    console.error("Error fetching organization:", error);
    return NextResponse.json(
      { error: "Failed to fetch organization" },
      { status: 500 }
    );
  }
}

// PUT /api/organizations/[id] - Update organization
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: orgId } = await context.params;
  try {
    const authCheck = await requireOrgPermission(orgId, "org:update");
    if (!authCheck.authorized) {
      return NextResponse.json(
        { error: authCheck.error },
        { status: authCheck.error === "Unauthorized" ? 401 : 403 }
      );
    }

    const body = await request.json();
    const { name, logoUrl, brandColor } = body;

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length < 2) {
        return NextResponse.json(
          { error: "Organization name must be at least 2 characters" },
          { status: 400 }
        );
      }
      updates.name = name.trim();
    }
    if (logoUrl !== undefined) updates.logoUrl = logoUrl;
    if (brandColor !== undefined) updates.brandColor = brandColor;

    const [updated] = await db
      .update(organizations)
      .set(updates)
      .where(eq(organizations.id, orgId))
      .returning();

    return NextResponse.json({ organization: updated });
  } catch (error) {
    console.error("Error updating organization:", error);
    return NextResponse.json(
      { error: "Failed to update organization" },
      { status: 500 }
    );
  }
}

// DELETE /api/organizations/[id] - Delete organization (owner only)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: orgId } = await context.params;
  try {
    const authCheck = await requireOrgPermission(orgId, "org:delete");
    if (!authCheck.authorized) {
      return NextResponse.json(
        { error: authCheck.error },
        { status: authCheck.error === "Unauthorized" ? 401 : 403 }
      );
    }

    // Only owner can delete
    if (authCheck.role !== "owner") {
      return NextResponse.json(
        { error: "Only the owner can delete an organization" },
        { status: 403 }
      );
    }

    // TODO: Check for active subscription and cancel first
    // TODO: Delete all associated data (documents, storage, etc.)

    await db.delete(organizations).where(eq(organizations.id, orgId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting organization:", error);
    return NextResponse.json(
      { error: "Failed to delete organization" },
      { status: 500 }
    );
  }
}
