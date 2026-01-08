import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { documents, integrations, profiles } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { DocuSignClient } from '@/lib/docusign/client';
import { mapDocuSignTemplateToBlocks, mapDocuSignEnvelopeToBlocks } from '@/lib/docusign/mapper';
import type { DocuSignTemplate, DocuSignEnvelope } from '@/lib/docusign/types';
import type { Block } from '@/types/database';

// ============================================
// JOB STATE MANAGEMENT
// ============================================

interface ImportJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  totalItems: number;
  processedItems: number;
  importedItems: number;
  failedItems: number;
  errors: Array<{ itemId: string; error: string }>;
}

// Module-level Map for short-lived import jobs
const jobs = new Map<string, ImportJob>();

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Extract variables from a DocuSign template
 */
function extractVariables(template: DocuSignTemplate): Record<string, unknown> | null {
  const variables: Record<string, unknown> = {};

  // Extract custom fields as variables
  if (template.customFields) {
    if (template.customFields.textCustomFields) {
      for (const field of template.customFields.textCustomFields) {
        variables[field.name] = field.value || '';
      }
    }
    if (template.customFields.listCustomFields) {
      for (const field of template.customFields.listCustomFields) {
        variables[field.name] = field.value || '';
      }
    }
  }

  return Object.keys(variables).length > 0 ? variables : null;
}

/**
 * Extract variables from a DocuSign envelope
 */
function extractEnvelopeVariables(envelope: DocuSignEnvelope): Record<string, unknown> | null {
  const variables: Record<string, unknown> = {};

  // Extract custom fields as variables
  if (envelope.customFields) {
    if (envelope.customFields.textCustomFields) {
      for (const field of envelope.customFields.textCustomFields) {
        variables[field.name] = field.value || '';
      }
    }
    if (envelope.customFields.listCustomFields) {
      for (const field of envelope.customFields.listCustomFields) {
        variables[field.name] = field.value || '';
      }
    }
  }

  return Object.keys(variables).length > 0 ? variables : null;
}

/**
 * Async import process - runs in background
 */
async function importJob(
  jobId: string,
  items: Array<{ id: string; type: 'template' | 'envelope' }>,
  options: {
    asTemplates?: boolean;
    preserveVariables?: boolean;
    includeSignatures?: boolean;
  },
  userId: string,
  client: DocuSignClient,
  orgId: string | null
): Promise<void> {
  const job = jobs.get(jobId);
  if (!job) return;

  job.status = 'processing';

  for (const item of items) {
    try {
      if (item.type === 'template') {
        // Fetch the template details from DocuSign
        const template = await client.getTemplate(item.id);

        // Map DocuSign template to our block format
        const blocks = mapDocuSignTemplateToBlocks(template);

        // Create the document in our database
        await db.insert(documents).values({
          id: crypto.randomUUID(),
          userId,
          organizationId: orgId || null,
          title: template.name,
          content: blocks as Block[],
          isTemplate: options.asTemplates ?? false,
          templateCategory: 'Imported from DocuSign',
          status: 'draft',
          variables: options.preserveVariables ? extractVariables(template) : null,
        });

        job.importedItems++;
      } else if (item.type === 'envelope') {
        // Fetch the envelope details from DocuSign
        const envelope = await client.getEnvelope(item.id);

        // Map DocuSign envelope to our block format
        const blocks = mapDocuSignEnvelopeToBlocks(envelope);

        // Create the document in our database
        await db.insert(documents).values({
          id: crypto.randomUUID(),
          userId,
          organizationId: orgId || null,
          title: envelope.emailSubject || 'Imported Document',
          content: blocks as Block[],
          isTemplate: options.asTemplates ?? false,
          templateCategory: 'Imported from DocuSign',
          status: 'draft',
          variables: options.preserveVariables ? extractEnvelopeVariables(envelope) : null,
        });

        job.importedItems++;
      }
    } catch (e) {
      job.failedItems++;
      job.errors.push({
        itemId: item.id,
        error: e instanceof Error ? e.message : 'Unknown error',
      });
    }

    job.processedItems++;
    job.progress = Math.round((job.processedItems / job.totalItems) * 100);
  }

  job.status = job.failedItems === job.totalItems ? 'failed' : 'completed';
}

// ============================================
// POST HANDLER - Start Import
// ============================================

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

    // Check if token is expired
    const isTokenExpired = integration.tokenExpiresAt
      ? new Date(integration.tokenExpiresAt) < new Date()
      : false;

    if (isTokenExpired) {
      return NextResponse.json(
        { error: 'DocuSign token expired. Please reconnect.' },
        { status: 401 }
      );
    }

    // Get user's current organization context
    const [profile] = await db
      .select({ currentOrganizationId: profiles.currentOrganizationId })
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1);

    // Parse request body
    const body = await request.json();
    const {
      items,
      options = {},
    } = body as {
      items: Array<{ id: string; type: 'template' | 'envelope' }>;
      options?: {
        asTemplates?: boolean;
        preserveVariables?: boolean;
        includeSignatures?: boolean;
      };
    };

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items array is required and must not be empty' },
        { status: 400 }
      );
    }

    // Validate each item
    for (const item of items) {
      if (!item.id || !item.type) {
        return NextResponse.json(
          { error: 'Each item must have an id and type' },
          { status: 400 }
        );
      }
      if (item.type !== 'template' && item.type !== 'envelope') {
        return NextResponse.json(
          { error: 'Item type must be "template" or "envelope"' },
          { status: 400 }
        );
      }
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

    // Generate job ID
    const jobId = crypto.randomUUID();

    // Initialize job state
    const job: ImportJob = {
      id: jobId,
      status: 'pending',
      progress: 0,
      totalItems: items.length,
      processedItems: 0,
      importedItems: 0,
      failedItems: 0,
      errors: [],
    };

    jobs.set(jobId, job);

    // Start async import process (don't await)
    importJob(
      jobId,
      items,
      options,
      userId,
      client,
      profile?.currentOrganizationId || null
    ).catch((error) => {
      // Update job status on unexpected failure
      const failedJob = jobs.get(jobId);
      if (failedJob) {
        failedJob.status = 'failed';
        failedJob.errors.push({
          itemId: 'system',
          error: error instanceof Error ? error.message : 'Unknown system error',
        });
      }
    });

    return NextResponse.json({ jobId });
  } catch (error) {
    console.error('Failed to start DocuSign import:', error);
    return NextResponse.json(
      { error: 'Failed to start import' },
      { status: 500 }
    );
  }
}

// ============================================
// GET HANDLER - Job Status
// ============================================

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get jobId from query params
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json(
        { error: 'jobId query parameter is required' },
        { status: 400 }
      );
    }

    // Get job from Map
    const job = jobs.get(jobId);

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Clean up completed/failed jobs after returning status
    // (keep them around for a bit for polling)
    if (job.status === 'completed' || job.status === 'failed') {
      // Schedule cleanup after 5 minutes
      setTimeout(() => {
        jobs.delete(jobId);
      }, 5 * 60 * 1000);
    }

    return NextResponse.json({
      id: job.id,
      status: job.status,
      progress: job.progress,
      totalItems: job.totalItems,
      processedItems: job.processedItems,
      importedItems: job.importedItems,
      failedItems: job.failedItems,
      errors: job.errors,
    });
  } catch (error) {
    console.error('Failed to get import job status:', error);
    return NextResponse.json(
      { error: 'Failed to get job status' },
      { status: 500 }
    );
  }
}
