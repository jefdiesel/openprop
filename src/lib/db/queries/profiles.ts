import { eq } from 'drizzle-orm';
import { db } from '../index';
import { profiles, users } from '../schema';
import type { Profile, NewProfile, UpdateProfile } from '@/types/database';

/**
 * Get a profile by user ID
 */
export async function getProfile(userId: string): Promise<Profile | null> {
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);

  return profile ?? null;
}

/**
 * Get a profile with user data
 */
export async function getProfileWithUser(userId: string) {
  const result = await db.query.profiles.findFirst({
    where: eq(profiles.id, userId),
    with: {
      user: true,
    },
  });

  return result ?? null;
}

/**
 * Create a profile for a user
 */
export async function createProfile(
  data: Omit<NewProfile, 'createdAt' | 'updatedAt'>
): Promise<Profile> {
  const [profile] = await db
    .insert(profiles)
    .values({
      ...data,
      brandColor: data.brandColor ?? '#000000',
      stripeAccountEnabled: data.stripeAccountEnabled ?? false,
    })
    .returning();

  return profile;
}

/**
 * Update a profile
 */
export async function updateProfile(
  userId: string,
  data: UpdateProfile
): Promise<Profile | null> {
  const [profile] = await db
    .update(profiles)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(profiles.id, userId))
    .returning();

  return profile ?? null;
}

/**
 * Create or update a profile (upsert)
 */
export async function upsertProfile(
  userId: string,
  data: Omit<UpdateProfile, 'id'>
): Promise<Profile> {
  const existing = await getProfile(userId);

  if (existing) {
    const [updated] = await db
      .update(profiles)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, userId))
      .returning();

    return updated;
  }

  const [created] = await db
    .insert(profiles)
    .values({
      id: userId,
      ...data,
      brandColor: data.brandColor ?? '#000000',
      stripeAccountEnabled: data.stripeAccountEnabled ?? false,
    })
    .returning();

  return created;
}

/**
 * Delete a profile
 */
export async function deleteProfile(userId: string): Promise<boolean> {
  const result = await db
    .delete(profiles)
    .where(eq(profiles.id, userId))
    .returning({ id: profiles.id });

  return result.length > 0;
}

// ==========================================
// Stripe-related profile operations
// ==========================================

/**
 * Get a profile by Stripe account ID
 */
export async function getProfileByStripeAccountId(
  stripeAccountId: string
): Promise<Profile | null> {
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.stripeAccountId, stripeAccountId))
    .limit(1);

  return profile ?? null;
}

/**
 * Get a profile by Stripe customer ID
 */
export async function getProfileByStripeCustomerId(
  stripeCustomerId: string
): Promise<Profile | null> {
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.stripeCustomerId, stripeCustomerId))
    .limit(1);

  return profile ?? null;
}

/**
 * Update Stripe Connect account details
 */
export async function updateStripeConnectAccount(
  userId: string,
  stripeAccountId: string,
  enabled: boolean
): Promise<Profile | null> {
  const [profile] = await db
    .update(profiles)
    .set({
      stripeAccountId,
      stripeAccountEnabled: enabled,
      updatedAt: new Date(),
    })
    .where(eq(profiles.id, userId))
    .returning();

  return profile ?? null;
}

/**
 * Update Stripe customer ID
 */
export async function updateStripeCustomerId(
  userId: string,
  stripeCustomerId: string
): Promise<Profile | null> {
  const [profile] = await db
    .update(profiles)
    .set({
      stripeCustomerId,
      updatedAt: new Date(),
    })
    .where(eq(profiles.id, userId))
    .returning();

  return profile ?? null;
}

/**
 * Enable/disable Stripe Connect account
 */
export async function setStripeAccountEnabled(
  userId: string,
  enabled: boolean
): Promise<Profile | null> {
  const [profile] = await db
    .update(profiles)
    .set({
      stripeAccountEnabled: enabled,
      updatedAt: new Date(),
    })
    .where(eq(profiles.id, userId))
    .returning();

  return profile ?? null;
}

// ==========================================
// Branding operations
// ==========================================

/**
 * Update branding settings
 */
export async function updateBranding(
  userId: string,
  data: {
    brandColor?: string;
    logoUrl?: string;
    companyName?: string;
  }
): Promise<Profile | null> {
  const [profile] = await db
    .update(profiles)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(profiles.id, userId))
    .returning();

  return profile ?? null;
}

/**
 * Get branding for a document (used in signing flow)
 */
export async function getBrandingForDocument(documentUserId: string): Promise<{
  brandColor: string;
  logoUrl: string | null;
  companyName: string | null;
} | null> {
  const profile = await getProfile(documentUserId);

  if (!profile) return null;

  return {
    brandColor: profile.brandColor ?? '#000000',
    logoUrl: profile.logoUrl,
    companyName: profile.companyName,
  };
}
