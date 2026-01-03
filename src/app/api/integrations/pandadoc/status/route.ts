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
        eq(integrations.provider, 'pandadoc')
      ),
    });

    if (!integration) {
      return NextResponse.json({
        connected: false,
        accountEmail: null,
        connectedAt: null,
        lastSync: null,
      });
    }

    // Check if token is expired
    const isTokenExpired = integration.tokenExpiresAt
      ? new Date(integration.tokenExpiresAt) < new Date()
      : false;

    return NextResponse.json({
      connected: !isTokenExpired,
      accountEmail: integration.accountEmail,
      accountId: integration.accountId,
      connectedAt: (integration.metadata as Record<string, unknown>)?.connectedAt || integration.createdAt.toISOString(),
      lastSync: integration.updatedAt.toISOString(),
      tokenExpired: isTokenExpired,
    });
  } catch (error) {
    console.error('Failed to get PandaDoc status:', error);
    return NextResponse.json(
      { error: 'Failed to get status' },
      { status: 500 }
    );
  }
}
