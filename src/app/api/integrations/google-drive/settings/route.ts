import { NextRequest, NextResponse } from 'next/server';
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
      return NextResponse.json(
        { error: 'Google Drive not connected' },
        { status: 404 }
      );
    }

    const metadata = (integration.metadata as GoogleDriveIntegrationMetadata) || {};

    return NextResponse.json({
      folderId: metadata.folderId,
      folderName: metadata.folderName,
      autoBackup: metadata.autoBackup ?? false,
      subfolderPattern: metadata.subfolderPattern ?? 'none',
    });
  } catch (error) {
    console.error('Failed to get Google Drive settings:', error);
    return NextResponse.json(
      { error: 'Failed to get settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
      return NextResponse.json(
        { error: 'Google Drive not connected' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { folderId, folderName, autoBackup, subfolderPattern } = body;

    const currentMetadata = (integration.metadata as GoogleDriveIntegrationMetadata) || {};

    const updatedMetadata: GoogleDriveIntegrationMetadata = {
      ...currentMetadata,
    };

    if (folderId !== undefined) {
      updatedMetadata.folderId = folderId;
    }
    if (folderName !== undefined) {
      updatedMetadata.folderName = folderName;
    }
    if (autoBackup !== undefined) {
      updatedMetadata.autoBackup = autoBackup;
    }
    if (subfolderPattern !== undefined) {
      updatedMetadata.subfolderPattern = subfolderPattern;
    }

    await db
      .update(integrations)
      .set({
        metadata: updatedMetadata as Record<string, unknown>,
        updatedAt: new Date(),
      })
      .where(eq(integrations.id, integration.id));

    return NextResponse.json({
      success: true,
      settings: updatedMetadata,
    });
  } catch (error) {
    console.error('Failed to update Google Drive settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
