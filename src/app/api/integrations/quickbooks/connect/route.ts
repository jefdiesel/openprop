import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { generateAuthUrl, DEFAULT_ACCOUNTING_SCOPES } from '@/lib/quickbooks';

const QUICKBOOKS_CLIENT_ID = process.env.QUICKBOOKS_CLIENT_ID;
const QUICKBOOKS_CLIENT_SECRET = process.env.QUICKBOOKS_CLIENT_SECRET;
const QUICKBOOKS_REDIRECT_URI = process.env.QUICKBOOKS_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/integrations/quickbooks/callback`;
const QUICKBOOKS_ENVIRONMENT = (process.env.QUICKBOOKS_ENVIRONMENT || 'production') as 'sandbox' | 'production';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!QUICKBOOKS_CLIENT_ID || !QUICKBOOKS_CLIENT_SECRET) {
      return NextResponse.json(
        { error: 'QuickBooks integration not configured' },
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

    // Generate QuickBooks OAuth authorization URL
    const authUrl = generateAuthUrl(
      {
        clientId: QUICKBOOKS_CLIENT_ID,
        clientSecret: QUICKBOOKS_CLIENT_SECRET,
        redirectUri: QUICKBOOKS_REDIRECT_URI,
        environment: QUICKBOOKS_ENVIRONMENT,
      },
      DEFAULT_ACCOUNTING_SCOPES,
      state
    );

    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error('Failed to initiate QuickBooks connection:', error);
    return NextResponse.json(
      { error: 'Failed to initiate connection' },
      { status: 500 }
    );
  }
}
