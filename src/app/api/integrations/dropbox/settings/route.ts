import { NextRequest, NextResponse } from 'next/server';
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
      return NextResponse.json(
        { error: 'Dropbox not connected' },
        { status: 404 }
      );
    }

    const metadata = integration.metadata as Record<string, unknown> | null;

    return NextResponse.json({
      path: metadata?.path || '/OpenProposal',
      autoBackup: metadata?.autoBackup || false,
      subfolderPattern: metadata?.subfolderPattern || 'monthly',
    });
  } catch (error) {
    console.error('Failed to get Dropbox settings:', error);
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
      return NextResponse.json(
        { error: 'Dropbox not connected' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { path, autoBackup, subfolderPattern } = body;

    // Validate inputs
    if (path !== undefined && typeof path !== 'string') {
      return NextResponse.json(
        { error: 'Invalid path' },
        { status: 400 }
      );
    }

    if (autoBackup !== undefined && typeof autoBackup !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid autoBackup value' },
        { status: 400 }
      );
    }

    if (subfolderPattern !== undefined && !['none', 'monthly', 'yearly'].includes(subfolderPattern)) {
      return NextResponse.json(
        { error: 'Invalid subfolderPattern. Must be: none, monthly, or yearly' },
        { status: 400 }
      );
    }

    // Get current metadata
    const currentMetadata = integration.metadata as Record<string, unknown> | null || {};

    // Update metadata
    const updatedMetadata = {
      ...currentMetadata,
      ...(path !== undefined && { path }),
      ...(autoBackup !== undefined && { autoBackup }),
      ...(subfolderPattern !== undefined && { subfolderPattern }),
    };

    // Update integration
    await db
      .update(integrations)
      .set({
        metadata: updatedMetadata,
        updatedAt: new Date(),
      })
      .where(eq(integrations.id, integration.id));

    return NextResponse.json({
      success: true,
      path: updatedMetadata.path,
      autoBackup: updatedMetadata.autoBackup,
      subfolderPattern: updatedMetadata.subfolderPattern,
    });
  } catch (error) {
    console.error('Failed to update Dropbox settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
