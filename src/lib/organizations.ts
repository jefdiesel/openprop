import { db } from "@/lib/db";
import {
  organizations,
  organizationMembers,
  organizationInvites,
  subscriptions,
  profiles,
} from "@/lib/db/schema";
import { eq, and, or } from "drizzle-orm";
import { nanoid } from "nanoid";

// Plan limits
export const PLAN_LIMITS = {
  free: { storageGb: 0.1, seats: 1 },
  pro: { storageGb: 5, seats: 1 },
  business: { storageGb: 25, seats: 1 },
  pro_team: { storageGb: 5, seats: 10 },
  business_team: { storageGb: 25, seats: null }, // null = unlimited
} as const;

export type PlanId = keyof typeof PLAN_LIMITS;

// Generate a URL-safe slug from organization name
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 50);
}

// Create a unique slug
export async function createUniqueSlug(baseName: string): Promise<string> {
  let slug = generateSlug(baseName);
  let counter = 0;

  while (true) {
    const candidateSlug = counter === 0 ? slug : `${slug}-${counter}`;
    const existing = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.slug, candidateSlug))
      .limit(1);

    if (existing.length === 0) {
      return candidateSlug;
    }
    counter++;
  }
}

// Get user's organizations
export async function getUserOrganizations(userId: string) {
  return db
    .select({
      id: organizations.id,
      name: organizations.name,
      slug: organizations.slug,
      logoUrl: organizations.logoUrl,
      brandColor: organizations.brandColor,
      role: organizationMembers.role,
      status: organizationMembers.status,
    })
    .from(organizationMembers)
    .innerJoin(organizations, eq(organizationMembers.organizationId, organizations.id))
    .where(
      and(
        eq(organizationMembers.userId, userId),
        eq(organizationMembers.status, "active")
      )
    );
}

// Get organization by ID with member count
export async function getOrganization(orgId: string) {
  const [org] = await db
    .select({
      id: organizations.id,
      name: organizations.name,
      slug: organizations.slug,
      logoUrl: organizations.logoUrl,
      brandColor: organizations.brandColor,
      stripeAccountId: organizations.stripeAccountId,
      stripeAccountEnabled: organizations.stripeAccountEnabled,
      storageUsedBytes: organizations.storageUsedBytes,
      createdAt: organizations.createdAt,
    })
    .from(organizations)
    .where(eq(organizations.id, orgId))
    .limit(1);

  return org;
}

// Get organization subscription
export async function getOrganizationSubscription(orgId: string) {
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.organizationId, orgId))
    .limit(1);

  return sub;
}

// Get organization members
export async function getOrganizationMembers(orgId: string) {
  return db.query.organizationMembers.findMany({
    where: and(
      eq(organizationMembers.organizationId, orgId),
      or(
        eq(organizationMembers.status, "active"),
        eq(organizationMembers.status, "pending")
      )
    ),
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });
}

// Get user's role in an organization
export async function getUserRole(
  orgId: string,
  userId: string
): Promise<"owner" | "admin" | "member" | null> {
  const [member] = await db
    .select({ role: organizationMembers.role, status: organizationMembers.status })
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.organizationId, orgId),
        eq(organizationMembers.userId, userId)
      )
    )
    .limit(1);

  if (!member || member.status !== "active") {
    return null;
  }

  return member.role;
}

// Check if user can manage members (owner or admin)
export async function canManageMembers(orgId: string, userId: string): Promise<boolean> {
  const role = await getUserRole(orgId, userId);
  return role === "owner" || role === "admin";
}

// Check if user can manage billing (owner only)
export async function canManageBilling(orgId: string, userId: string): Promise<boolean> {
  const role = await getUserRole(orgId, userId);
  return role === "owner";
}

// Create organization
export async function createOrganization(
  name: string,
  ownerId: string,
  options?: {
    logoUrl?: string;
    brandColor?: string;
  }
) {
  const slug = await createUniqueSlug(name);

  const [org] = await db
    .insert(organizations)
    .values({
      name,
      slug,
      logoUrl: options?.logoUrl,
      brandColor: options?.brandColor || "#000000",
    })
    .returning();

  // Add owner as first member
  await db.insert(organizationMembers).values({
    organizationId: org.id,
    userId: ownerId,
    role: "owner",
    status: "active",
    joinedAt: new Date(),
  });

  // Set as user's current organization
  await db
    .update(profiles)
    .set({ currentOrganizationId: org.id })
    .where(eq(profiles.id, ownerId));

  return org;
}

// Invite member to organization
export async function inviteMember(
  orgId: string,
  email: string,
  role: "admin" | "member",
  invitedBy: string
) {
  const token = nanoid(32);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

  const [invite] = await db
    .insert(organizationInvites)
    .values({
      organizationId: orgId,
      email: email.toLowerCase(),
      role,
      token,
      invitedBy,
      expiresAt,
    })
    .returning();

  return invite;
}

// Get pending invites for an organization
export async function getOrganizationInvites(orgId: string) {
  return db
    .select({
      id: organizationInvites.id,
      email: organizationInvites.email,
      role: organizationInvites.role,
      expiresAt: organizationInvites.expiresAt,
      createdAt: organizationInvites.createdAt,
    })
    .from(organizationInvites)
    .where(
      and(
        eq(organizationInvites.organizationId, orgId),
        eq(organizationInvites.acceptedAt, null as unknown as Date)
      )
    );
}

// Get invite by token
export async function getInviteByToken(token: string) {
  const [invite] = await db
    .select({
      id: organizationInvites.id,
      email: organizationInvites.email,
      role: organizationInvites.role,
      expiresAt: organizationInvites.expiresAt,
      acceptedAt: organizationInvites.acceptedAt,
      organizationId: organizationInvites.organizationId,
      organizationName: organizations.name,
      organizationLogo: organizations.logoUrl,
    })
    .from(organizationInvites)
    .innerJoin(organizations, eq(organizationInvites.organizationId, organizations.id))
    .where(eq(organizationInvites.token, token))
    .limit(1);

  return invite;
}

// Accept invite
export async function acceptInvite(token: string, userId: string) {
  const invite = await getInviteByToken(token);

  if (!invite) {
    throw new Error("Invite not found");
  }

  if (invite.acceptedAt) {
    throw new Error("Invite already accepted");
  }

  if (new Date() > invite.expiresAt) {
    throw new Error("Invite expired");
  }

  // Check if already a member
  const [existing] = await db
    .select({
      id: organizationMembers.id,
      role: organizationMembers.role,
      status: organizationMembers.status,
    })
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.organizationId, invite.organizationId),
        eq(organizationMembers.userId, userId)
      )
    )
    .limit(1);

  if (existing) {
    if (existing.status === "removed") {
      // Reactivate removed member with invite's role
      await db
        .update(organizationMembers)
        .set({
          status: "active",
          role: invite.role,
          joinedAt: new Date(),
        })
        .where(eq(organizationMembers.id, existing.id));
    }
    // If already active, don't change their role - they're already a member
    // Just continue to mark the invite as accepted
  } else {
    // Add as new member
    await db.insert(organizationMembers).values({
      organizationId: invite.organizationId,
      userId,
      role: invite.role,
      status: "active",
      joinedAt: new Date(),
    });
  }

  // Mark invite as accepted
  await db
    .update(organizationInvites)
    .set({ acceptedAt: new Date() })
    .where(eq(organizationInvites.id, invite.id));

  // Set as user's current organization (upsert in case profile doesn't exist)
  await db
    .insert(profiles)
    .values({
      id: userId,
      currentOrganizationId: invite.organizationId,
      brandColor: "#000000",
      stripeAccountEnabled: false,
    })
    .onConflictDoUpdate({
      target: profiles.id,
      set: { currentOrganizationId: invite.organizationId },
    });

  return invite;
}

// Get member count for seat limit check
export async function getOrganizationMemberCount(orgId: string): Promise<number> {
  const members = await db
    .select({ id: organizationMembers.id })
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.organizationId, orgId),
        eq(organizationMembers.status, "active")
      )
    );

  return members.length;
}

// Check if org can add more members based on seat limit
export async function canAddMember(orgId: string): Promise<{ allowed: boolean; reason?: string }> {
  const sub = await getOrganizationSubscription(orgId);

  // No subscription = free tier (self-hosted) = unlimited seats
  if (!sub) {
    return { allowed: true };
  }

  const seatLimit = sub.seatLimit;
  if (seatLimit === null) {
    return { allowed: true }; // Unlimited seats
  }

  const memberCount = await getOrganizationMemberCount(orgId);
  if (memberCount >= seatLimit) {
    return { allowed: false, reason: `Seat limit reached (${memberCount}/${seatLimit})` };
  }

  return { allowed: true };
}

// Update member role
export async function updateMemberRole(
  orgId: string,
  userId: string,
  newRole: "admin" | "member"
) {
  await db
    .update(organizationMembers)
    .set({ role: newRole })
    .where(
      and(
        eq(organizationMembers.organizationId, orgId),
        eq(organizationMembers.userId, userId)
      )
    );
}

// Remove member (soft delete)
export async function removeMember(orgId: string, userId: string) {
  await db
    .update(organizationMembers)
    .set({ status: "removed" })
    .where(
      and(
        eq(organizationMembers.organizationId, orgId),
        eq(organizationMembers.userId, userId)
      )
    );

  // If this was their current org, clear it
  await db
    .update(profiles)
    .set({ currentOrganizationId: null })
    .where(
      and(
        eq(profiles.id, userId),
        eq(profiles.currentOrganizationId, orgId)
      )
    );
}

// Switch user's current organization context
export async function switchOrganizationContext(
  userId: string,
  orgId: string | null
): Promise<boolean> {
  if (orgId === null) {
    // Switch to personal context
    await db
      .update(profiles)
      .set({ currentOrganizationId: null })
      .where(eq(profiles.id, userId));
    return true;
  }

  // Verify user is a member
  const role = await getUserRole(orgId, userId);
  if (!role) {
    return false;
  }

  await db
    .update(profiles)
    .set({ currentOrganizationId: orgId })
    .where(eq(profiles.id, userId));

  return true;
}

// Get user's current organization context
export async function getCurrentOrganization(userId: string) {
  const [profile] = await db
    .select({
      currentOrganizationId: profiles.currentOrganizationId,
    })
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);

  if (!profile?.currentOrganizationId) {
    return null;
  }

  return getOrganization(profile.currentOrganizationId);
}
