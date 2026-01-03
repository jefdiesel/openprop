import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { integrations } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Find the integration
    const integration = await db.query.integrations.findFirst({
      where: and(
        eq(integrations.userId, session.user.id),
        eq(integrations.provider, 'pandadoc')
      ),
    });

    if (!integration) {
      return NextResponse.json(
        { error: 'Integration not found' },
        { status: 404 }
      );
    }

    // Optionally revoke the token at PandaDoc
    if (integration.accessToken) {
      try {
        await fetch('https://api.pandadoc.com/oauth2/revoke', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            token: integration.accessToken,
            client_id: process.env.PANDADOC_CLIENT_ID!,
            client_secret: process.env.PANDADOC_CLIENT_SECRET!,
          }),
        });
      } catch (error) {
        console.error('Failed to revoke PandaDoc token:', error);
        // Continue with deletion even if revocation fails
      }
    }

    // Delete the integration
    await db
      .delete(integrations)
      .where(eq(integrations.id, integration.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to disconnect PandaDoc:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect' },
      { status: 500 }
    );
  }
}
