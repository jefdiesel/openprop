import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { documents, importJobs } from '@/lib/db/schema'
import { createPandaDocClientWithApiKey, PandaDocError } from '@/lib/pandadoc/client'
import { mapPandaDocTemplateToBlocks } from '@/lib/pandadoc/mapper'
import { eq } from 'drizzle-orm'
import * as z from 'zod'

const importRequestSchema = z.object({
  apiKey: z.string().min(1, 'API key is required'),
  options: z.object({
    importTemplates: z.boolean().default(true),
    importContacts: z.boolean().default(false),
    importContentLibrary: z.boolean().default(false),
    importDocuments: z.boolean().default(false),
    documentStatuses: z.array(z.string()).optional(),
  }).optional(),
})

// POST /api/import/pandadoc-key - Start import from PandaDoc using API key
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validation = importRequestSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { apiKey, options } = validation.data

    // Create PandaDoc client
    const client = createPandaDocClientWithApiKey(apiKey)

    // Test the API key by getting current user
    try {
      await client.getCurrentUser()
    } catch (error) {
      if (error instanceof PandaDocError && error.statusCode === 401) {
        return NextResponse.json(
          { error: 'Invalid API key. Please check your PandaDoc API key and try again.' },
          { status: 401 }
        )
      }
      throw error
    }

    // Create import job record
    const [importJob] = await db.insert(importJobs).values({
      userId,
      provider: 'pandadoc',
      status: 'processing',
      totalFiles: 0,
      processedFiles: 0,
      failedFiles: 0,
      metadata: { options: options || {}, importedCount: 0 },
      startedAt: new Date(),
    }).returning()

    // Start import in background (we'll return immediately)
    performImport(client, userId, importJob.id, options || {}).catch(console.error)

    return NextResponse.json({
      success: true,
      jobId: importJob.id,
      message: 'Import started. Check status with GET /api/import/pandadoc-key/[jobId]',
    })
  } catch (error) {
    console.error('Error starting PandaDoc import:', error)
    return NextResponse.json(
      { error: 'Failed to start import' },
      { status: 500 }
    )
  }
}

// Background import function
async function performImport(
  client: ReturnType<typeof createPandaDocClientWithApiKey>,
  userId: string,
  jobId: string,
  options: {
    importTemplates?: boolean
    importContacts?: boolean
    importContentLibrary?: boolean
    importDocuments?: boolean
    documentStatuses?: string[]
  }
) {
  const stats = {
    totalFiles: 0,
    processedFiles: 0,
    importedCount: 0,
    failedFiles: 0,
    errors: [] as Array<{ item: string; error: string }>,
  }

  try {
    // Step 1: Count items
    let templateCount = 0
    let contentLibraryCount = 0

    if (options.importTemplates !== false) {
      const templatesResponse = await client.listTemplates(1, 1)
      templateCount = templatesResponse.total || templatesResponse.results.length * 10 // Estimate if no total
    }

    if (options.importContentLibrary) {
      const contentResponse = await client.listContentLibraryItems(1, 1)
      contentLibraryCount = contentResponse.total || contentResponse.results.length * 10
    }

    stats.totalFiles = templateCount + contentLibraryCount

    // Update job with total count
    await db.update(importJobs)
      .set({ totalFiles: stats.totalFiles })
      .where(eq(importJobs.id, jobId))

    // Step 2: Import templates
    if (options.importTemplates !== false) {
      for await (const template of client.iterateTemplates()) {
        try {
          // Get full template details
          const templateDetails = await client.getTemplate(template.id)

          // Map to our format
          const blocks = mapPandaDocTemplateToBlocks(templateDetails)

          // Create document as template
          await db.insert(documents).values({
            userId,
            title: template.name,
            status: 'draft',
            content: blocks,
            isTemplate: true,
            templateCategory: 'Imported from PandaDoc',
            variables: extractVariables(templateDetails),
          })

          stats.importedCount++
        } catch (error) {
          stats.failedFiles++
          stats.errors.push({
            item: `Template: ${template.name}`,
            error: error instanceof Error ? error.message : 'Unknown error',
          })
        }

        stats.processedFiles++

        // Update progress
        await db.update(importJobs)
          .set({
            processedFiles: stats.processedFiles,
            failedFiles: stats.failedFiles,
            metadata: {
              options,
              importedCount: stats.importedCount,
              errors: stats.errors.slice(0, 10),
            },
          })
          .where(eq(importJobs.id, jobId))

        // Rate limiting: wait 100ms between API calls
        await sleep(100)
      }
    }

    // Step 3: Import content library (if enabled)
    if (options.importContentLibrary) {
      for await (const item of client.iterateContentLibraryItems()) {
        try {
          // Store as content block or template snippet
          await db.insert(documents).values({
            userId,
            title: `[Content] ${item.name}`,
            status: 'draft',
            content: [],
            isTemplate: true,
            templateCategory: 'Content Library',
          })

          stats.importedCount++
        } catch (error) {
          stats.failedFiles++
          stats.errors.push({
            item: `Content: ${item.name}`,
            error: error instanceof Error ? error.message : 'Unknown error',
          })
        }

        stats.processedFiles++

        // Update progress
        await db.update(importJobs)
          .set({
            processedFiles: stats.processedFiles,
            failedFiles: stats.failedFiles,
            metadata: {
              options,
              importedCount: stats.importedCount,
              errors: stats.errors.slice(0, 10),
            },
          })
          .where(eq(importJobs.id, jobId))

        await sleep(100)
      }
    }

    // Step 4: Mark job as complete
    await db.update(importJobs)
      .set({
        status: 'completed',
        processedFiles: stats.processedFiles,
        failedFiles: stats.failedFiles,
        completedAt: new Date(),
        metadata: {
          options,
          importedCount: stats.importedCount,
          summary: {
            templates: stats.importedCount,
            failed: stats.failedFiles,
          },
          errors: stats.errors.slice(0, 100),
        },
      })
      .where(eq(importJobs.id, jobId))

  } catch (error) {
    console.error('Import failed:', error)

    // Mark job as failed
    await db.update(importJobs)
      .set({
        status: 'failed',
        completedAt: new Date(),
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          options,
          importedCount: stats.importedCount,
          errors: stats.errors,
        },
      })
      .where(eq(importJobs.id, jobId))
  }
}

function extractVariables(template: any): Record<string, unknown> | null {
  const variables: Record<string, unknown> = {}

  // Extract tokens as variables
  if (template.tokens) {
    for (const token of template.tokens) {
      variables[token.name] = token.value || ''
    }
  }

  return Object.keys(variables).length > 0 ? variables : null
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
