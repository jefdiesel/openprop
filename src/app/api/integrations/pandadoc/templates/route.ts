import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { integrations } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { PandaDocClient, PandaDocError } from '@/lib/pandadoc/client';
import { refreshAccessToken } from '@/lib/pandadoc/auth';

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
    const page = parseInt(searchParams.get('page') || '1', 10);
    const count = parseInt(searchParams.get('count') || '50', 10);

    // Validate parameters
    if (page < 1 || count < 1 || count > 100) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }

    // Get user's PandaDoc integration
    const integration = await db.query.integrations.findFirst({
      where: and(
        eq(integrations.userId, session.user.id),
        eq(integrations.provider, 'pandadoc')
      ),
    });

    if (!integration) {
      return NextResponse.json(
        { error: 'PandaDoc integration not found' },
        { status: 404 }
      );
    }

    if (!integration.accessToken) {
      return NextResponse.json(
        { error: 'Access token not found' },
        { status: 400 }
      );
    }

    // Create PandaDoc client
    const client = new PandaDocClient({
      accessToken: integration.accessToken,
      refreshToken: integration.refreshToken || undefined,
      tokenExpiresAt: integration.tokenExpiresAt || undefined,
      oauthConfig: {
        clientId: process.env.PANDADOC_CLIENT_ID!,
        clientSecret: process.env.PANDADOC_CLIENT_SECRET!,
        redirectUri: process.env.PANDADOC_REDIRECT_URI!,
      },
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
      const { results, count: total } = await client.listTemplates(page, count);

      return NextResponse.json({
        templates: results,
        pagination: {
          total,
          page,
          count: results.length,
        },
      });
    } catch (error) {
      // Handle 401 errors (token expired/invalid)
      if (error instanceof PandaDocError && error.statusCode === 401) {
        // Try to refresh token if we have a refresh token
        if (integration.refreshToken) {
          try {
            const newTokens = await refreshAccessToken(
              {
                clientId: process.env.PANDADOC_CLIENT_ID!,
                clientSecret: process.env.PANDADOC_CLIENT_SECRET!,
                redirectUri: process.env.PANDADOC_REDIRECT_URI!,
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
            const retryClient = new PandaDocClient({
              accessToken: newTokens.accessToken,
            });

            const { results, count: total } = await retryClient.listTemplates(page, count);

            return NextResponse.json({
              templates: results,
              pagination: {
                total,
                page,
                count: results.length,
              },
            });
          } catch (refreshError) {
            console.error('Failed to refresh PandaDoc token:', refreshError);
            return NextResponse.json(
              { error: 'Token refresh failed. Please reconnect PandaDoc.' },
              { status: 401 }
            );
          }
        }

        return NextResponse.json(
          { error: 'Unauthorized. Please reconnect PandaDoc.' },
          { status: 401 }
        );
      }

      throw error;
    }
  } catch (error) {
    console.error('Failed to list PandaDoc templates:', error);

    if (error instanceof PandaDocError) {
      return NextResponse.json(
        { error: error.message, details: error.errors },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Failed to list templates' },
      { status: 500 }
    );
  }
}
