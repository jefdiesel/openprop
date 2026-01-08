import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { integrations } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { revokeToken } from '@/lib/quickbooks';

const QUICKBOOKS_CLIENT_ID = process.env.QUICKBOOKS_CLIENT_ID;
const QUICKBOOKS_CLIENT_SECRET = process.env.QUICKBOOKS_CLIENT_SECRET;
const QUICKBOOKS_REDIRECT_URI = process.env.QUICKBOOKS_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/integrations/quickbooks/callback`;
const QUICKBOOKS_ENVIRONMENT = (process.env.QUICKBOOKS_ENVIRONMENT || 'production') as 'sandbox' | 'production';

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
        eq(integrations.provider, 'quickbooks')
      ),
    });

    if (!integration) {
      return NextResponse.json(
        { error: 'Integration not found' },
        { status: 404 }
      );
    }

    // Revoke the token at QuickBooks
    if (integration.accessToken && QUICKBOOKS_CLIENT_ID && QUICKBOOKS_CLIENT_SECRET) {
      try {
        await revokeToken(
          {
            clientId: QUICKBOOKS_CLIENT_ID,
            clientSecret: QUICKBOOKS_CLIENT_SECRET,
            redirectUri: QUICKBOOKS_REDIRECT_URI,
            environment: QUICKBOOKS_ENVIRONMENT,
          },
          integration.accessToken
        );
      } catch (error) {
        console.error('Failed to revoke QuickBooks token:', error);
        // Continue with deletion even if revocation fails
      }
    }

    // Delete the integration
    await db
      .delete(integrations)
      .where(eq(integrations.id, integration.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to disconnect QuickBooks:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect' },
      { status: 500 }
    );
  }
}
