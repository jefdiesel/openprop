import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { integrations } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

const PANDADOC_CLIENT_ID = process.env.PANDADOC_CLIENT_ID;
const PANDADOC_CLIENT_SECRET = process.env.PANDADOC_CLIENT_SECRET;
const PANDADOC_REDIRECT_URI = process.env.PANDADOC_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/integrations/pandadoc/callback`;

interface PandaDocTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

interface PandaDocUserInfo {
  email: string;
  id: string;
  name?: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle OAuth errors
    if (error) {
      console.error('PandaDoc OAuth error:', error);
      return NextResponse.redirect(
        new URL('/settings/integrations/pandadoc?error=oauth_denied', request.url)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/settings/integrations/pandadoc?error=missing_params', request.url)
      );
    }

    // Decode and validate state
    let stateData: { userId: string; timestamp: number; nonce: string };
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
    } catch {
      return NextResponse.redirect(
        new URL('/settings/integrations/pandadoc?error=invalid_state', request.url)
      );
    }

    // Verify state is not too old (5 minutes)
    if (Date.now() - stateData.timestamp > 5 * 60 * 1000) {
      return NextResponse.redirect(
        new URL('/settings/integrations/pandadoc?error=state_expired', request.url)
      );
    }

    const userId = stateData.userId;

    // Exchange code for tokens
    const tokenResponse = await fetch('https://api.pandadoc.com/oauth2/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: PANDADOC_CLIENT_ID!,
        client_secret: PANDADOC_CLIENT_SECRET!,
        redirect_uri: PANDADOC_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Failed to exchange code for tokens:', await tokenResponse.text());
      return NextResponse.redirect(
        new URL('/settings/integrations/pandadoc?error=token_exchange_failed', request.url)
      );
    }

    const tokens: PandaDocTokenResponse = await tokenResponse.json();

    // Get user info from PandaDoc
    let userInfo: PandaDocUserInfo | null = null;
    try {
      const userResponse = await fetch('https://api.pandadoc.com/public/v1/members/current', {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      });

      if (userResponse.ok) {
        userInfo = await userResponse.json();
      }
    } catch (error) {
      console.error('Failed to fetch PandaDoc user info:', error);
    }

    // Calculate token expiration
    const tokenExpiresAt = new Date(Date.now() + tokens.expires_in * 1000);

    // Check if integration already exists
    const existingIntegration = await db.query.integrations.findFirst({
      where: and(
        eq(integrations.userId, userId),
        eq(integrations.provider, 'pandadoc')
      ),
    });

    if (existingIntegration) {
      // Update existing integration
      await db
        .update(integrations)
        .set({
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          tokenExpiresAt,
          scope: tokens.scope,
          accountEmail: userInfo?.email,
          accountId: userInfo?.id,
          metadata: {
            name: userInfo?.name,
            connectedAt: new Date().toISOString(),
          },
          updatedAt: new Date(),
        })
        .where(eq(integrations.id, existingIntegration.id));
    } else {
      // Create new integration
      await db.insert(integrations).values({
        userId,
        provider: 'pandadoc',
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiresAt,
        scope: tokens.scope,
        accountEmail: userInfo?.email,
        accountId: userInfo?.id,
        metadata: {
          name: userInfo?.name,
          connectedAt: new Date().toISOString(),
        },
      });
    }

    // Redirect to success page
    return NextResponse.redirect(
      new URL('/settings/integrations/pandadoc?success=connected', request.url)
    );
  } catch (error) {
    console.error('PandaDoc callback error:', error);
    return NextResponse.redirect(
      new URL('/settings/integrations/pandadoc?error=callback_failed', request.url)
    );
  }
}
