import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { integrations } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { revokeToken } from '@/lib/google-drive';

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const integration = await db.query.integrations.findFirst({
      where: and(
        eq(integrations.userId, session.user.id),
        eq(integrations.provider, 'google_drive')
      ),
    });

    if (!integration) {
      return NextResponse.json(
        { error: 'Google Drive not connected' },
        { status: 404 }
      );
    }

    // Revoke the access token with Google
    if (integration.accessToken) {
      try {
        await revokeToken(integration.accessToken);
      } catch (error) {
        console.error('Failed to revoke Google Drive token:', error);
        // Continue with deletion even if revocation fails
      }
    }

    // Delete the integration from database
    await db
      .delete(integrations)
      .where(eq(integrations.id, integration.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to disconnect Google Drive:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect' },
      { status: 500 }
    );
  }
}
