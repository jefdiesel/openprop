import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { integrations } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const integration = await db.query.integrations.findFirst({
      where: and(
        eq(integrations.userId, session.user.id),
        eq(integrations.provider, 'quickbooks')
      ),
    });

    if (!integration) {
      return NextResponse.json({
        connected: false,
        companyName: null,
        realmId: null,
        connectedAt: null,
        lastSync: null,
        autoCreateInvoice: true,
      });
    }

    // Check if token is expired
    const isTokenExpired = integration.tokenExpiresAt
      ? new Date(integration.tokenExpiresAt) < new Date()
      : false;

    const metadata = integration.metadata as Record<string, unknown> || {};

    return NextResponse.json({
      connected: !isTokenExpired,
      companyName: metadata.companyName,
      realmId: metadata.realmId || integration.accountId,
      environment: metadata.environment || 'production',
      connectedAt: metadata.connectedAt || integration.createdAt.toISOString(),
      lastSync: integration.updatedAt.toISOString(),
      tokenExpired: isTokenExpired,
      autoCreateInvoice: metadata.autoCreateInvoice ?? true,
    });
  } catch (error) {
    console.error('Failed to get QuickBooks status:', error);
    return NextResponse.json(
      { error: 'Failed to get status' },
      { status: 500 }
    );
  }
}
