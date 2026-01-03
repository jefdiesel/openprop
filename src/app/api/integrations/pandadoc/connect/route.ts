import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

const PANDADOC_CLIENT_ID = process.env.PANDADOC_CLIENT_ID;
const PANDADOC_REDIRECT_URI = process.env.PANDADOC_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/integrations/pandadoc/callback`;

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!PANDADOC_CLIENT_ID) {
      return NextResponse.json(
        { error: 'PandaDoc integration not configured' },
        { status: 500 }
      );
    }

    // Generate state parameter for CSRF protection
    const state = Buffer.from(
      JSON.stringify({
        userId: session.user.id,
        timestamp: Date.now(),
        nonce: crypto.randomUUID(),
      })
    ).toString('base64');

    // Build PandaDoc OAuth authorization URL
    const authUrl = new URL('https://app.pandadoc.com/oauth2/authorize');
    authUrl.searchParams.set('client_id', PANDADOC_CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', PANDADOC_REDIRECT_URI);
    authUrl.searchParams.set('scope', 'read+write');
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('state', state);

    return NextResponse.json({ authUrl: authUrl.toString() });
  } catch (error) {
    console.error('Failed to initiate PandaDoc connection:', error);
    return NextResponse.json(
      { error: 'Failed to initiate connection' },
      { status: 500 }
    );
  }
}
