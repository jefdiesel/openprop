import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { integrations } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

interface PandaDocDocument {
  id: string;
  name: string;
  status: string;
  date_created: string;
  date_modified: string;
  expiration_date?: string;
  version: string;
}

interface PandaDocDocumentsResponse {
  results: PandaDocDocument[];
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

    // Get pagination and filter params
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const count = parseInt(searchParams.get('count') || '50', 10);
    const status = searchParams.get('status'); // e.g., 'document.completed'

    // Fetch documents from PandaDoc
    const documentsUrl = new URL('https://api.pandadoc.com/public/v1/documents');
    documentsUrl.searchParams.set('page', String(page));
    documentsUrl.searchParams.set('count', String(count));
    if (status) {
      documentsUrl.searchParams.set('status', status);
    }

    const response = await fetch(documentsUrl.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch PandaDoc documents:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch documents' },
        { status: response.status }
      );
    }

    const data: PandaDocDocumentsResponse = await response.json();

    return NextResponse.json({
      documents: data.results.map((doc) => ({
        id: doc.id,
        name: doc.name,
        type: 'document',
        status: doc.status,
        dateCreated: doc.date_created,
        dateModified: doc.date_modified,
        expirationDate: doc.expiration_date,
        version: doc.version,
      })),
      page: data.page || page,
      count: data.count || data.results.length,
    });
  } catch (error) {
    console.error('Failed to fetch PandaDoc documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}
