import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * Check if a user has admin privileges
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      isAdmin: true,
    },
  });

  return user?.isAdmin ?? false;
}

/**
 * Require admin privileges for API routes
 * Returns authorization status with user info or error
 */
export async function requireAdmin(): Promise<{
  authorized: boolean;
  userId?: string;
  error?: string;
}> {
  const session = await auth();
  if (!session?.user?.id) {
    return { authorized: false, error: "Unauthorized" };
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: {
      id: true,
      isAdmin: true,
    },
  });

  if (!user) {
    return { authorized: false, error: "User not found" };
  }

  if (!user.isAdmin) {
    return { authorized: false, error: "Admin privileges required" };
  }

  return { authorized: true, userId: user.id };
}
