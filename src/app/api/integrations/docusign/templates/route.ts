import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { integrations } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { DocuSignClient, DocuSignError } from '@/lib/docusign/client';
import { refreshAccessToken } from '@/lib/docusign/auth';

const DOCUSIGN_CLIENT_ID = process.env.DOCUSIGN_CLIENT_ID;
const DOCUSIGN_CLIENT_SECRET = process.env.DOCUSIGN_CLIENT_SECRET;
const DOCUSIGN_REDIRECT_URI = process.env.DOCUSIGN_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/integrations/docusign/callback`;

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const startPosition = parseInt(searchParams.get('start_position') || '0', 10);
    const count = parseInt(searchParams.get('count') || '50', 10);

    // Validate parameters
    if (startPosition < 0 || count < 1 || count > 100) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
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

    if (!integration.accessToken || !integration.accountId) {
      return NextResponse.json(
        { error: 'Integration not properly configured' },
        { status: 400 }
      );
    }

    const metadata = integration.metadata as any;
    const baseUri = metadata?.baseUri;

    if (!baseUri) {
      return NextResponse.json(
        { error: 'Base URI not found in integration' },
        { status: 400 }
      );
    }

    // Create DocuSign client
    const client = new DocuSignClient({
      accessToken: integration.accessToken,
      refreshToken: integration.refreshToken || undefined,
      tokenExpiresAt: integration.tokenExpiresAt || undefined,
      accountId: integration.accountId,
      baseUri,
      oauthConfig: DOCUSIGN_CLIENT_ID && DOCUSIGN_CLIENT_SECRET ? {
        clientId: DOCUSIGN_CLIENT_ID,
        clientSecret: DOCUSIGN_CLIENT_SECRET,
        redirectUri: DOCUSIGN_REDIRECT_URI,
      } : undefined,
      onTokenRefresh: async (tokens) => {
        // Update tokens in database
        await db
          .update(integrations)
          .set({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            tokenExpiresAt: tokens.expiresAt,
            updatedAt: new Date(),
          })
          .where(eq(integrations.id, integration.id));
      },
    });

    try {
      // List templates
      const response = await client.listTemplates(startPosition, count);

      return NextResponse.json({
        templates: response.envelopeTemplates,
        pagination: {
          total: parseInt(response.totalSetSize || '0', 10),
          startPosition: parseInt(response.startPosition || '0', 10),
          count: parseInt(response.resultSetSize || '0', 10),
          hasMore: !!response.nextUri,
        },
      });
    } catch (error) {
      // Handle 401 errors (token expired/invalid)
      if (error instanceof DocuSignError && error.statusCode === 401) {
        // Try to refresh token if we have a refresh token
        if (integration.refreshToken && DOCUSIGN_CLIENT_ID && DOCUSIGN_CLIENT_SECRET) {
          try {
            const newTokens = await refreshAccessToken(
              {
                clientId: DOCUSIGN_CLIENT_ID,
                clientSecret: DOCUSIGN_CLIENT_SECRET,
                redirectUri: DOCUSIGN_REDIRECT_URI,
              },
              integration.refreshToken
            );

            // Update tokens in database
            await db
              .update(integrations)
              .set({
                accessToken: newTokens.accessToken,
                refreshToken: newTokens.refreshToken,
                tokenExpiresAt: newTokens.expiresAt,
                updatedAt: new Date(),
              })
              .where(eq(integrations.id, integration.id));

            // Retry with new token
            const retryClient = new DocuSignClient({
              accessToken: newTokens.accessToken,
              accountId: integration.accountId,
              baseUri,
            });

            const response = await retryClient.listTemplates(startPosition, count);

            return NextResponse.json({
              templates: response.envelopeTemplates,
              pagination: {
                total: parseInt(response.totalSetSize || '0', 10),
                startPosition: parseInt(response.startPosition || '0', 10),
                count: parseInt(response.resultSetSize || '0', 10),
                hasMore: !!response.nextUri,
              },
            });
          } catch (refreshError) {
            console.error('Failed to refresh DocuSign token:', refreshError);
            return NextResponse.json(
              { error: 'Token refresh failed. Please reconnect DocuSign.' },
              { status: 401 }
            );
          }
        }

        return NextResponse.json(
          { error: 'Unauthorized. Please reconnect DocuSign.' },
          { status: 401 }
        );
      }

      throw error;
    }
  } catch (error) {
    console.error('Failed to list DocuSign templates:', error);

    if (error instanceof DocuSignError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Failed to list templates' },
      { status: 500 }
    );
  }
}
