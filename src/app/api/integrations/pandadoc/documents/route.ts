import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { integrations } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { PandaDocClient } from '@/lib/pandadoc/client';

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's PandaDoc integration
    const integration = await db.query.integrations.findFirst({
      where: and(
        eq(integrations.userId, session.user.id),
        eq(integrations.provider, 'pandadoc')
      ),
    });

    if (!integration) {
      return NextResponse.json(
        { error: 'PandaDoc integration not found' },
        { status: 404 }
      );
    }

    if (!integration.accessToken) {
      return NextResponse.json(
        { error: 'PandaDoc access token not found' },
        { status: 400 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const count = parseInt(searchParams.get('count') || '50', 10);
    const status = searchParams.get('status') || undefined;

    // Validate pagination parameters
    if (page < 1) {
      return NextResponse.json(
        { error: 'Page must be greater than 0' },
        { status: 400 }
      );
    }

    if (count < 1 || count > 100) {
      return NextResponse.json(
        { error: 'Count must be between 1 and 100' },
        { status: 400 }
      );
    }

    // Create PandaDoc client
    const client = new PandaDocClient({
      accessToken: integration.accessToken,
    });

    // Fetch documents from PandaDoc
    const response = await client.listDocuments(
      page,
      count,
      status as any // Type assertion for status parameter
    );

    // Return documents and pagination info
    return NextResponse.json({
      documents: response.results,
      pagination: {
        total: response.count,
        page,
        count: response.results.length,
      },
    });
  } catch (error) {
    console.error('Failed to list PandaDoc documents:', error);

    // Handle specific error types
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to list documents' },
      { status: 500 }
    );
  }
}
