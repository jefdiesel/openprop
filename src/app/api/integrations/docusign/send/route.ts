import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { integrations, documents } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { DocuSignClient, DocuSignError } from '@/lib/docusign/client';
import type { DocuSignCreateEnvelopeRequest } from '@/lib/docusign/types';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get user's DocuSign integration
    const integration = await db.query.integrations.findFirst({
      where: and(
        eq(integrations.userId, userId),
        eq(integrations.provider, 'docusign')
      ),
    });

    if (!integration || !integration.accessToken || !integration.accountId) {
      return NextResponse.json(
        { error: 'DocuSign not connected' },
        { status: 400 }
      );
    }

    const metadata = integration.metadata as any;
    const baseUri = metadata?.baseUri;

    if (!baseUri) {
      return NextResponse.json(
        { error: 'DocuSign integration not properly configured' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      documentId,
      templateId,
      emailSubject,
      emailBlurb,
      recipients,
      status = 'sent',
    } = body as {
      documentId?: string;
      templateId?: string;
      emailSubject: string;
      emailBlurb?: string;
      recipients: Array<{
        email: string;
        name: string;
        roleName?: string;
      }>;
      status?: 'sent' | 'created';
    };

    // Validate required fields
    if (!emailSubject) {
      return NextResponse.json(
        { error: 'Email subject is required' },
        { status: 400 }
      );
    }

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { error: 'At least one recipient is required' },
        { status: 400 }
      );
    }

    // Validate that either documentId or templateId is provided
    if (!documentId && !templateId) {
      return NextResponse.json(
        { error: 'Either documentId or templateId must be provided' },
        { status: 400 }
      );
    }

    // Create DocuSign client
    const client = new DocuSignClient({
      accessToken: integration.accessToken,
      refreshToken: integration.refreshToken || undefined,
      tokenExpiresAt: integration.tokenExpiresAt || undefined,
      accountId: integration.accountId,
      baseUri,
      oauthConfig: process.env.DOCUSIGN_CLIENT_ID && process.env.DOCUSIGN_CLIENT_SECRET ? {
        clientId: process.env.DOCUSIGN_CLIENT_ID,
        clientSecret: process.env.DOCUSIGN_CLIENT_SECRET,
        redirectUri: process.env.DOCUSIGN_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/integrations/docusign/callback`,
      } : undefined,
      onTokenRefresh: async (tokens) => {
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
      },
    });

    // Build envelope request
    const envelopeRequest: DocuSignCreateEnvelopeRequest = {
      emailSubject,
      emailBlurb,
      status,
    };

    // If using a template
    if (templateId) {
      envelopeRequest.templateId = templateId;
      envelopeRequest.templateRoles = recipients.map((recipient, index) => ({
        email: recipient.email,
        name: recipient.name,
        roleName: recipient.roleName || `Signer ${index + 1}`,
      }));
    } else if (documentId) {
      // If using a document from our system
      // First, fetch the document from our database
      const doc = await db.query.documents.findFirst({
        where: and(
          eq(documents.id, documentId),
          eq(documents.userId, userId)
        ),
      });

      if (!doc) {
        return NextResponse.json(
          { error: 'Document not found' },
          { status: 404 }
        );
      }

      // For now, we'll need to implement document PDF generation
      // This is a placeholder - you'll need to implement actual PDF generation
      // from your document blocks
      return NextResponse.json(
        { error: 'Document-based sending not yet implemented. Please use a DocuSign template.' },
        { status: 501 }
      );
    }

    try {
      // Create and send the envelope
      const envelope = await client.createEnvelope(envelopeRequest);

      return NextResponse.json({
        success: true,
        envelopeId: envelope.envelopeId,
        status: envelope.status,
        uri: envelope.uri,
      });
    } catch (error) {
      if (error instanceof DocuSignError) {
        return NextResponse.json(
          { error: error.message },
          { status: error.statusCode }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Failed to send DocuSign envelope:', error);
    return NextResponse.json(
      { error: 'Failed to send envelope' },
      { status: 500 }
    );
  }
}
