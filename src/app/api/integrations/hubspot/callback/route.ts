import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { integrations } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { exchangeCodeForTokens, getAccessTokenInfo } from '@/lib/hubspot';

const HUBSPOT_CLIENT_ID = process.env.HUBSPOT_CLIENT_ID;
const HUBSPOT_CLIENT_SECRET = process.env.HUBSPOT_CLIENT_SECRET;
const HUBSPOT_REDIRECT_URI = process.env.HUBSPOT_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/integrations/hubspot/callback`;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Handle OAuth errors
    if (error) {
      console.error('HubSpot OAuth error:', error, errorDescription);
      return NextResponse.redirect(
        new URL('/settings/integrations/hubspot?error=oauth_denied', request.url)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/settings/integrations/hubspot?error=missing_params', request.url)
      );
    }

    // Decode and validate state
    let stateData: { userId: string; timestamp: number; nonce: string };
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
    } catch {
      return NextResponse.redirect(
        new URL('/settings/integrations/hubspot?error=invalid_state', request.url)
      );
    }

    // Verify state is not too old (5 minutes)
    if (Date.now() - stateData.timestamp > 5 * 60 * 1000) {
      return NextResponse.redirect(
        new URL('/settings/integrations/hubspot?error=state_expired', request.url)
      );
    }

    const userId = stateData.userId;

    if (!HUBSPOT_CLIENT_ID || !HUBSPOT_CLIENT_SECRET) {
      return NextResponse.redirect(
        new URL('/settings/integrations/hubspot?error=not_configured', request.url)
      );
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(
      {
        clientId: HUBSPOT_CLIENT_ID,
        clientSecret: HUBSPOT_CLIENT_SECRET,
        redirectUri: HUBSPOT_REDIRECT_URI,
      },
      code
    );

    // Get account info from HubSpot
    let accountInfo: {
      hubId: number;
      hubDomain: string;
      userEmail: string;
      userId: number;
    } | null = null;

    try {
      const tokenInfo = await getAccessTokenInfo(tokens.accessToken);
      accountInfo = {
        hubId: tokenInfo.hub_id,
        hubDomain: tokenInfo.hub_domain,
        userEmail: tokenInfo.user,
        userId: tokenInfo.user_id,
      };
    } catch (error) {
      console.error('Failed to fetch HubSpot account info:', error);
    }

    // Check if integration already exists
    const existingIntegration = await db.query.integrations.findFirst({
      where: and(
        eq(integrations.userId, userId),
        eq(integrations.provider, 'hubspot')
      ),
    });

    // Default sync settings
    const defaultSyncSettings = {
      enabled: true,
      syncOnDocumentSent: true,
      syncOnDocumentViewed: false,
      syncOnDocumentSigned: true,
      syncOnDocumentCompleted: true,
      createDealsOnCompletion: false,
      createTasksOnCompletion: false,
    };

    if (existingIntegration) {
      // Update existing integration
      await db
        .update(integrations)
        .set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          tokenExpiresAt: tokens.expiresAt,
          accountEmail: accountInfo?.userEmail,
          accountId: accountInfo?.hubId?.toString(),
          metadata: {
            hubDomain: accountInfo?.hubDomain,
            hubUserId: accountInfo?.userId,
            connectedAt: new Date().toISOString(),
            syncSettings: (existingIntegration.metadata as Record<string, unknown>)?.syncSettings || defaultSyncSettings,
          },
          updatedAt: new Date(),
        })
        .where(eq(integrations.id, existingIntegration.id));
    } else {
      // Create new integration
      await db.insert(integrations).values({
        userId,
        provider: 'hubspot',
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenExpiresAt: tokens.expiresAt,
        accountEmail: accountInfo?.userEmail,
        accountId: accountInfo?.hubId?.toString(),
        metadata: {
          hubDomain: accountInfo?.hubDomain,
          hubUserId: accountInfo?.userId,
          connectedAt: new Date().toISOString(),
          syncSettings: defaultSyncSettings,
        },
      });
    }

    // Redirect to success page
    return NextResponse.redirect(
      new URL('/settings/integrations/hubspot?success=connected', request.url)
    );
  } catch (error) {
    console.error('HubSpot callback error:', error);
    return NextResponse.redirect(
      new URL('/settings/integrations/hubspot?error=callback_failed', request.url)
    );
  }
}
