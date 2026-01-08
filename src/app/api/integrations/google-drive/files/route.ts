import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { integrations } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { createGoogleDriveClient } from '@/lib/google-drive';

export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;
    const folderId = searchParams.get('folderId');
    const pageToken = searchParams.get('pageToken');

    // List files in folder or root
    const query = folderId
      ? `'${folderId}' in parents and trashed = false`
      : "trashed = false and 'root' in parents";

    const response = await client.listFiles({
      q: query,
      pageSize: 100,
      pageToken: pageToken || undefined,
      orderBy: 'folder,name',
    });

    return NextResponse.json({
      files: response.files,
      nextPageToken: response.nextPageToken,
    });
  } catch (error) {
    console.error('Failed to list Google Drive files:', error);
    return NextResponse.json(
      { error: 'Failed to list files' },
      { status: 500 }
    );
  }
}
