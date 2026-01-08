import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { integrations } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import type { GoogleDriveIntegrationMetadata } from '@/lib/google-drive';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const integration = await db.query.integrations.findFirst({
      where: and(
        eq(integrations.userId, session.user.id),
        eq(integrations.provider, 'google_drive')
      ),
    });

    if (!integration) {
      return NextResponse.json({
        connected: false,
        accountEmail: null,
        connectedAt: null,
        lastSync: null,
        settings: null,
      });
    }

    // Check if token is expired
    const isTokenExpired = integration.tokenExpiresAt
      ? new Date(integration.tokenExpiresAt) < new Date()
      : false;

    const metadata = (integration.metadata as GoogleDriveIntegrationMetadata) || {};

    return NextResponse.json({
      connected: !isTokenExpired,
      accountEmail: integration.accountEmail,
      connectedAt: metadata.connectedAt || integration.createdAt.toISOString(),
      lastSync: integration.updatedAt.toISOString(),
      tokenExpired: isTokenExpired,
      settings: {
        folderId: metadata.folderId,
        folderName: metadata.folderName,
        autoBackup: metadata.autoBackup ?? false,
        subfolderPattern: metadata.subfolderPattern ?? 'none',
      },
    });
  } catch (error) {
    console.error('Failed to get Google Drive status:', error);
    return NextResponse.json({ error: 'Failed to get status' }, { status: 500 });
  }
}
