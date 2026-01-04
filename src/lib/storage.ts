import { db } from "@/lib/db";
import { organizations, storageItems, subscriptions } from "@/lib/db/schema";
import { eq, sum } from "drizzle-orm";
import { PLAN_LIMITS, PlanId } from "@/lib/organizations";

// Convert bytes to GB
export function bytesToGb(bytes: number): number {
  return bytes / (1024 * 1024 * 1024);
}

// Convert GB to bytes
export function gbToBytes(gb: number): number {
  return gb * 1024 * 1024 * 1024;
}

// Format bytes for display
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

// Get organization storage usage
export async function getOrganizationStorageUsage(orgId: string): Promise<{
  usedBytes: number;
  usedGb: number;
  limitGb: number;
  limitBytes: number;
  percentUsed: number;
  isAtLimit: boolean;
}> {
  // Get current storage used
  const [org] = await db
    .select({ storageUsedBytes: organizations.storageUsedBytes })
    .from(organizations)
    .where(eq(organizations.id, orgId))
    .limit(1);

  const usedBytes = org?.storageUsedBytes ?? 0;

  // Get subscription to determine limit
  const [sub] = await db
    .select({ planId: subscriptions.planId })
    .from(subscriptions)
    .where(eq(subscriptions.organizationId, orgId))
    .limit(1);

  const planId = (sub?.planId || "free") as PlanId;
  const limitGb = PLAN_LIMITS[planId]?.storageGb ?? 0;
  const limitBytes = gbToBytes(limitGb);

  const usedGb = bytesToGb(usedBytes);
  const percentUsed = limitBytes > 0 ? (usedBytes / limitBytes) * 100 : 0;
  const isAtLimit = limitBytes > 0 && usedBytes >= limitBytes;

  return {
    usedBytes,
    usedGb,
    limitGb,
    limitBytes,
    percentUsed: Math.min(100, percentUsed),
    isAtLimit,
  };
}

// Check if organization can upload a file of given size
export async function canUploadFile(
  orgId: string,
  fileSize: number
): Promise<{ allowed: boolean; reason?: string }> {
  const storage = await getOrganizationStorageUsage(orgId);

  if (storage.limitBytes <= 0) {
    // Unlimited storage (BYOS or enterprise)
    return { allowed: true };
  }

  if (storage.usedBytes + fileSize > storage.limitBytes) {
    const available = storage.limitBytes - storage.usedBytes;
    return {
      allowed: false,
      reason: `Storage limit exceeded. Available: ${formatBytes(Math.max(0, available))}. File size: ${formatBytes(fileSize)}. Upgrade your plan for more storage.`,
    };
  }

  return { allowed: true };
}

// Track a new file upload
export async function trackFileUpload(
  orgId: string,
  documentId: string | null,
  uploadedBy: string,
  fileName: string,
  fileType: string,
  fileSize: number,
  storagePath: string
): Promise<{ id: string }> {
  // Insert storage item record
  const [item] = await db
    .insert(storageItems)
    .values({
      organizationId: orgId,
      documentId,
      uploadedBy,
      fileName,
      fileType,
      fileSize,
      storagePath,
    })
    .returning({ id: storageItems.id });

  // Update organization storage total
  await db
    .update(organizations)
    .set({
      storageUsedBytes: eq(organizations.id, orgId)
        ? (await db
            .select({ total: sum(storageItems.fileSize) })
            .from(storageItems)
            .where(eq(storageItems.organizationId, orgId))
            .then((r) => Number(r[0]?.total) || 0))
        : 0,
      updatedAt: new Date(),
    })
    .where(eq(organizations.id, orgId));

  return { id: item.id };
}

// Remove a file from storage tracking
export async function trackFileDelete(
  storageItemId: string
): Promise<void> {
  // Get item details first
  const [item] = await db
    .select({
      organizationId: storageItems.organizationId,
      fileSize: storageItems.fileSize,
    })
    .from(storageItems)
    .where(eq(storageItems.id, storageItemId))
    .limit(1);

  if (!item) return;

  // Delete the storage item
  await db.delete(storageItems).where(eq(storageItems.id, storageItemId));

  // Recalculate organization storage
  const [{ total }] = await db
    .select({ total: sum(storageItems.fileSize) })
    .from(storageItems)
    .where(eq(storageItems.organizationId, item.organizationId));

  await db
    .update(organizations)
    .set({
      storageUsedBytes: Number(total) || 0,
      updatedAt: new Date(),
    })
    .where(eq(organizations.id, item.organizationId));
}

// Get storage items for an organization
export async function getOrganizationStorageItems(
  orgId: string,
  options?: { documentId?: string; limit?: number; offset?: number }
) {
  let query = db.query.storageItems.findMany({
    where: options?.documentId
      ? eq(storageItems.documentId, options.documentId)
      : eq(storageItems.organizationId, orgId),
    limit: options?.limit || 100,
    offset: options?.offset || 0,
    orderBy: (items, { desc }) => [desc(items.createdAt)],
    with: {
      uploadedByUser: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
      document: {
        columns: {
          id: true,
          title: true,
        },
      },
    },
  });

  return query;
}

// Recalculate organization storage (for maintenance/sync)
export async function recalculateOrganizationStorage(orgId: string): Promise<number> {
  const [{ total }] = await db
    .select({ total: sum(storageItems.fileSize) })
    .from(storageItems)
    .where(eq(storageItems.organizationId, orgId));

  const usedBytes = Number(total) || 0;

  await db
    .update(organizations)
    .set({
      storageUsedBytes: usedBytes,
      updatedAt: new Date(),
    })
    .where(eq(organizations.id, orgId));

  return usedBytes;
}
