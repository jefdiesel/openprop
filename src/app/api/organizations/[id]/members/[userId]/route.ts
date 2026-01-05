import { NextRequest, NextResponse } from "next/server";
import { requireOrgPermission } from "@/lib/permissions";
import { updateMemberRole, removeMember, getUserRole } from "@/lib/organizations";

type RouteContext = {
  params: Promise<{ id: string; userId: string }>;
};

// PUT /api/organizations/[id]/members/[userId] - Update member role
export async function PUT(request: NextRequest, context: RouteContext) {
  const { id: orgId, userId: targetUserId } = await context.params;

  try {
    // Only owners can change roles
    const authCheck = await requireOrgPermission(orgId, "members:update");
    if (!authCheck.authorized) {
      return NextResponse.json(
        { error: authCheck.error },
        { status: authCheck.error === "Unauthorized" ? 401 : 403 }
      );
    }

    const body = await request.json();
    const { role } = body;

    if (!["admin", "member"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be 'admin' or 'member'" },
        { status: 400 }
      );
    }

    // Check if current user is owner (only owners can change roles)
    const currentUserRole = await getUserRole(orgId, authCheck.userId!);
    if (currentUserRole !== "owner") {
      return NextResponse.json(
        { error: "Only owners can change member roles" },
        { status: 403 }
      );
    }

    // Can't change owner's role
    const targetUserRole = await getUserRole(orgId, targetUserId);
    if (targetUserRole === "owner") {
      return NextResponse.json(
        { error: "Cannot change owner's role" },
        { status: 400 }
      );
    }

    await updateMemberRole(orgId, targetUserId, role);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating member role:", error);
    return NextResponse.json(
      { error: "Failed to update member role" },
      { status: 500 }
    );
  }
}

// DELETE /api/organizations/[id]/members/[userId] - Remove member
export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id: orgId, userId: targetUserId } = await context.params;

  try {
    const authCheck = await requireOrgPermission(orgId, "members:remove");
    if (!authCheck.authorized) {
      return NextResponse.json(
        { error: authCheck.error },
        { status: authCheck.error === "Unauthorized" ? 401 : 403 }
      );
    }

    // Check roles
    const currentUserRole = await getUserRole(orgId, authCheck.userId!);
    const targetUserRole = await getUserRole(orgId, targetUserId);

    // Can't remove owner
    if (targetUserRole === "owner") {
      return NextResponse.json(
        { error: "Cannot remove the owner" },
        { status: 400 }
      );
    }

    // Admins can only remove members, not other admins
    if (currentUserRole === "admin" && targetUserRole === "admin") {
      return NextResponse.json(
        { error: "Admins cannot remove other admins" },
        { status: 403 }
      );
    }

    // Can't remove yourself (use leave team instead)
    if (targetUserId === authCheck.userId) {
      return NextResponse.json(
        { error: "Cannot remove yourself. Use leave team instead." },
        { status: 400 }
      );
    }

    await removeMember(orgId, targetUserId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing member:", error);
    return NextResponse.json(
      { error: "Failed to remove member" },
      { status: 500 }
    );
  }
}
