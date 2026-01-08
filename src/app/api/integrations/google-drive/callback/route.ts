import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { integrations } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { exchangeCodeForTokens } from '@/lib/google-drive';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_DRIVE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET =
  process.env.GOOGLE_DRIVE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI =
  process.env.GOOGLE_DRIVE_REDIRECT_URI ||
  `${process.env.NEXTAUTH_URL}/api/integrations/google-drive/callback`;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle OAuth errors
    if (error) {
      console.error('Google Drive OAuth error:', error);
      return NextResponse.redirect(
        new URL('/settings/integrations/google-drive?error=oauth_denied', request.url)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/settings/integrations/google-drive?error=missing_params', request.url)
      );
    }

    // Decode and validate state
    let stateData: { userId: string; timestamp: number; nonce: string };
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
    } catch {
      return NextResponse.redirect(
        new URL('/settings/integrations/google-drive?error=invalid_state', request.url)
      );
    }

    // Verify state is not too old (5 minutes)
    if (Date.now() - stateData.timestamp > 5 * 60 * 1000) {
      return NextResponse.redirect(
        new URL('/settings/integrations/google-drive?error=state_expired', request.url)
      );
    }

    const userId = stateData.userId;

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(
      {
        clientId: GOOGLE_CLIENT_ID!,
        clientSecret: GOOGLE_CLIENT_SECRET!,
        redirectUri: GOOGLE_REDIRECT_URI,
      },
      code
    );

    // Get user email from Google using the access token
    let userEmail: string | null = null;
    try {
      const userInfoResponse = await fetch(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        }
      );

      if (userInfoResponse.ok) {
        const userInfo = await userInfoResponse.json();
        userEmail = userInfo.email;
      }
    } catch (error) {
      console.error('Failed to fetch Google user info:', error);
    }

    // Check if integration already exists
    const existingIntegration = await db.query.integrations.findFirst({
      where: and(
        eq(integrations.userId, userId),
        eq(integrations.provider, 'google_drive')
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
          scope: tokens.scope,
          accountEmail: userEmail,
          metadata: {
            ...((existingIntegration.metadata as Record<string, unknown>) || {}),
            connectedAt: new Date().toISOString(),
          },
          updatedAt: new Date(),
        })
        .where(eq(integrations.id, existingIntegration.id));
    } else {
      // Create new integration
      await db.insert(integrations).values({
        userId,
        provider: 'google_drive',
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenExpiresAt: tokens.expiresAt,
        scope: tokens.scope,
        accountEmail: userEmail,
        metadata: {
          connectedAt: new Date().toISOString(),
          autoBackup: false,
          subfolderPattern: 'none',
        },
      });
    }

    // Redirect to success page
    return NextResponse.redirect(
      new URL('/settings/integrations/google-drive?success=connected', request.url)
    );
  } catch (error) {
    console.error('Google Drive callback error:', error);
    return NextResponse.redirect(
      new URL('/settings/integrations/google-drive?error=callback_failed', request.url)
    );
  }
}
