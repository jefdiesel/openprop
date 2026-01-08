import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { documents, integrations, profiles } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { PandaDocClient } from '@/lib/pandadoc/client';
import { mapPandaDocTemplateToBlocks } from '@/lib/pandadoc/mapper';
import type { PandaDocTemplate } from '@/lib/pandadoc/types';
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
 * Extract variables from a PandaDoc template
 */
function extractVariables(template: PandaDocTemplate): Record<string, unknown> | null {
  const variables: Record<string, unknown> = {};

  // Extract tokens as variables
  if (template.tokens && template.tokens.length > 0) {
    for (const token of template.tokens) {
      variables[token.name] = token.value || '';
    }
  }

  // Extract fields as variables
  if (template.fields && template.fields.length > 0) {
    for (const field of template.fields) {
      if (field.type === 'text' || field.type === 'date') {
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
  items: Array<{ id: string; type: 'template' | 'document' }>,
  options: {
    asTemplates?: boolean;
    preserveVariables?: boolean;
    includeSignatures?: boolean;
    includePricing?: boolean;
  },
  userId: string,
  accessToken: string,
  orgId: string | null
): Promise<void> {
  const job = jobs.get(jobId);
  if (!job) return;

  job.status = 'processing';

  const client = new PandaDocClient({ accessToken });

  for (const item of items) {
    try {
      if (item.type === 'template') {
        // Fetch the template details from PandaDoc
        const template = await client.getTemplate(item.id);

        // Map PandaDoc template to our block format
        const blocks = mapPandaDocTemplateToBlocks(template);

        // Create the document in our database
        await db.insert(documents).values({
          id: crypto.randomUUID(),
          userId,
          organizationId: orgId || null,
          title: template.name,
          content: blocks as Block[],
          isTemplate: options.asTemplates ?? false,
          templateCategory: 'Imported from PandaDoc',
          status: 'draft',
          variables: options.preserveVariables ? extractVariables(template) : null,
        });

        job.importedItems++;
      } else if (item.type === 'document') {
        // For documents, we could implement similar logic
        // For now, we'll handle templates only and mark documents as failed
        // since the mapper is primarily designed for templates
        throw new Error('Document import not yet implemented. Please import as template.');
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

    // Get user's PandaDoc integration
    const integration = await db.query.integrations.findFirst({
      where: and(
        eq(integrations.userId, userId),
        eq(integrations.provider, 'pandadoc')
      ),
    });

    if (!integration || !integration.accessToken) {
      return NextResponse.json(
        { error: 'PandaDoc not connected' },
        { status: 400 }
      );
    }

    // Check if token is expired
    const isTokenExpired = integration.tokenExpiresAt
      ? new Date(integration.tokenExpiresAt) < new Date()
      : false;

    if (isTokenExpired) {
      return NextResponse.json(
        { error: 'PandaDoc token expired. Please reconnect.' },
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
      items: Array<{ id: string; type: 'template' | 'document' }>;
      options?: {
        asTemplates?: boolean;
        preserveVariables?: boolean;
        includeSignatures?: boolean;
        includePricing?: boolean;
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
      if (item.type !== 'template' && item.type !== 'document') {
        return NextResponse.json(
          { error: 'Item type must be "template" or "document"' },
          { status: 400 }
        );
      }
    }

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
      integration.accessToken,
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
    console.error('Failed to start PandaDoc import:', error);
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
