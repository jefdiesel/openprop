import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { integrations } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import type { HubSpotSyncSettings } from '@/lib/hubspot';

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
        eq(integrations.provider, 'hubspot')
      ),
    });

    if (!integration) {
      return NextResponse.json({
        connected: false,
        accountEmail: null,
        accountId: null,
        hubDomain: null,
        connectedAt: null,
        lastSync: null,
        syncSettings: null,
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
      hubDomain: metadata?.hubDomain || null,
      connectedAt: metadata?.connectedAt || integration.createdAt.toISOString(),
      lastSync: integration.updatedAt.toISOString(),
      tokenExpired: isTokenExpired,
      syncSettings: (metadata?.syncSettings as HubSpotSyncSettings) || null,
    });
  } catch (error) {
    console.error('Failed to get HubSpot status:', error);
    return NextResponse.json(
      { error: 'Failed to get status' },
      { status: 500 }
    );
  }
}

// Update sync settings
export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { syncSettings } = body as { syncSettings: Partial<HubSpotSyncSettings> };

    const integration = await db.query.integrations.findFirst({
      where: and(
        eq(integrations.userId, session.user.id),
        eq(integrations.provider, 'hubspot')
      ),
    });

    if (!integration) {
      return NextResponse.json(
        { error: 'Integration not found' },
        { status: 404 }
      );
    }

    const currentMetadata = integration.metadata as Record<string, unknown> | null;
    const currentSyncSettings = (currentMetadata?.syncSettings as HubSpotSyncSettings) || {};

    // Merge new settings with existing
    const updatedSyncSettings: HubSpotSyncSettings = {
      enabled: syncSettings.enabled ?? currentSyncSettings.enabled ?? true,
      syncOnDocumentSent: syncSettings.syncOnDocumentSent ?? currentSyncSettings.syncOnDocumentSent ?? true,
      syncOnDocumentViewed: syncSettings.syncOnDocumentViewed ?? currentSyncSettings.syncOnDocumentViewed ?? false,
      syncOnDocumentSigned: syncSettings.syncOnDocumentSigned ?? currentSyncSettings.syncOnDocumentSigned ?? true,
      syncOnDocumentCompleted: syncSettings.syncOnDocumentCompleted ?? currentSyncSettings.syncOnDocumentCompleted ?? true,
      createDealsOnCompletion: syncSettings.createDealsOnCompletion ?? currentSyncSettings.createDealsOnCompletion ?? false,
      createTasksOnCompletion: syncSettings.createTasksOnCompletion ?? currentSyncSettings.createTasksOnCompletion ?? false,
      defaultPipeline: syncSettings.defaultPipeline ?? currentSyncSettings.defaultPipeline,
      defaultDealStage: syncSettings.defaultDealStage ?? currentSyncSettings.defaultDealStage,
    };

    await db
      .update(integrations)
      .set({
        metadata: {
          ...currentMetadata,
          syncSettings: updatedSyncSettings,
        },
        updatedAt: new Date(),
      })
      .where(eq(integrations.id, integration.id));

    return NextResponse.json({
      success: true,
      syncSettings: updatedSyncSettings,
    });
  } catch (error) {
    console.error('Failed to update HubSpot sync settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
