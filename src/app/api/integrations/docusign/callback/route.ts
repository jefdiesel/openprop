import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { integrations } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { exchangeCodeForTokens, getUserInfo } from '@/lib/docusign/auth';

const DOCUSIGN_CLIENT_ID = process.env.DOCUSIGN_CLIENT_ID;
const DOCUSIGN_CLIENT_SECRET = process.env.DOCUSIGN_CLIENT_SECRET;
const DOCUSIGN_REDIRECT_URI = process.env.DOCUSIGN_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/integrations/docusign/callback`;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle OAuth errors
    if (error) {
      console.error('DocuSign OAuth error:', error);
      return NextResponse.redirect(
        new URL('/settings/integrations/docusign?error=oauth_denied', request.url)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/settings/integrations/docusign?error=missing_params', request.url)
      );
    }

    // Decode and validate state
    let stateData: { userId: string; timestamp: number; nonce: string };
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
    } catch {
      return NextResponse.redirect(
        new URL('/settings/integrations/docusign?error=invalid_state', request.url)
      );
    }

    // Verify state is not too old (5 minutes)
    if (Date.now() - stateData.timestamp > 5 * 60 * 1000) {
      return NextResponse.redirect(
        new URL('/settings/integrations/docusign?error=state_expired', request.url)
      );
    }

    const userId = stateData.userId;

    if (!DOCUSIGN_CLIENT_ID || !DOCUSIGN_CLIENT_SECRET) {
      return NextResponse.redirect(
        new URL('/settings/integrations/docusign?error=config_missing', request.url)
      );
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(
      {
        clientId: DOCUSIGN_CLIENT_ID,
        clientSecret: DOCUSIGN_CLIENT_SECRET,
        redirectUri: DOCUSIGN_REDIRECT_URI,
      },
      code
    );

    // Get user info to retrieve account ID and base URI
    const userInfo = await getUserInfo(tokens.accessToken);

    // Find default account
    const defaultAccount = userInfo.accounts.find(a => a.is_default) || userInfo.accounts[0];

    if (!defaultAccount) {
      return NextResponse.redirect(
        new URL('/settings/integrations/docusign?error=no_account', request.url)
      );
    }

    // Check if integration already exists
    const existingIntegration = await db.query.integrations.findFirst({
      where: and(
        eq(integrations.userId, userId),
        eq(integrations.provider, 'docusign')
      ),
    });

    if (existingIntegration) {
      // Update existing integration
      await db
        .update(integrations)
        .set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          tokenExpiresAt: tokens.expiresAt,
          accountEmail: userInfo.email,
          accountId: defaultAccount.account_id,
          metadata: {
            accountName: defaultAccount.account_name,
            baseUri: defaultAccount.base_uri,
            userName: userInfo.name,
            connectedAt: new Date().toISOString(),
          },
          updatedAt: new Date(),
        })
        .where(eq(integrations.id, existingIntegration.id));
    } else {
      // Create new integration
      await db.insert(integrations).values({
        userId,
        provider: 'docusign',
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenExpiresAt: tokens.expiresAt,
        accountEmail: userInfo.email,
        accountId: defaultAccount.account_id,
        metadata: {
          accountName: defaultAccount.account_name,
          baseUri: defaultAccount.base_uri,
          userName: userInfo.name,
          connectedAt: new Date().toISOString(),
        },
      });
    }

    // Redirect to success page
    return NextResponse.redirect(
      new URL('/settings/integrations/docusign?success=connected', request.url)
    );
  } catch (error) {
    console.error('DocuSign callback error:', error);
    return NextResponse.redirect(
      new URL('/settings/integrations/docusign?error=callback_failed', request.url)
    );
  }
}
