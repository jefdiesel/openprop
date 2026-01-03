import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { integrations } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { revokeRefreshToken } from '@/lib/hubspot';

const HUBSPOT_CLIENT_ID = process.env.HUBSPOT_CLIENT_ID;
const HUBSPOT_CLIENT_SECRET = process.env.HUBSPOT_CLIENT_SECRET;
const HUBSPOT_REDIRECT_URI = process.env.HUBSPOT_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/integrations/hubspot/callback`;

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
        eq(integrations.provider, 'hubspot')
      ),
    });

    if (!integration) {
      return NextResponse.json(
        { error: 'Integration not found' },
        { status: 404 }
      );
    }

    // Optionally revoke the refresh token at HubSpot
    if (integration.refreshToken && HUBSPOT_CLIENT_ID && HUBSPOT_CLIENT_SECRET) {
      try {
        await revokeRefreshToken(
          {
            clientId: HUBSPOT_CLIENT_ID,
            clientSecret: HUBSPOT_CLIENT_SECRET,
            redirectUri: HUBSPOT_REDIRECT_URI,
          },
          integration.refreshToken
        );
      } catch (error) {
        console.error('Failed to revoke HubSpot token:', error);
        // Continue with deletion even if revocation fails
      }
    }

    // Delete the integration
    await db
      .delete(integrations)
      .where(eq(integrations.id, integration.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to disconnect HubSpot:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect' },
      { status: 500 }
    );
  }
}
