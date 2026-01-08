import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { integrations } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { createDropboxClient } from '@/lib/dropbox';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get integration
    const integration = await db.query.integrations.findFirst({
      where: and(
        eq(integrations.userId, session.user.id),
        eq(integrations.provider, 'dropbox')
      ),
    });

    if (!integration || !integration.accessToken) {
      return NextResponse.json(
        { error: 'Dropbox not connected' },
        { status: 404 }
      );
    }

    // Parse request body
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const path = formData.get('path') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!path) {
      return NextResponse.json(
        { error: 'No path provided' },
        { status: 400 }
      );
    }

    // Create Dropbox client
    const client = createDropboxClient(
      {
        accessToken: integration.accessToken,
        refreshToken: integration.refreshToken || undefined,
        expiresAt: integration.tokenExpiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        scope: integration.scope || '',
        accountId: integration.accountId || '',
        uid: (integration.metadata as Record<string, unknown>)?.uid as string || '',
      },
      async (newTokens) => {
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
      }
    );

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Ensure destination folder exists
    const folderPath = path.substring(0, path.lastIndexOf('/'));
    if (folderPath && folderPath !== '') {
      try {
        await client.ensureFolderExists(folderPath);
      } catch (error) {
        console.error('Failed to create folder:', error);
        // Continue anyway - upload might still work if folder exists
      }
    }

    // Upload file
    const result = await client.uploadFile(
      path,
      buffer,
      { '.tag': 'overwrite' } // Overwrite if exists
    );

    return NextResponse.json({
      success: true,
      file: {
        id: result.id,
        name: result.name,
        path: result.path_display,
        size: result.size,
        modified: result.server_modified,
      },
    });
  } catch (error) {
    console.error('Failed to upload file to Dropbox:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
