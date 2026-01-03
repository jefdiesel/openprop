import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { integrations } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { createHubSpotClient, HubSpotError, type HubSpotTokens } from '@/lib/hubspot';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
    const after = searchParams.get('after') || undefined;
    const search = searchParams.get('search') || undefined;

    // Find the integration
    const integration = await db.query.integrations.findFirst({
      where: and(
        eq(integrations.userId, session.user.id),
        eq(integrations.provider, 'hubspot')
      ),
    });

    if (!integration || !integration.accessToken) {
      return NextResponse.json(
        { error: 'HubSpot not connected' },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (integration.tokenExpiresAt && new Date(integration.tokenExpiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'Token expired. Please reconnect HubSpot.' },
        { status: 401 }
      );
    }

    // Create HubSpot client with token refresh callback
    const tokens: HubSpotTokens = {
      accessToken: integration.accessToken,
      refreshToken: integration.refreshToken || '',
      expiresAt: integration.tokenExpiresAt || new Date(),
    };

    const client = createHubSpotClient(tokens, async (newTokens) => {
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
    });

    let response;

    if (search) {
      // Search contacts by email or name
      response = await client.searchContacts({
        filterGroups: [
          {
            filters: [
              {
                propertyName: 'email',
                operator: 'CONTAINS_TOKEN',
                value: search,
              },
            ],
          },
          {
            filters: [
              {
                propertyName: 'firstname',
                operator: 'CONTAINS_TOKEN',
                value: search,
              },
            ],
          },
          {
            filters: [
              {
                propertyName: 'lastname',
                operator: 'CONTAINS_TOKEN',
                value: search,
              },
            ],
          },
        ],
        limit,
        after,
      });
    } else {
      // List all contacts
      response = await client.listContacts(limit, after);
    }

    // Transform contacts for the recipient picker
    const contacts = response.results.map((contact) => ({
      id: contact.id,
      email: contact.properties.email || '',
      name: [contact.properties.firstname, contact.properties.lastname]
        .filter(Boolean)
        .join(' ') || contact.properties.email || '',
      company: contact.properties.company || '',
      phone: contact.properties.phone || '',
      source: 'hubspot' as const,
    }));

    return NextResponse.json({
      contacts,
      paging: response.paging,
      total: response.results.length,
    });
  } catch (error) {
    console.error('Failed to fetch HubSpot contacts:', error);

    if (error instanceof HubSpotError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}
