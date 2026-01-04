import { NextRequest, NextResponse } from "next/server";
import { updateMemberRole, removeMember, getUserRole } from "@/lib/organizations";
import { requireOrgPermission } from "@/lib/permissions";

// PUT /api/organizations/[id]/members/[userId] - Update member role
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string; userId: string }> }
) {
  const { id: orgId, userId: targetUserId } = await context.params;
  try {
    const authCheck = await requireOrgPermission(orgId, "members:update");
    if (!authCheck.authorized) {
      return NextResponse.json(
        { error: authCheck.error },
        { status: authCheck.error === "Unauthorized" ? 401 : 403 }
      );
    }

    // Get target user's current role
    const targetRole = await getUserRole(orgId, targetUserId);
    if (!targetRole) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      );
    }

    // Cannot change owner's role
    if (targetRole === "owner") {
      return NextResponse.json(
        { error: "Cannot change the owner's role" },
        { status: 403 }
      );
    }

    // Admins cannot promote to admin (only owners can)
    const body = await request.json();
    const { role: newRole } = body;

    if (!["admin", "member"].includes(newRole)) {
      return NextResponse.json(
        { error: "Invalid role. Must be 'admin' or 'member'" },
        { status: 400 }
      );
    }

    // Only owner can promote to admin
    if (newRole === "admin" && authCheck.role !== "owner") {
      return NextResponse.json(
        { error: "Only the owner can promote members to admin" },
        { status: 403 }
      );
    }

    await updateMemberRole(orgId, targetUserId, newRole);

    return NextResponse.json({ success: true, role: newRole });
  } catch (error) {
    console.error("Error updating member:", error);
    return NextResponse.json(
      { error: "Failed to update member" },
      { status: 500 }
    );
  }
}

// DELETE /api/organizations/[id]/members/[userId] - Remove member
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; userId: string }> }
) {
  const { id: orgId, userId: targetUserId } = await context.params;
  try {
    const authCheck = await requireOrgPermission(orgId, "members:remove");
    if (!authCheck.authorized) {
      return NextResponse.json(
        { error: authCheck.error },
        { status: authCheck.error === "Unauthorized" ? 401 : 403 }
      );
    }

    // Get target user's current role
    const targetRole = await getUserRole(orgId, targetUserId);
    if (!targetRole) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      );
    }

    // Cannot remove owner
    if (targetRole === "owner") {
      return NextResponse.json(
        { error: "Cannot remove the owner. Transfer ownership first." },
        { status: 403 }
      );
    }

    // Admins cannot remove other admins (only owner can)
    if (targetRole === "admin" && authCheck.role !== "owner") {
      return NextResponse.json(
        { error: "Only the owner can remove admins" },
        { status: 403 }
      );
    }

    // User can remove themselves (leave org)
    const isSelf = targetUserId === authCheck.userId;
    if (!isSelf && authCheck.role === "member") {
      return NextResponse.json(
        { error: "Members can only remove themselves" },
        { status: 403 }
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
