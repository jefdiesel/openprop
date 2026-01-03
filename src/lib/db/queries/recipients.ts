import { eq, and, asc, desc, inArray } from 'drizzle-orm';
import { db } from '../index';
import { recipients, documents, documentEvents } from '../schema';
import type {
  Recipient,
  NewRecipient,
  UpdateRecipient,
  RecipientListFilters,
  SignatureData,
} from '@/types/database';

/**
 * Create a new recipient
 */
export async function createRecipient(
  data: Omit<NewRecipient, 'id' | 'createdAt'>
): Promise<Recipient> {
  const [recipient] = await db
    .insert(recipients)
    .values({
      ...data,
      role: data.role ?? 'signer',
      signingOrder: data.signingOrder ?? 1,
      status: data.status ?? 'pending',
    })
    .returning();

  return recipient;
}

/**
 * Create multiple recipients at once
 */
export async function createRecipients(
  data: Omit<NewRecipient, 'id' | 'createdAt'>[]
): Promise<Recipient[]> {
  if (data.length === 0) return [];

  return db
    .insert(recipients)
    .values(
      data.map((r) => ({
        ...r,
        role: r.role ?? 'signer',
        signingOrder: r.signingOrder ?? 1,
        status: r.status ?? 'pending',
      }))
    )
    .returning();
}

/**
 * Get a recipient by ID
 */
export async function getRecipient(id: string): Promise<Recipient | null> {
  const [recipient] = await db
    .select()
    .from(recipients)
    .where(eq(recipients.id, id))
    .limit(1);

  return recipient ?? null;
}

/**
 * Get a recipient by access token (for signing flow)
 */
export async function getRecipientByAccessToken(
  accessToken: string
): Promise<Recipient | null> {
  const [recipient] = await db
    .select()
    .from(recipients)
    .where(eq(recipients.accessToken, accessToken))
    .limit(1);

  return recipient ?? null;
}

/**
 * Get a recipient with their document (for signing flow)
 */
export async function getRecipientWithDocument(accessToken: string) {
  const result = await db.query.recipients.findFirst({
    where: eq(recipients.accessToken, accessToken),
    with: {
      document: true,
    },
  });

  return result ?? null;
}

/**
 * Update a recipient
 */
export async function updateRecipient(
  id: string,
  data: UpdateRecipient
): Promise<Recipient | null> {
  const [recipient] = await db
    .update(recipients)
    .set(data)
    .where(eq(recipients.id, id))
    .returning();

  return recipient ?? null;
}

/**
 * Update a recipient by access token
 */
export async function updateRecipientByAccessToken(
  accessToken: string,
  data: UpdateRecipient
): Promise<Recipient | null> {
  const [recipient] = await db
    .update(recipients)
    .set(data)
    .where(eq(recipients.accessToken, accessToken))
    .returning();

  return recipient ?? null;
}

/**
 * Delete a recipient
 */
export async function deleteRecipient(id: string): Promise<boolean> {
  const result = await db
    .delete(recipients)
    .where(eq(recipients.id, id))
    .returning({ id: recipients.id });

  return result.length > 0;
}

/**
 * Delete all recipients for a document
 */
export async function deleteRecipientsByDocumentId(
  documentId: string
): Promise<number> {
  const result = await db
    .delete(recipients)
    .where(eq(recipients.documentId, documentId))
    .returning({ id: recipients.id });

  return result.length;
}

/**
 * List recipients for a document
 */
export async function listRecipientsByDocumentId(
  documentId: string
): Promise<Recipient[]> {
  return db
    .select()
    .from(recipients)
    .where(eq(recipients.documentId, documentId))
    .orderBy(asc(recipients.signingOrder), asc(recipients.createdAt));
}

/**
 * List recipients with filters
 */
export async function listRecipients(
  filters: RecipientListFilters = {}
): Promise<Recipient[]> {
  const { documentId, status, email } = filters;

  const conditions = [];

  if (documentId) {
    conditions.push(eq(recipients.documentId, documentId));
  }

  if (status) {
    conditions.push(eq(recipients.status, status));
  }

  if (email) {
    conditions.push(eq(recipients.email, email));
  }

  if (conditions.length === 0) {
    return [];
  }

  return db
    .select()
    .from(recipients)
    .where(and(...conditions))
    .orderBy(asc(recipients.signingOrder));
}

/**
 * Mark recipient as viewed
 */
export async function markRecipientViewed(
  accessToken: string,
  ipAddress?: string,
  userAgent?: string
): Promise<Recipient | null> {
  const recipient = await getRecipientByAccessToken(accessToken);
  if (!recipient) return null;

  // Only update if not already viewed
  if (!recipient.viewedAt) {
    const [updated] = await db
      .update(recipients)
      .set({
        status: recipient.status === 'pending' ? 'viewed' : recipient.status,
        viewedAt: new Date(),
        ipAddress,
        userAgent,
      })
      .where(eq(recipients.accessToken, accessToken))
      .returning();

    // Log the view event
    await db.insert(documentEvents).values({
      documentId: recipient.documentId,
      recipientId: recipient.id,
      eventType: 'viewed',
      eventData: { ipAddress, userAgent },
    });

    return updated ?? null;
  }

  return recipient;
}

/**
 * Mark recipient as signed
 */
export async function markRecipientSigned(
  accessToken: string,
  signatureData: SignatureData,
  ipAddress?: string,
  userAgent?: string
): Promise<Recipient | null> {
  const [recipient] = await db
    .update(recipients)
    .set({
      status: 'signed',
      signedAt: new Date(),
      signatureData,
      ipAddress,
      userAgent,
    })
    .where(eq(recipients.accessToken, accessToken))
    .returning();

  if (recipient) {
    // Log the signed event
    await db.insert(documentEvents).values({
      documentId: recipient.documentId,
      recipientId: recipient.id,
      eventType: 'signed',
      eventData: {
        signatureType: signatureData.type,
        ipAddress,
        userAgent,
      },
    });
  }

  return recipient ?? null;
}

/**
 * Mark recipient as declined
 */
export async function markRecipientDeclined(
  accessToken: string,
  reason?: string
): Promise<Recipient | null> {
  const [recipient] = await db
    .update(recipients)
    .set({
      status: 'declined',
    })
    .where(eq(recipients.accessToken, accessToken))
    .returning();

  if (recipient) {
    // Log the declined event
    await db.insert(documentEvents).values({
      documentId: recipient.documentId,
      recipientId: recipient.id,
      eventType: 'declined',
      eventData: { reason },
    });
  }

  return recipient ?? null;
}

/**
 * Check if all recipients have signed a document
 */
export async function allRecipientsSigned(documentId: string): Promise<boolean> {
  const documentRecipients = await listRecipientsByDocumentId(documentId);

  if (documentRecipients.length === 0) return false;

  return documentRecipients.every(
    (r) => r.role === 'viewer' || r.status === 'signed'
  );
}

/**
 * Get the next recipient in signing order
 */
export async function getNextRecipientToSign(
  documentId: string
): Promise<Recipient | null> {
  const documentRecipients = await listRecipientsByDocumentId(documentId);

  // Find the first pending signer
  const nextRecipient = documentRecipients.find(
    (r) => r.role !== 'viewer' && r.status === 'pending'
  );

  return nextRecipient ?? null;
}

/**
 * Replace all recipients for a document
 */
export async function replaceDocumentRecipients(
  documentId: string,
  newRecipients: Omit<NewRecipient, 'id' | 'createdAt' | 'documentId'>[]
): Promise<Recipient[]> {
  // Delete existing recipients
  await deleteRecipientsByDocumentId(documentId);

  // Create new recipients
  if (newRecipients.length === 0) return [];

  return createRecipients(
    newRecipients.map((r) => ({
      ...r,
      documentId,
    }))
  );
}

/**
 * Get recipient count by status for a document
 */
export async function getRecipientCountsByStatus(
  documentId: string
): Promise<Record<string, number>> {
  const documentRecipients = await listRecipientsByDocumentId(documentId);

  return documentRecipients.reduce(
    (acc, r) => {
      acc[r.status] = (acc[r.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
}
