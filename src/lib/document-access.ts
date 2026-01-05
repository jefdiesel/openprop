import { db } from '@/lib/db'
import { documents, profiles, organizationMembers } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

// Helper to check if user can access a document (owner or same org member)
export async function canAccessDocument(userId: string, documentId: string) {
  // Get document
  const [doc] = await db
    .select({
      id: documents.id,
      userId: documents.userId,
      organizationId: documents.organizationId
    })
    .from(documents)
    .where(eq(documents.id, documentId))
    .limit(1);

  if (!doc) return { allowed: false, document: null };

  // Owner can always access
  if (doc.userId === userId) return { allowed: true, document: doc };

  // Check if doc belongs to an org the user is a member of
  if (doc.organizationId) {
    const [membership] = await db
      .select({ id: organizationMembers.id })
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, doc.organizationId),
          eq(organizationMembers.userId, userId),
          eq(organizationMembers.status, 'active')
        )
      )
      .limit(1);

    if (membership) return { allowed: true, document: doc };
  }

  return { allowed: false, document: null };
}
