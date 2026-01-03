import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { integrations, importJobs, documents } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import {
  mapPandaDocTemplate,
  mapPandaDocDocument,
  type PandaDocTemplate,
  type PandaDocDocument as PandaDocDocumentType,
} from '@/lib/pandadoc/mapper';

interface ImportRequest {
  items: {
    id: string;
    type: 'template' | 'document';
  }[];
  options: {
    importAsTemplates: boolean;
    preserveVariables: boolean;
    includeSignatureFields: boolean;
    includePricingTables: boolean;
  };
}

async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
} | null> {
  try {
    const response = await fetch('https://api.pandadoc.com/oauth2/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: process.env.PANDADOC_CLIENT_ID!,
        client_secret: process.env.PANDADOC_CLIENT_SECRET!,
      }),
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
}

async function fetchPandaDocTemplate(
  accessToken: string,
  templateId: string
): Promise<PandaDocTemplate | null> {
  try {
    const response = await fetch(
      `https://api.pandadoc.com/public/v1/templates/${templateId}/details`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
}

async function fetchPandaDocDocument(
  accessToken: string,
  documentId: string
): Promise<PandaDocDocumentType | null> {
  try {
    const response = await fetch(
      `https://api.pandadoc.com/public/v1/documents/${documentId}/details`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
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

    const body: ImportRequest = await request.json();

    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: 'No items to import' },
        { status: 400 }
      );
    }

    // Get integration
    const integration = await db.query.integrations.findFirst({
      where: and(
        eq(integrations.userId, session.user.id),
        eq(integrations.provider, 'pandadoc')
      ),
    });

    if (!integration || !integration.accessToken) {
      return NextResponse.json(
        { error: 'PandaDoc not connected' },
        { status: 400 }
      );
    }

    let accessToken = integration.accessToken;

    // Check if token is expired and refresh if needed
    if (integration.tokenExpiresAt && new Date(integration.tokenExpiresAt) < new Date()) {
      if (!integration.refreshToken) {
        return NextResponse.json(
          { error: 'Token expired and no refresh token available' },
          { status: 401 }
        );
      }

      const newTokens = await refreshAccessToken(integration.refreshToken);
      if (!newTokens) {
        return NextResponse.json(
          { error: 'Failed to refresh token' },
          { status: 401 }
        );
      }

      // Update tokens in database
      await db
        .update(integrations)
        .set({
          accessToken: newTokens.access_token,
          refreshToken: newTokens.refresh_token,
          tokenExpiresAt: new Date(Date.now() + newTokens.expires_in * 1000),
          updatedAt: new Date(),
        })
        .where(eq(integrations.id, integration.id));

      accessToken = newTokens.access_token;
    }

    // Create import job
    const [importJob] = await db
      .insert(importJobs)
      .values({
        userId: session.user.id,
        provider: 'pandadoc',
        status: 'processing',
        totalFiles: body.items.length,
        processedFiles: 0,
        failedFiles: 0,
        metadata: {
          options: body.options,
          items: body.items,
        },
        startedAt: new Date(),
      })
      .returning();

    // Process items
    const results: {
      success: { id: string; documentId: string }[];
      failed: { id: string; error: string }[];
    } = {
      success: [],
      failed: [],
    };

    for (const item of body.items) {
      try {
        let mappedDocument;

        if (item.type === 'template') {
          const template = await fetchPandaDocTemplate(accessToken, item.id);
          if (!template) {
            results.failed.push({ id: item.id, error: 'Failed to fetch template' });
            continue;
          }
          mappedDocument = mapPandaDocTemplate(template);
        } else {
          const doc = await fetchPandaDocDocument(accessToken, item.id);
          if (!doc) {
            results.failed.push({ id: item.id, error: 'Failed to fetch document' });
            continue;
          }
          mappedDocument = mapPandaDocDocument(doc);
        }

        // Create SendProp document
        const [newDocument] = await db
          .insert(documents)
          .values({
            userId: session.user.id,
            title: mappedDocument.title,
            status: 'draft',
            content: mappedDocument.content,
            variables: mappedDocument.variables,
            settings: {
              ...mappedDocument.settings,
              importedFrom: mappedDocument.importedFrom,
            },
            isTemplate: body.options.importAsTemplates,
            templateCategory: body.options.importAsTemplates ? 'Imported' : undefined,
          })
          .returning();

        results.success.push({
          id: item.id,
          documentId: newDocument.id,
        });

        // Update import job progress
        await db
          .update(importJobs)
          .set({
            processedFiles: results.success.length + results.failed.length,
          })
          .where(eq(importJobs.id, importJob.id));
      } catch (error) {
        console.error(`Failed to import item ${item.id}:`, error);
        results.failed.push({
          id: item.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Update import job with final status
    await db
      .update(importJobs)
      .set({
        status: results.failed.length === body.items.length ? 'failed' : 'completed',
        processedFiles: results.success.length,
        failedFiles: results.failed.length,
        completedAt: new Date(),
        errorMessage:
          results.failed.length > 0
            ? `${results.failed.length} item(s) failed to import`
            : undefined,
        metadata: {
          options: body.options,
          items: body.items,
          results,
        },
      })
      .where(eq(importJobs.id, importJob.id));

    return NextResponse.json({
      success: true,
      jobId: importJob.id,
      imported: results.success.length,
      failed: results.failed.length,
      results,
    });
  } catch (error) {
    console.error('Import failed:', error);
    return NextResponse.json(
      { error: 'Import failed' },
      { status: 500 }
    );
  }
}
