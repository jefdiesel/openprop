import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

const DROPBOX_CLIENT_ID = process.env.DROPBOX_CLIENT_ID;
const DROPBOX_REDIRECT_URI = process.env.DROPBOX_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/integrations/dropbox/callback`;

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!DROPBOX_CLIENT_ID) {
      return NextResponse.json(
        { error: 'Dropbox integration not configured' },
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

    // Build Dropbox OAuth authorization URL
    const authUrl = new URL('https://www.dropbox.com/oauth2/authorize');
    authUrl.searchParams.set('client_id', DROPBOX_CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', DROPBOX_REDIRECT_URI);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('token_access_type', 'offline'); // Request refresh token
    authUrl.searchParams.set('scope', 'files.content.read files.content.write');
    authUrl.searchParams.set('state', state);

    return NextResponse.json({ authUrl: authUrl.toString() });
  } catch (error) {
    console.error('Failed to initiate Dropbox connection:', error);
    return NextResponse.json(
      { error: 'Failed to initiate connection' },
      { status: 500 }
    );
  }
}
