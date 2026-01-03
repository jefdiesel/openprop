import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { integrations } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

interface PandaDocTemplate {
  id: string;
  name: string;
  date_created: string;
  date_modified: string;
  version: string;
}

interface PandaDocTemplatesResponse {
  results: PandaDocTemplate[];
  page?: number;
  count?: number;
}

async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
} | null> {
  try {
    const response = await fetch('https://api.pandadoc.com/oauth2/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: process.env.PANDADOC_CLIENT_ID!,
        client_secret: process.env.PANDADOC_CLIENT_SECRET!,
      }),
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get integration
    const integration = await db.query.integrations.findFirst({
      where: and(
        eq(integrations.userId, session.user.id),
        eq(integrations.provider, 'pandadoc')
      ),
    });

    if (!integration || !integration.accessToken) {
      return NextResponse.json(
        { error: 'PandaDoc not connected' },
        { status: 400 }
      );
    }

    let accessToken = integration.accessToken;

    // Check if token is expired and refresh if needed
    if (integration.tokenExpiresAt && new Date(integration.tokenExpiresAt) < new Date()) {
      if (!integration.refreshToken) {
        return NextResponse.json(
          { error: 'Token expired and no refresh token available' },
          { status: 401 }
        );
      }

      const newTokens = await refreshAccessToken(integration.refreshToken);
      if (!newTokens) {
        return NextResponse.json(
          { error: 'Failed to refresh token' },
          { status: 401 }
        );
      }

      // Update tokens in database
      await db
        .update(integrations)
        .set({
          accessToken: newTokens.access_token,
          refreshToken: newTokens.refresh_token,
          tokenExpiresAt: new Date(Date.now() + newTokens.expires_in * 1000),
          updatedAt: new Date(),
        })
        .where(eq(integrations.id, integration.id));

      accessToken = newTokens.access_token;
    }

    // Get pagination params
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const count = parseInt(searchParams.get('count') || '50', 10);

    // Fetch templates from PandaDoc
    const templatesUrl = new URL('https://api.pandadoc.com/public/v1/templates');
    templatesUrl.searchParams.set('page', String(page));
    templatesUrl.searchParams.set('count', String(count));

    const response = await fetch(templatesUrl.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch PandaDoc templates:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch templates' },
        { status: response.status }
      );
    }

    const data: PandaDocTemplatesResponse = await response.json();

    return NextResponse.json({
      templates: data.results.map((template) => ({
        id: template.id,
        name: template.name,
        type: 'template',
        dateCreated: template.date_created,
        dateModified: template.date_modified,
        version: template.version,
      })),
      page: data.page || page,
      count: data.count || data.results.length,
    });
  } catch (error) {
    console.error('Failed to fetch PandaDoc templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}
