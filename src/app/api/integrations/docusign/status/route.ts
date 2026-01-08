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

    // Get user's DocuSign integration
    const integration = await db.query.integrations.findFirst({
      where: and(
        eq(integrations.userId, session.user.id),
        eq(integrations.provider, 'docusign')
      ),
    });

    if (!integration) {
      return NextResponse.json({
        connected: false,
      });
    }

    // Check if token is expired
    const isExpired = integration.tokenExpiresAt
      ? new Date(integration.tokenExpiresAt) < new Date()
      : false;

    return NextResponse.json({
      connected: true,
      accountEmail: integration.accountEmail,
      accountId: integration.accountId,
      accountName: (integration.metadata as any)?.accountName,
      userName: (integration.metadata as any)?.userName,
      connectedAt: (integration.metadata as any)?.connectedAt,
      tokenExpired: isExpired,
    });
  } catch (error) {
    console.error('Failed to get DocuSign status:', error);
    return NextResponse.json(
      { error: 'Failed to get integration status' },
      { status: 500 }
    );
  }
}
