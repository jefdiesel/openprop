import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { integrations } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { createDropboxClient } from '@/lib/dropbox';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const path = searchParams.get('path') || '';

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

    // List folder contents
    const result = await client.listFolder(path);

    // Format response
    const folders = result.entries
      .filter(entry => entry['.tag'] === 'folder')
      .map(entry => ({
        id: entry.id,
        name: entry.name,
        path: entry.path_display,
        type: 'folder',
      }));

    const files = result.entries
      .filter(entry => entry['.tag'] === 'file')
      .map(entry => {
        const fileEntry = entry as { name: string; path_display: string; id: string; size: number; server_modified: string };
        return {
          id: fileEntry.id,
          name: fileEntry.name,
          path: fileEntry.path_display,
          size: fileEntry.size,
          modified: fileEntry.server_modified,
          type: 'file',
        };
      });

    return NextResponse.json({
      path,
      folders,
      files,
      hasMore: result.has_more,
    });
  } catch (error) {
    console.error('Failed to list Dropbox files:', error);
    return NextResponse.json(
      { error: 'Failed to list files' },
      { status: 500 }
    );
  }
}
