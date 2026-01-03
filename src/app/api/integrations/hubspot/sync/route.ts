import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { integrations, documents, recipients } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import {
  createHubSpotClient,
  HubSpotError,
  type HubSpotTokens,
  type HubSpotSyncSettings,
  type HubSpotSyncEvent,
} from '@/lib/hubspot';

interface SyncRequestBody {
  documentId: string;
  eventType: 'sent' | 'viewed' | 'signed' | 'completed' | 'declined';
  recipientEmail?: string;
  recipientName?: string;
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

    const body: SyncRequestBody = await request.json();
    const { documentId, eventType, recipientEmail, recipientName } = body;

    if (!documentId || !eventType) {
      return NextResponse.json(
        { error: 'Missing required fields: documentId and eventType' },
        { status: 400 }
      );
    }

    // Find the HubSpot integration
    const integration = await db.query.integrations.findFirst({
      where: and(
        eq(integrations.userId, session.user.id),
        eq(integrations.provider, 'hubspot')
      ),
    });

    if (!integration || !integration.accessToken) {
      return NextResponse.json(
        { error: 'HubSpot not connected' },
        { status: 400 }
      );
    }

    // Get sync settings
    const metadata = integration.metadata as Record<string, unknown> | null;
    const syncSettings = (metadata?.syncSettings as HubSpotSyncSettings) || {
      enabled: true,
      syncOnDocumentSent: true,
      syncOnDocumentViewed: false,
      syncOnDocumentSigned: true,
      syncOnDocumentCompleted: true,
      createDealsOnCompletion: false,
      createTasksOnCompletion: false,
    };

    // Check if sync is enabled for this event type
    if (!syncSettings.enabled) {
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: 'Sync is disabled',
      });
    }

    const shouldSync =
      (eventType === 'sent' && syncSettings.syncOnDocumentSent) ||
      (eventType === 'viewed' && syncSettings.syncOnDocumentViewed) ||
      (eventType === 'signed' && syncSettings.syncOnDocumentSigned) ||
      (eventType === 'completed' && syncSettings.syncOnDocumentCompleted) ||
      eventType === 'declined';

    if (!shouldSync) {
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: `Sync is disabled for ${eventType} events`,
      });
    }

    // Get document details
    const document = await db.query.documents.findFirst({
      where: and(
        eq(documents.id, documentId),
        eq(documents.userId, session.user.id)
      ),
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Get recipient if email not provided
    let email = recipientEmail;
    let name = recipientName;

    if (!email) {
      const recipient = await db.query.recipients.findFirst({
        where: eq(recipients.documentId, documentId),
      });
      if (recipient) {
        email = recipient.email;
        name = recipient.name || undefined;
      }
    }

    if (!email) {
      return NextResponse.json(
        { error: 'No recipient email found' },
        { status: 400 }
      );
    }

    // Create HubSpot client
    const tokens: HubSpotTokens = {
      accessToken: integration.accessToken,
      refreshToken: integration.refreshToken || '',
      expiresAt: integration.tokenExpiresAt || new Date(),
    };

    const client = createHubSpotClient(tokens, async (newTokens) => {
      await db
        .update(integrations)
        .set({
          accessToken: newTokens.accessToken,
          refreshToken: newTokens.refreshToken,
          tokenExpiresAt: newTokens.expiresAt,
          updatedAt: new Date(),
        })
        .where(eq(integrations.id, integration.id));
    });

    const results: {
      contactFound: boolean;
      contactId?: string;
      noteCreated: boolean;
      noteId?: string;
      dealCreated: boolean;
      dealId?: string;
      taskCreated: boolean;
      taskId?: string;
    } = {
      contactFound: false,
      noteCreated: false,
      dealCreated: false,
      taskCreated: false,
    };

    // Find or create contact
    const { contact, created: contactCreated } = await client.findOrCreateContact(email, {
      firstname: name?.split(' ')[0],
      lastname: name?.split(' ').slice(1).join(' '),
    });

    results.contactFound = true;
    results.contactId = contact.id;

    // Create note on contact
    const noteBody = generateNoteBody(document.title, eventType, name);
    const note = await client.addNoteToContact(contact.id, noteBody);
    results.noteCreated = true;
    results.noteId = note.id;

    // Create deal if enabled and document is completed
    if (eventType === 'completed' && syncSettings.createDealsOnCompletion) {
      const deal = await client.createDeal({
        dealname: `${document.title} - Signed`,
        dealstage: syncSettings.defaultDealStage || 'closedwon',
        pipeline: syncSettings.defaultPipeline || 'default',
        closedate: new Date().toISOString().split('T')[0],
        description: `Document "${document.title}" was signed and completed.`,
      });

      // Associate contact with deal
      await client.associateContactWithDeal(contact.id, deal.id);

      results.dealCreated = true;
      results.dealId = deal.id;

      // Add note to deal
      await client.addNoteToDeal(deal.id, noteBody);
    }

    // Create follow-up task if enabled and document is completed
    if (eventType === 'completed' && syncSettings.createTasksOnCompletion) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7); // Due in 7 days

      const task = await client.createTaskForContact(contact.id, {
        hs_task_subject: `Follow up: ${document.title}`,
        hs_task_body: `Document "${document.title}" was signed by ${name || email}. Schedule a follow-up call.`,
        hs_task_status: 'NOT_STARTED',
        hs_task_priority: 'MEDIUM',
        hs_task_type: 'TODO',
        hs_task_due_date: dueDate.toISOString(),
      });

      results.taskCreated = true;
      results.taskId = task.id;
    }

    // Update last sync time
    await db
      .update(integrations)
      .set({ updatedAt: new Date() })
      .where(eq(integrations.id, integration.id));

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error('Failed to sync to HubSpot:', error);

    if (error instanceof HubSpotError) {
      return NextResponse.json(
        { error: error.message, category: error.category },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Failed to sync to HubSpot' },
      { status: 500 }
    );
  }
}

function generateNoteBody(
  documentTitle: string,
  eventType: 'sent' | 'viewed' | 'signed' | 'completed' | 'declined',
  recipientName?: string
): string {
  const timestamp = new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const eventDescriptions: Record<string, string> = {
    sent: 'was sent for signature',
    viewed: 'was viewed',
    signed: 'was signed',
    completed: 'was completed (all signatures collected)',
    declined: 'was declined',
  };

  const action = eventDescriptions[eventType] || 'had activity';
  const recipientInfo = recipientName ? ` by ${recipientName}` : '';

  return `**OpenProposal Activity**\n\nDocument "${documentTitle}" ${action}${recipientInfo}.\n\nTimestamp: ${timestamp}\n\n---\n_Synced from OpenProposal_`;
}

// Get sync history/status
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
        eq(integrations.provider, 'hubspot')
      ),
    });

    if (!integration) {
      return NextResponse.json(
        { error: 'HubSpot not connected' },
        { status: 400 }
      );
    }

    const metadata = integration.metadata as Record<string, unknown> | null;

    return NextResponse.json({
      connected: true,
      lastSync: integration.updatedAt.toISOString(),
      syncSettings: (metadata?.syncSettings as HubSpotSyncSettings) || null,
    });
  } catch (error) {
    console.error('Failed to get sync status:', error);
    return NextResponse.json(
      { error: 'Failed to get sync status' },
      { status: 500 }
    );
  }
}
