import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { integrations } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

const DROPBOX_CLIENT_ID = process.env.DROPBOX_CLIENT_ID;
const DROPBOX_CLIENT_SECRET = process.env.DROPBOX_CLIENT_SECRET;
const DROPBOX_REDIRECT_URI = process.env.DROPBOX_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/integrations/dropbox/callback`;

interface DropboxTokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  refresh_token?: string;
  scope: string;
  account_id: string;
  uid: string;
}

interface DropboxAccountInfo {
  account_id: string;
  name: {
    display_name: string;
    given_name: string;
    surname: string;
  };
  email: string;
  email_verified: boolean;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle OAuth errors
    if (error) {
      console.error('Dropbox OAuth error:', error);
      return NextResponse.redirect(
        new URL('/settings/integrations/dropbox?error=oauth_denied', request.url)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/settings/integrations/dropbox?error=missing_params', request.url)
      );
    }

    // Decode and validate state
    let stateData: { userId: string; timestamp: number; nonce: string };
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
    } catch {
      return NextResponse.redirect(
        new URL('/settings/integrations/dropbox?error=invalid_state', request.url)
      );
    }

    // Verify state is not too old (5 minutes)
    if (Date.now() - stateData.timestamp > 5 * 60 * 1000) {
      return NextResponse.redirect(
        new URL('/settings/integrations/dropbox?error=state_expired', request.url)
      );
    }

    const userId = stateData.userId;

    // Exchange code for tokens
    const tokenResponse = await fetch('https://api.dropboxapi.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: DROPBOX_CLIENT_ID!,
        client_secret: DROPBOX_CLIENT_SECRET!,
        redirect_uri: DROPBOX_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Failed to exchange code for tokens:', await tokenResponse.text());
      return NextResponse.redirect(
        new URL('/settings/integrations/dropbox?error=token_exchange_failed', request.url)
      );
    }

    const tokens: DropboxTokenResponse = await tokenResponse.json();

    // Get account info from Dropbox
    let accountInfo: DropboxAccountInfo | null = null;
    try {
      const accountResponse = await fetch('https://api.dropboxapi.com/2/users/get_current_account', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
          'Content-Type': 'application/json',
        },
        body: 'null',
      });

      if (accountResponse.ok) {
        accountInfo = await accountResponse.json();
      }
    } catch (error) {
      console.error('Failed to fetch Dropbox account info:', error);
    }

    // Calculate token expiration (Dropbox tokens typically don't expire, but we set 1 year)
    const tokenExpiresAt = tokens.expires_in
      ? new Date(Date.now() + tokens.expires_in * 1000)
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

    // Check if integration already exists
    const existingIntegration = await db.query.integrations.findFirst({
      where: and(
        eq(integrations.userId, userId),
        eq(integrations.provider, 'dropbox')
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
          accountEmail: accountInfo?.email,
          accountId: tokens.account_id,
          metadata: {
            uid: tokens.uid,
            name: accountInfo?.name?.display_name,
            connectedAt: new Date().toISOString(),
            path: existingIntegration.metadata && typeof existingIntegration.metadata === 'object' && 'path' in existingIntegration.metadata
              ? (existingIntegration.metadata as { path?: string }).path
              : '/OpenProposal',
            autoBackup: existingIntegration.metadata && typeof existingIntegration.metadata === 'object' && 'autoBackup' in existingIntegration.metadata
              ? (existingIntegration.metadata as { autoBackup?: boolean }).autoBackup
              : false,
            subfolderPattern: existingIntegration.metadata && typeof existingIntegration.metadata === 'object' && 'subfolderPattern' in existingIntegration.metadata
              ? (existingIntegration.metadata as { subfolderPattern?: string }).subfolderPattern
              : 'monthly',
          },
          updatedAt: new Date(),
        })
        .where(eq(integrations.id, existingIntegration.id));
    } else {
      // Create new integration
      await db.insert(integrations).values({
        userId,
        provider: 'dropbox',
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiresAt,
        scope: tokens.scope,
        accountEmail: accountInfo?.email,
        accountId: tokens.account_id,
        metadata: {
          uid: tokens.uid,
          name: accountInfo?.name?.display_name,
          connectedAt: new Date().toISOString(),
          path: '/OpenProposal',
          autoBackup: false,
          subfolderPattern: 'monthly',
        },
      });
    }

    // Redirect to success page
    return NextResponse.redirect(
      new URL('/settings/integrations/dropbox?success=connected', request.url)
    );
  } catch (error) {
    console.error('Dropbox callback error:', error);
    return NextResponse.redirect(
      new URL('/settings/integrations/dropbox?error=callback_failed', request.url)
    );
  }
}
