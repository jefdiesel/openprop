import { and, desc, eq, isNull } from 'drizzle-orm';
import { db } from '..';
import { comments } from '../schema';

export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;

// Create a new comment
export async function createComment(
  data: Omit<NewComment, 'id' | 'createdAt' | 'updatedAt'>
) {
  const [comment] = await db
    .insert(comments)
    .values({
      ...data,
      resolved: data.resolved ?? false,
    })
    .returning();
  return comment;
}

// Get a comment by ID
export async function getComment(id: string) {
  const [comment] = await db
    .select()
    .from(comments)
    .where(eq(comments.id, id))
    .limit(1);
  return comment ?? null;
}

// Get a comment with user info
export async function getCommentWithUser(id: string) {
  const comment = await db.query.comments.findFirst({
    where: eq(comments.id, id),
    with: {
      user: true,
    },
  });
  return comment ?? null;
}

// Get all comments for a document (top-level only)
export async function getDocumentComments(documentId: string) {
  return db.query.comments.findMany({
    where: and(
      eq(comments.documentId, documentId),
      isNull(comments.parentId)
    ),
    with: {
      user: true,
      replies: {
        with: {
          user: true,
        },
        orderBy: [comments.createdAt],
      },
    },
    orderBy: [desc(comments.createdAt)],
  });
}

// Get comments for a specific block
export async function getBlockComments(documentId: string, blockId: string) {
  return db.query.comments.findMany({
    where: and(
      eq(comments.documentId, documentId),
      eq(comments.blockId, blockId),
      isNull(comments.parentId)
    ),
    with: {
      user: true,
      replies: {
        with: {
          user: true,
        },
        orderBy: [comments.createdAt],
      },
    },
    orderBy: [desc(comments.createdAt)],
  });
}

// Get replies to a comment
export async function getCommentReplies(parentId: string) {
  return db.query.comments.findMany({
    where: eq(comments.parentId, parentId),
    with: {
      user: true,
    },
    orderBy: [comments.createdAt],
  });
}

// Update a comment
export async function updateComment(
  id: string,
  data: Partial<Pick<NewComment, 'content' | 'resolved' | 'resolvedAt' | 'resolvedBy'>>
) {
  const [comment] = await db
    .update(comments)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(comments.id, id))
    .returning();
  return comment ?? null;
}

// Resolve a comment
export async function resolveComment(id: string, resolvedBy: string) {
  const [comment] = await db
    .update(comments)
    .set({
      resolved: true,
      resolvedAt: new Date(),
      resolvedBy,
      updatedAt: new Date(),
    })
    .where(eq(comments.id, id))
    .returning();
  return comment ?? null;
}

// Unresolve a comment
export async function unresolveComment(id: string) {
  const [comment] = await db
    .update(comments)
    .set({
      resolved: false,
      resolvedAt: null,
      resolvedBy: null,
      updatedAt: new Date(),
    })
    .where(eq(comments.id, id))
    .returning();
  return comment ?? null;
}

// Delete a comment
export async function deleteComment(id: string) {
  const [comment] = await db
    .delete(comments)
    .where(eq(comments.id, id))
    .returning();
  return comment ?? null;
}

// Get unresolved comment count for a document
export async function getUnresolvedCommentCount(documentId: string) {
  const result = await db
    .select()
    .from(comments)
    .where(
      and(
        eq(comments.documentId, documentId),
        eq(comments.resolved, false),
        isNull(comments.parentId)
      )
    );
  return result.length;
}

// Check if user owns a comment
export async function userOwnsComment(commentId: string, userId: string) {
  const [comment] = await db
    .select()
    .from(comments)
    .where(and(eq(comments.id, commentId), eq(comments.userId, userId)))
    .limit(1);
  return !!comment;
}

// Get comment counts per block for a document
export async function getBlockCommentCounts(documentId: string): Promise<Record<string, number>> {
  const allComments = await db
    .select()
    .from(comments)
    .where(
      and(
        eq(comments.documentId, documentId),
        isNull(comments.parentId),
        eq(comments.resolved, false)
      )
    );

  const counts: Record<string, number> = {};
  for (const comment of allComments) {
    if (comment.blockId) {
      counts[comment.blockId] = (counts[comment.blockId] || 0) + 1;
    }
  }

  return counts;
}
