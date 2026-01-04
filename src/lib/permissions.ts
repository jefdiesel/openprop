import { auth } from "@/lib/auth";
import { getUserRole, canManageMembers, canManageBilling } from "@/lib/organizations";

export type Permission =
  | "org:read"
  | "org:update"
  | "org:delete"
  | "members:read"
  | "members:invite"
  | "members:update"
  | "members:remove"
  | "billing:read"
  | "billing:manage"
  | "documents:create"
  | "documents:read"
  | "documents:update"
  | "documents:delete"
  | "storage:read"
  | "storage:upload";

// Role-based permissions
const ROLE_PERMISSIONS: Record<"owner" | "admin" | "member", Permission[]> = {
  owner: [
    "org:read",
    "org:update",
    "org:delete",
    "members:read",
    "members:invite",
    "members:update",
    "members:remove",
    "billing:read",
    "billing:manage",
    "documents:create",
    "documents:read",
    "documents:update",
    "documents:delete",
    "storage:read",
    "storage:upload",
  ],
  admin: [
    "org:read",
    "org:update",
    "members:read",
    "members:invite",
    "members:update",
    "members:remove",
    "billing:read",
    "documents:create",
    "documents:read",
    "documents:update",
    "documents:delete",
    "storage:read",
    "storage:upload",
  ],
  member: [
    "org:read",
    "members:read",
    "documents:create",
    "documents:read",
    "documents:update",
    "storage:read",
    "storage:upload",
  ],
};

// Check if a role has a specific permission
export function roleHasPermission(
  role: "owner" | "admin" | "member",
  permission: Permission
): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

// Get all permissions for a role
export function getRolePermissions(role: "owner" | "admin" | "member"): Permission[] {
  return ROLE_PERMISSIONS[role];
}

// Check if user has permission in an organization
export async function hasOrgPermission(
  orgId: string,
  userId: string,
  permission: Permission
): Promise<boolean> {
  const role = await getUserRole(orgId, userId);
  if (!role) return false;
  return roleHasPermission(role, permission);
}

// Middleware-style permission check for API routes
export async function requireOrgPermission(
  orgId: string,
  permission: Permission
): Promise<{ authorized: boolean; userId?: string; role?: string; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { authorized: false, error: "Unauthorized" };
  }

  const role = await getUserRole(orgId, session.user.id);
  if (!role) {
    return { authorized: false, error: "Not a member of this organization" };
  }

  if (!roleHasPermission(role, permission)) {
    return { authorized: false, error: "Insufficient permissions" };
  }

  return { authorized: true, userId: session.user.id, role };
}

// Quick auth check for API routes - returns user or null
export async function getAuthUser() {
  const session = await auth();
  return session?.user?.id ? { id: session.user.id, ...session.user } : null;
}

// Re-export for convenience
export { getUserRole, canManageMembers, canManageBilling };
