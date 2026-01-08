import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

const DOCUSIGN_CLIENT_ID = process.env.DOCUSIGN_CLIENT_ID;
const DOCUSIGN_REDIRECT_URI = process.env.DOCUSIGN_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/integrations/docusign/callback`;
const DOCUSIGN_ENV = process.env.DOCUSIGN_ENV || 'demo';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!DOCUSIGN_CLIENT_ID) {
      return NextResponse.json(
        { error: 'DocuSign integration not configured' },
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

    // Build DocuSign OAuth authorization URL
    const authBaseUrl = DOCUSIGN_ENV === 'production'
      ? 'https://account.docusign.com'
      : 'https://account-d.docusign.com';

    const authUrl = new URL(`${authBaseUrl}/oauth/auth`);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'signature extended');
    authUrl.searchParams.set('client_id', DOCUSIGN_CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', DOCUSIGN_REDIRECT_URI);
    authUrl.searchParams.set('state', state);

    return NextResponse.json({ authUrl: authUrl.toString() });
  } catch (error) {
    console.error('Failed to initiate DocuSign connection:', error);
    return NextResponse.json(
      { error: 'Failed to initiate connection' },
      { status: 500 }
    );
  }
}
