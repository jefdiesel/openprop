import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { integrations } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { revokeToken } from '@/lib/docusign/auth';

const DOCUSIGN_CLIENT_ID = process.env.DOCUSIGN_CLIENT_ID;
const DOCUSIGN_CLIENT_SECRET = process.env.DOCUSIGN_CLIENT_SECRET;
const DOCUSIGN_REDIRECT_URI = process.env.DOCUSIGN_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/integrations/docusign/callback`;

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's DocuSign integration
    const integration = await db.query.integrations.findFirst({
      where: and(
        eq(integrations.userId, session.user.id),
        eq(integrations.provider, 'docusign')
      ),
    });

    if (!integration) {
      return NextResponse.json(
        { error: 'DocuSign integration not found' },
        { status: 404 }
      );
    }

    // Revoke the access token if possible
    if (integration.accessToken && DOCUSIGN_CLIENT_ID && DOCUSIGN_CLIENT_SECRET) {
      try {
        await revokeToken(
          {
            clientId: DOCUSIGN_CLIENT_ID,
            clientSecret: DOCUSIGN_CLIENT_SECRET,
            redirectUri: DOCUSIGN_REDIRECT_URI,
          },
          integration.accessToken
        );
      } catch (error) {
        console.error('Failed to revoke DocuSign token:', error);
        // Continue with deletion even if revocation fails
      }
    }

    // Delete the integration from database
    await db
      .delete(integrations)
      .where(eq(integrations.id, integration.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to disconnect DocuSign:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect integration' },
      { status: 500 }
    );
  }
}
