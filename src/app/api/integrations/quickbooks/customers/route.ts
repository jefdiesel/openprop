import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { integrations } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { createQuickBooksClient } from '@/lib/quickbooks';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the integration
    const integration = await db.query.integrations.findFirst({
      where: and(
        eq(integrations.userId, session.user.id),
        eq(integrations.provider, 'quickbooks')
      ),
    });

    if (!integration || !integration.accessToken) {
      return NextResponse.json(
        { error: 'QuickBooks not connected' },
        { status: 404 }
      );
    }

    const metadata = integration.metadata as Record<string, unknown> || {};
    const realmId = (metadata.realmId as string) || integration.accountId;

    if (!realmId) {
      return NextResponse.json(
        { error: 'QuickBooks realm ID not found' },
        { status: 400 }
      );
    }

    // Create QuickBooks client
    const client = createQuickBooksClient(
      {
        accessToken: integration.accessToken,
        refreshToken: integration.refreshToken || '',
        expiresAt: integration.tokenExpiresAt || new Date(),
        refreshTokenExpiresAt: new Date(metadata.refreshTokenExpiresAt as string || Date.now() + 100 * 24 * 60 * 60 * 1000),
        realmId,
      },
      async (newTokens) => {
        // Update tokens in database
        await db
          .update(integrations)
          .set({
            accessToken: newTokens.accessToken,
            refreshToken: newTokens.refreshToken,
            tokenExpiresAt: newTokens.expiresAt,
            metadata: {
              ...metadata,
              refreshTokenExpiresAt: newTokens.refreshTokenExpiresAt.toISOString(),
            },
            updatedAt: new Date(),
          })
          .where(eq(integrations.id, integration.id));
      },
      metadata.environment as 'sandbox' | 'production' || 'production'
    );

    // Get search query from URL params
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');

    // List customers (optionally filtered by search)
    let query = "SELECT * FROM Customer WHERE Active = true";
    if (search) {
      query += ` AND DisplayName LIKE '%${search}%'`;
    }
    query += " ORDERBY DisplayName";

    const customers = await client.listCustomers(query, { maxResults: 100 });

    // Return customer list formatted for UI
    return NextResponse.json({
      customers: customers.map(customer => ({
        id: customer.Id,
        name: customer.DisplayName,
        email: customer.PrimaryEmailAddr?.Address,
        company: customer.CompanyName,
        balance: customer.Balance,
      })),
    });
  } catch (error) {
    console.error('Failed to list QuickBooks customers:', error);
    return NextResponse.json(
      { error: 'Failed to list customers' },
      { status: 500 }
    );
  }
}
