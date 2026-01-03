import { eq, and, desc, asc, ilike, sql } from 'drizzle-orm';
import { db } from '../index';
import { documents, recipients, documentEvents, payments } from '../schema';
import type {
  Document,
  NewDocument,
  UpdateDocument,
  DocumentListFilters,
  DocumentWithRecipients,
  DocumentWithAll,
  Block,
} from '@/types/database';

/**
 * Create a new document
 */
export async function createDocument(
  data: Omit<NewDocument, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Document> {
  const [document] = await db
    .insert(documents)
    .values({
      ...data,
      content: data.content ?? [],
      status: data.status ?? 'draft',
      isTemplate: data.isTemplate ?? false,
    })
    .returning();

  return document;
}

/**
 * Get a document by ID
 */
export async function getDocument(id: string): Promise<Document | null> {
  const [document] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, id))
    .limit(1);

  return document ?? null;
}

/**
 * Get a document by ID with recipients
 */
export async function getDocumentWithRecipients(
  id: string
): Promise<DocumentWithRecipients | null> {
  const document = await db.query.documents.findFirst({
    where: eq(documents.id, id),
    with: {
      recipients: true,
    },
  });

  return document ?? null;
}

/**
 * Get a document by ID with all relations
 */
export async function getDocumentWithAll(
  id: string
): Promise<DocumentWithAll | null> {
  const document = await db.query.documents.findFirst({
    where: eq(documents.id, id),
    with: {
      recipients: true,
      events: {
        orderBy: [desc(documentEvents.createdAt)],
      },
      payments: true,
    },
  });

  return document ?? null;
}

/**
 * Get a document by ID for a specific user (ownership check)
 */
export async function getDocumentForUser(
  id: string,
  userId: string
): Promise<Document | null> {
  const [document] = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, id), eq(documents.userId, userId)))
    .limit(1);

  return document ?? null;
}

/**
 * Update a document
 */
export async function updateDocument(
  id: string,
  data: UpdateDocument
): Promise<Document | null> {
  const [document] = await db
    .update(documents)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(documents.id, id))
    .returning();

  return document ?? null;
}

/**
 * Update a document for a specific user (ownership check)
 */
export async function updateDocumentForUser(
  id: string,
  userId: string,
  data: UpdateDocument
): Promise<Document | null> {
  const [document] = await db
    .update(documents)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(and(eq(documents.id, id), eq(documents.userId, userId)))
    .returning();

  return document ?? null;
}

/**
 * Delete a document
 */
export async function deleteDocument(id: string): Promise<boolean> {
  const result = await db
    .delete(documents)
    .where(eq(documents.id, id))
    .returning({ id: documents.id });

  return result.length > 0;
}

/**
 * Delete a document for a specific user (ownership check)
 */
export async function deleteDocumentForUser(
  id: string,
  userId: string
): Promise<boolean> {
  const result = await db
    .delete(documents)
    .where(and(eq(documents.id, id), eq(documents.userId, userId)))
    .returning({ id: documents.id });

  return result.length > 0;
}

/**
 * List documents for a user with optional filters
 */
export async function listDocuments(
  userId: string,
  filters: DocumentListFilters = {}
): Promise<{ documents: Document[]; total: number }> {
  const {
    status,
    isTemplate,
    search,
    limit = 20,
    offset = 0,
    orderBy = 'createdAt',
    orderDir = 'desc',
  } = filters;

  // Build conditions
  const conditions = [eq(documents.userId, userId)];

  if (status) {
    conditions.push(eq(documents.status, status));
  }

  if (isTemplate !== undefined) {
    conditions.push(eq(documents.isTemplate, isTemplate));
  }

  if (search) {
    conditions.push(ilike(documents.title, `%${search}%`));
  }

  // Get total count
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(documents)
    .where(and(...conditions));

  // Build order clause
  const orderColumn = orderBy === 'title'
    ? documents.title
    : orderBy === 'updatedAt'
      ? documents.updatedAt
      : documents.createdAt;

  const orderClause = orderDir === 'asc' ? asc(orderColumn) : desc(orderColumn);

  // Get documents
  const result = await db
    .select()
    .from(documents)
    .where(and(...conditions))
    .orderBy(orderClause)
    .limit(limit)
    .offset(offset);

  return {
    documents: result,
    total: count,
  };
}

/**
 * List templates for a user
 */
export async function listTemplates(
  userId: string,
  category?: string
): Promise<Document[]> {
  const conditions = [
    eq(documents.userId, userId),
    eq(documents.isTemplate, true),
  ];

  if (category) {
    conditions.push(eq(documents.templateCategory, category));
  }

  return db
    .select()
    .from(documents)
    .where(and(...conditions))
    .orderBy(desc(documents.createdAt));
}

/**
 * Duplicate a document (create a copy)
 */
export async function duplicateDocument(
  id: string,
  userId: string,
  newTitle?: string
): Promise<Document | null> {
  const original = await getDocumentForUser(id, userId);
  if (!original) return null;

  const [duplicate] = await db
    .insert(documents)
    .values({
      userId,
      title: newTitle ?? `${original.title} (Copy)`,
      status: 'draft',
      content: original.content as Block[],
      variables: original.variables,
      settings: original.settings,
      isTemplate: false,
      templateCategory: null,
    })
    .returning();

  return duplicate;
}

/**
 * Create a document from a template
 */
export async function createFromTemplate(
  templateId: string,
  userId: string,
  title: string
): Promise<Document | null> {
  const template = await getDocumentForUser(templateId, userId);
  if (!template || !template.isTemplate) return null;

  const [document] = await db
    .insert(documents)
    .values({
      userId,
      title,
      status: 'draft',
      content: template.content as Block[],
      variables: template.variables,
      settings: template.settings,
      isTemplate: false,
      templateCategory: null,
    })
    .returning();

  return document;
}

/**
 * Update document status
 */
export async function updateDocumentStatus(
  id: string,
  status: Document['status'],
  additionalData?: Partial<Pick<Document, 'sentAt' | 'expiresAt'>>
): Promise<Document | null> {
  const [document] = await db
    .update(documents)
    .set({
      status,
      ...additionalData,
      updatedAt: new Date(),
    })
    .where(eq(documents.id, id))
    .returning();

  return document ?? null;
}

/**
 * Get document count by status for a user
 */
export async function getDocumentCountsByStatus(
  userId: string
): Promise<Record<string, number>> {
  const result = await db
    .select({
      status: documents.status,
      count: sql<number>`count(*)::int`,
    })
    .from(documents)
    .where(and(eq(documents.userId, userId), eq(documents.isTemplate, false)))
    .groupBy(documents.status);

  return result.reduce(
    (acc, { status, count }) => {
      acc[status] = count;
      return acc;
    },
    {} as Record<string, number>
  );
}
