import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { generateAuthUrl, DEFAULT_CRM_SCOPES } from '@/lib/hubspot';

const HUBSPOT_CLIENT_ID = process.env.HUBSPOT_CLIENT_ID;
const HUBSPOT_REDIRECT_URI = process.env.HUBSPOT_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/integrations/hubspot/callback`;

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!HUBSPOT_CLIENT_ID) {
      return NextResponse.json(
        { error: 'HubSpot integration not configured' },
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

    // Build HubSpot OAuth authorization URL
    const authUrl = generateAuthUrl(
      {
        clientId: HUBSPOT_CLIENT_ID,
        clientSecret: process.env.HUBSPOT_CLIENT_SECRET || '',
        redirectUri: HUBSPOT_REDIRECT_URI,
      },
      DEFAULT_CRM_SCOPES,
      state
    );

    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error('Failed to initiate HubSpot connection:', error);
    return NextResponse.json(
      { error: 'Failed to initiate connection' },
      { status: 500 }
    );
  }
}
