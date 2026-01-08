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
        eq(integrations.provider, 'dropbox')
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

    const metadata = integration.metadata as Record<string, unknown> | null;

    return NextResponse.json({
      connected: !isTokenExpired,
      accountEmail: integration.accountEmail,
      accountId: integration.accountId,
      connectedAt: metadata?.connectedAt || integration.createdAt.toISOString(),
      lastSync: integration.updatedAt.toISOString(),
      tokenExpired: isTokenExpired,
      path: metadata?.path || '/OpenProposal',
      autoBackup: metadata?.autoBackup || false,
      subfolderPattern: metadata?.subfolderPattern || 'monthly',
    });
  } catch (error) {
    console.error('Failed to get Dropbox status:', error);
    return NextResponse.json(
      { error: 'Failed to get status' },
      { status: 500 }
    );
  }
}
