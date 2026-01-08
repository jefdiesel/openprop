import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { documents, profiles, users } from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { eq, and, desc, asc, ilike, sql, count, isNull } from 'drizzle-orm'
import * as z from 'zod'
import type { Block } from '@/types/database'
import { canCreateTemplate } from '@/lib/templates'

// Schema for creating a document
const createDocumentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  content: z.array(z.unknown()).default([]),
  is_template: z.boolean().default(false),
  template_category: z.string().nullable().optional(),
  variables: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).nullable().optional(),
  settings: z.object({
    allowDownload: z.boolean().optional(),
    allowPrinting: z.boolean().optional(),
    requireSigningOrder: z.boolean().optional(),
    expirationDays: z.number().optional(),
    reminderDays: z.array(z.number()).optional(),
    redirectUrl: z.string().optional(),
    brandColor: z.string().optional(),
    logoUrl: z.string().optional(),
  }).nullable().optional(),
})

// GET /api/documents - List user's documents
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's current organization context
    const [profile] = await db
      .select({ currentOrganizationId: profiles.currentOrganizationId })
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1)

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const isTemplate = searchParams.get('is_template')
    const search = searchParams.get('search')
    const createdByUserId = searchParams.get('created_by') // Filter by creator (for admins)
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)
    const sortBy = searchParams.get('sort_by') || 'updated_at'
    const sortOrder = searchParams.get('sort_order') || 'desc'

    // Build conditions based on context
    // Team context: show all team documents
    // Personal context: show user's personal documents (no org)
    const conditions = profile?.currentOrganizationId
      ? [eq(documents.organizationId, profile.currentOrganizationId)]
      : [eq(documents.userId, userId), isNull(documents.organizationId)]

    if (status) {
      conditions.push(eq(documents.status, status as 'draft' | 'sent' | 'viewed' | 'completed' | 'expired' | 'declined'))
    }

    if (isTemplate !== null) {
      conditions.push(eq(documents.isTemplate, isTemplate === 'true'))
    }

    if (search) {
      conditions.push(ilike(documents.title, `%${search}%`))
    }

    // Filter by creator (for team admins)
    if (createdByUserId && profile?.currentOrganizationId) {
      conditions.push(eq(documents.userId, createdByUserId))
    }

    // Determine sort column and order
    const validSortColumns = ['createdAt', 'updatedAt', 'title', 'status'] as const
    type SortColumn = typeof validSortColumns[number]
    const columnMap: Record<string, SortColumn> = {
      'created_at': 'createdAt',
      'updated_at': 'updatedAt',
      'title': 'title',
      'status': 'status',
    }
    const column = columnMap[sortBy] || 'updatedAt'
    const orderFn = sortOrder === 'asc' ? asc : desc

    // Query documents with creator info
    const [docs, [{ total }]] = await Promise.all([
      db.select({
        id: documents.id,
        userId: documents.userId,
        organizationId: documents.organizationId,
        title: documents.title,
        status: documents.status,
        content: documents.content,
        variables: documents.variables,
        settings: documents.settings,
        isTemplate: documents.isTemplate,
        templateCategory: documents.templateCategory,
        createdAt: documents.createdAt,
        updatedAt: documents.updatedAt,
        sentAt: documents.sentAt,
        expiresAt: documents.expiresAt,
        blockchainTxHash: documents.blockchainTxHash,
        blockchainVerifiedAt: documents.blockchainVerifiedAt,
        creatorName: users.name,
        creatorEmail: users.email,
      })
        .from(documents)
        .leftJoin(users, eq(documents.userId, users.id))
        .where(and(...conditions))
        .orderBy(orderFn(documents[column]))
        .limit(limit)
        .offset(offset),
      db.select({ total: count() })
        .from(documents)
        .where(and(...conditions)),
    ])

    // Transform to match expected format (snake_case for API response)
    const transformedDocs = docs.map(doc => ({
      id: doc.id,
      user_id: doc.userId,
      title: doc.title,
      status: doc.status,
      content: doc.content,
      variables: doc.variables,
      settings: doc.settings,
      is_template: doc.isTemplate,
      template_category: doc.templateCategory,
      created_at: doc.createdAt?.toISOString() || null,
      updated_at: doc.updatedAt?.toISOString() || null,
      sent_at: doc.sentAt?.toISOString() || null,
      expires_at: doc.expiresAt?.toISOString() || null,
      // Blockchain verification fields
      blockchain_tx_hash: doc.blockchainTxHash || null,
      blockchain_verified_at: doc.blockchainVerifiedAt?.toISOString() || null,
      // Creator info
      created_by: {
        id: doc.userId,
        name: doc.creatorName,
        email: doc.creatorEmail,
      },
    }))

    return NextResponse.json({
      documents: transformedDocs,
      pagination: {
        total: total || 0,
        limit,
        offset,
        hasMore: (total || 0) > offset + limit,
      },
    })
  } catch (error) {
    console.error('Error in GET /api/documents:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/documents - Create a new document
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

    // Get user's current organization context
    const [profile] = await db
      .select({ currentOrganizationId: profiles.currentOrganizationId })
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1)

    // Parse and validate request body
    const body = await request.json()
    const validationResult = createDocumentSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const { title, content, is_template, template_category, variables, settings } = validationResult.data

    // Check template limit if creating a template
    if (is_template) {
      const templateCheck = await canCreateTemplate(userId)
      if (!templateCheck.allowed) {
        return NextResponse.json(
          {
            error: "Template limit reached",
            upgrade: true,
            message: "Upgrade to Team or Business plan to create templates"
          },
          { status: 403 }
        )
      }
    }

    // Create document (in team context if applicable)
    const [document] = await db.insert(documents)
      .values({
        userId,
        organizationId: profile?.currentOrganizationId || null,
        title,
        content: content as Block[],
        status: 'draft',
        isTemplate: is_template,
        templateCategory: template_category || null,
        variables: (variables as Record<string, unknown>) || null,
        settings: (settings as Record<string, unknown>) || null,
      })
      .returning()

    // Transform to match expected format
    const transformedDoc = {
      id: document.id,
      user_id: document.userId,
      title: document.title,
      status: document.status,
      content: document.content,
      variables: document.variables,
      settings: document.settings,
      is_template: document.isTemplate,
      template_category: document.templateCategory,
      created_at: document.createdAt?.toISOString() || null,
      updated_at: document.updatedAt?.toISOString() || null,
      sent_at: document.sentAt?.toISOString() || null,
      expires_at: document.expiresAt?.toISOString() || null,
    }

    return NextResponse.json({ document: transformedDoc }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/documents:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
