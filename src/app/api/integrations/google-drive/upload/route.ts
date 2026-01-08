import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { integrations } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { createGoogleDriveClient } from '@/lib/google-drive';
import type { GoogleDriveIntegrationMetadata } from '@/lib/google-drive';

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

    if (!integration || !integration.accessToken || !integration.refreshToken) {
      return NextResponse.json(
        { error: 'Google Drive not connected' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { fileName, content, mimeType, folderId } = body;

    if (!fileName || !content || !mimeType) {
      return NextResponse.json(
        { error: 'Missing required fields: fileName, content, mimeType' },
        { status: 400 }
      );
    }

    // Create Drive client
    const client = createGoogleDriveClient(
      {
        accessToken: integration.accessToken,
        refreshToken: integration.refreshToken,
        expiresAt: integration.tokenExpiresAt || new Date(),
        scope: integration.scope || '',
      },
      async (tokens) => {
        // Update tokens in database
        await db
          .update(integrations)
          .set({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            tokenExpiresAt: tokens.expiresAt,
            updatedAt: new Date(),
          })
          .where(eq(integrations.id, integration.id));
      }
    );

    // Determine target folder
    let targetFolderId = folderId;

    // If no folderId provided, use the configured backup folder
    if (!targetFolderId) {
      const metadata = (integration.metadata as GoogleDriveIntegrationMetadata) || {};
      targetFolderId = metadata.folderId;

      // If auto-backup is enabled with subfolder pattern, create subfolder
      if (metadata.autoBackup && metadata.subfolderPattern && metadata.subfolderPattern !== 'none') {
        const now = new Date();
        let subfolderName = '';

        if (metadata.subfolderPattern === 'monthly') {
          subfolderName = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
        } else if (metadata.subfolderPattern === 'yearly') {
          subfolderName = now.getFullYear().toString();
        }

        if (subfolderName && targetFolderId) {
          // Find or create subfolder
          const subfolder = await client.findOrCreateFolder(subfolderName, targetFolderId);
          targetFolderId = subfolder.id;
        }
      }
    }

    // Decode base64 content
    const contentBuffer = Buffer.from(content, 'base64');

    // Upload file to Drive
    const uploadedFile = await client.uploadFile({
      name: fileName,
      content: contentBuffer,
      mimeType,
      parents: targetFolderId ? [targetFolderId] : undefined,
    });

    return NextResponse.json({
      success: true,
      file: {
        id: uploadedFile.id,
        name: uploadedFile.name,
        webViewLink: uploadedFile.webViewLink,
        mimeType: uploadedFile.mimeType,
      },
    });
  } catch (error) {
    console.error('Failed to upload file to Google Drive:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
