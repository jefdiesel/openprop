import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { generateAuthUrl, DEFAULT_BACKUP_SCOPES } from '@/lib/google-drive';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_DRIVE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
const GOOGLE_REDIRECT_URI =
  process.env.GOOGLE_DRIVE_REDIRECT_URI ||
  `${process.env.NEXTAUTH_URL}/api/integrations/google-drive/callback`;

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!GOOGLE_CLIENT_ID) {
      return NextResponse.json(
        { error: 'Google Drive integration not configured' },
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

    // Build Google OAuth authorization URL
    const authUrl = generateAuthUrl(
      {
        clientId: GOOGLE_CLIENT_ID,
        clientSecret: '', // Not needed for URL generation
        redirectUri: GOOGLE_REDIRECT_URI,
      },
      DEFAULT_BACKUP_SCOPES,
      state
    );

    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error('Failed to initiate Google Drive connection:', error);
    return NextResponse.json(
      { error: 'Failed to initiate connection' },
      { status: 500 }
    );
  }
}
