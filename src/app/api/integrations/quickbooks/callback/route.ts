import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { integrations } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { exchangeCodeForTokens } from '@/lib/quickbooks';

const QUICKBOOKS_CLIENT_ID = process.env.QUICKBOOKS_CLIENT_ID;
const QUICKBOOKS_CLIENT_SECRET = process.env.QUICKBOOKS_CLIENT_SECRET;
const QUICKBOOKS_REDIRECT_URI = process.env.QUICKBOOKS_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/integrations/quickbooks/callback`;
const QUICKBOOKS_ENVIRONMENT = (process.env.QUICKBOOKS_ENVIRONMENT || 'production') as 'sandbox' | 'production';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const realmId = searchParams.get('realmId');
    const error = searchParams.get('error');

    // Handle OAuth errors
    if (error) {
      console.error('QuickBooks OAuth error:', error);
      return NextResponse.redirect(
        new URL('/settings/integrations/quickbooks?error=oauth_denied', request.url)
      );
    }

    if (!code || !state || !realmId) {
      return NextResponse.redirect(
        new URL('/settings/integrations/quickbooks?error=missing_params', request.url)
      );
    }

    // Decode and validate state
    let stateData: { userId: string; timestamp: number; nonce: string };
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
    } catch {
      return NextResponse.redirect(
        new URL('/settings/integrations/quickbooks?error=invalid_state', request.url)
      );
    }

    // Verify state is not too old (5 minutes)
    if (Date.now() - stateData.timestamp > 5 * 60 * 1000) {
      return NextResponse.redirect(
        new URL('/settings/integrations/quickbooks?error=state_expired', request.url)
      );
    }

    const userId = stateData.userId;

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(
      {
        clientId: QUICKBOOKS_CLIENT_ID!,
        clientSecret: QUICKBOOKS_CLIENT_SECRET!,
        redirectUri: QUICKBOOKS_REDIRECT_URI,
        environment: QUICKBOOKS_ENVIRONMENT,
      },
      code,
      realmId
    );

    // Get company info
    let companyName: string | undefined;
    try {
      const companyResponse = await fetch(
        `https://${QUICKBOOKS_ENVIRONMENT === 'sandbox' ? 'sandbox-' : ''}quickbooks.api.intuit.com/v3/company/${realmId}/companyinfo/${realmId}`,
        {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
            Accept: 'application/json',
          },
        }
      );

      if (companyResponse.ok) {
        const data = await companyResponse.json();
        companyName = data.CompanyInfo?.CompanyName;
      }
    } catch (error) {
      console.error('Failed to fetch QuickBooks company info:', error);
    }

    // Check if integration already exists
    const existingIntegration = await db.query.integrations.findFirst({
      where: and(
        eq(integrations.userId, userId),
        eq(integrations.provider, 'quickbooks')
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
          accountId: realmId,
          metadata: {
            realmId,
            companyName,
            environment: QUICKBOOKS_ENVIRONMENT,
            refreshTokenExpiresAt: tokens.refreshTokenExpiresAt.toISOString(),
            connectedAt: new Date().toISOString(),
            autoCreateInvoice: existingIntegration.metadata?.autoCreateInvoice ?? true,
          },
          updatedAt: new Date(),
        })
        .where(eq(integrations.id, existingIntegration.id));
    } else {
      // Create new integration
      await db.insert(integrations).values({
        userId,
        provider: 'quickbooks',
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenExpiresAt: tokens.expiresAt,
        accountId: realmId,
        metadata: {
          realmId,
          companyName,
          environment: QUICKBOOKS_ENVIRONMENT,
          refreshTokenExpiresAt: tokens.refreshTokenExpiresAt.toISOString(),
          connectedAt: new Date().toISOString(),
          autoCreateInvoice: true, // Default to auto-create
        },
      });
    }

    // Redirect to success page
    return NextResponse.redirect(
      new URL('/settings/integrations/quickbooks?success=connected', request.url)
    );
  } catch (error) {
    console.error('QuickBooks callback error:', error);
    return NextResponse.redirect(
      new URL('/settings/integrations/quickbooks?error=callback_failed', request.url)
    );
  }
}
