import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { documents, documentEvents, subscriptions } from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { eq, and, desc, ilike, count } from 'drizzle-orm'
import * as z from 'zod'
import type { Block } from '@/types/database'
import { PLANS, type PlanId } from '@/lib/stripe'

// Schema for saving a document as template
const saveAsTemplateSchema = z.object({
  document_id: z.string().uuid('Invalid document ID').optional(),
  title: z.string().min(1, 'Title is required').max(255),
  content: z.array(z.unknown()).optional(),
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
  is_public: z.boolean().default(false), // For starter templates
})

// GET /api/templates - List templates (user's + public starter templates)
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

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const includePublic = searchParams.get('include_public') !== 'false' // Default to true
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    // Build conditions for user templates
    const conditions = [
      eq(documents.userId, userId),
      eq(documents.isTemplate, true),
    ]

    if (category) {
      conditions.push(eq(documents.templateCategory, category))
    }

    if (search) {
      conditions.push(ilike(documents.title, `%${search}%`))
    }

    // Fetch user's templates
    const [userTemplates, [{ total: userCount }]] = await Promise.all([
      db.select()
        .from(documents)
        .where(and(...conditions))
        .orderBy(desc(documents.updatedAt))
        .limit(limit)
        .offset(offset),
      db.select({ total: count() })
        .from(documents)
        .where(and(...conditions)),
    ])

    // Transform user templates
    const transformedUserTemplates = userTemplates.map((t) => ({
      id: t.id,
      user_id: t.userId,
      title: t.title,
      status: t.status,
      content: t.content,
      variables: t.variables,
      settings: t.settings,
      is_template: t.isTemplate,
      template_category: t.templateCategory,
      created_at: t.createdAt?.toISOString() || null,
      updated_at: t.updatedAt?.toISOString() || null,
      sent_at: t.sentAt?.toISOString() || null,
      expires_at: t.expiresAt?.toISOString() || null,
      source: 'user' as const,
    }))

    // Get starter templates
    let publicTemplates: StarterTemplate[] = []
    let publicCount = 0

    if (includePublic) {
      publicTemplates = getStarterTemplates().filter((template) => {
        if (category && template.template_category !== category) {
          return false
        }
        if (search && !template.title.toLowerCase().includes(search.toLowerCase())) {
          return false
        }
        return true
      })
      publicCount = publicTemplates.length
    }

    // Combine results
    const allTemplates = [
      ...transformedUserTemplates,
      ...publicTemplates.map((t) => ({ ...t, source: 'starter' as const })),
    ]

    // Get unique categories
    const categoriesSet = new Set<string>()
    allTemplates.forEach((t) => {
      if (t.template_category) {
        categoriesSet.add(t.template_category)
      }
    })

    return NextResponse.json({
      templates: allTemplates,
      categories: Array.from(categoriesSet).sort(),
      pagination: {
        total: (userCount || 0) + publicCount,
        userTemplates: userCount || 0,
        publicTemplates: publicCount,
        limit,
        offset,
        hasMore: (userCount || 0) > offset + limit,
      },
    })
  } catch (error) {
    console.error('Error in GET /api/templates:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/templates - Save document as template
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

    // Parse and validate request body
    const body = await request.json()
    const validationResult = saveAsTemplateSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    // Check subscription limits
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .limit(1)

    const planId: PlanId = (subscription?.planId as PlanId) || 'free'
    const plan = PLANS[planId]
    const limits = plan.limits

    // Check if user can create templates
    if (limits.maxTemplates === 0) {
      return NextResponse.json(
        { error: 'Template creation not available on free plan. Please upgrade to create templates.' },
        { status: 403 }
      )
    }

    // If there's a limit, check current template count
    if (limits.maxTemplates !== -1) {
      const [{ total }] = await db
        .select({ total: count() })
        .from(documents)
        .where(
          and(
            eq(documents.userId, userId),
            eq(documents.isTemplate, true)
          )
        )

      if (total >= limits.maxTemplates) {
        return NextResponse.json(
          { error: `Template limit reached. You have ${total} of ${limits.maxTemplates} templates. Please upgrade to create more.` },
          { status: 403 }
        )
      }
    }

    const { document_id, title, content, template_category, variables, settings } = validationResult.data

    let templateContent: unknown[] | undefined = content
    let templateVariables: Record<string, unknown> | null | undefined = variables as Record<string, unknown> | null | undefined
    let templateSettings: Record<string, unknown> | null | undefined = settings as Record<string, unknown> | null | undefined

    // If document_id is provided, copy content from existing document
    if (document_id) {
      const [sourceDoc] = await db.select()
        .from(documents)
        .where(and(eq(documents.id, document_id), eq(documents.userId, userId)))
        .limit(1)

      if (!sourceDoc) {
        return NextResponse.json(
          { error: 'Source document not found' },
          { status: 404 }
        )
      }

      templateContent = templateContent || (sourceDoc.content as unknown[])
      templateVariables = templateVariables || sourceDoc.variables
      templateSettings = templateSettings || sourceDoc.settings
    }

    // Create template
    const [template] = await db.insert(documents)
      .values({
        userId,
        title,
        content: (templateContent || []) as Block[],
        status: 'draft',
        isTemplate: true,
        templateCategory: template_category || null,
        variables: templateVariables || null,
        settings: templateSettings || null,
      })
      .returning()

    // Create document event
    await db.insert(documentEvents).values({
      documentId: template.id,
      eventType: 'template_created',
      eventData: {
        source_document_id: document_id || null,
        category: template_category || null,
      },
    })

    // Transform template for response
    const transformedTemplate = {
      id: template.id,
      user_id: template.userId,
      title: template.title,
      status: template.status,
      content: template.content,
      variables: template.variables,
      settings: template.settings,
      is_template: template.isTemplate,
      template_category: template.templateCategory,
      created_at: template.createdAt?.toISOString() || null,
      updated_at: template.updatedAt?.toISOString() || null,
      sent_at: template.sentAt?.toISOString() || null,
      expires_at: template.expiresAt?.toISOString() || null,
    }

    return NextResponse.json({
      success: true,
      template: transformedTemplate,
      message: 'Template created successfully',
    }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/templates:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Starter template type
interface StarterTemplate {
  id: string
  user_id: string
  title: string
  status: string
  is_template: boolean
  template_category: string
  content: unknown[]
  variables: null
  settings: null
  created_at: string
  updated_at: string
  sent_at: null
  expires_at: null
}

// Starter templates (predefined templates for new users)
function getStarterTemplates(): StarterTemplate[] {
  return [
    {
      id: 'starter-proposal',
      user_id: 'system',
      title: 'Business Proposal',
      status: 'draft',
      is_template: true,
      template_category: 'proposals',
      content: [
        {
          id: '1',
          type: 'text',
          data: {
            content: '<h1>Business Proposal</h1>',
            fontSize: 24,
            alignment: 'center',
            color: '#000000',
            fontWeight: 'bold',
          },
        },
        {
          id: '2',
          type: 'divider',
          data: { style: 'solid', thickness: 1, color: '#e5e7eb' },
        },
        {
          id: '3',
          type: 'text',
          data: {
            content: '<p>Prepared for: [Client Name]</p><p>Prepared by: [Your Company]</p><p>Date: [Date]</p>',
            fontSize: 14,
            alignment: 'left',
            color: '#374151',
            fontWeight: 'normal',
          },
        },
        {
          id: '4',
          type: 'spacer',
          data: { height: 20 },
        },
        {
          id: '5',
          type: 'text',
          data: {
            content: '<h2>Executive Summary</h2><p>Enter your executive summary here...</p>',
            fontSize: 16,
            alignment: 'left',
            color: '#000000',
            fontWeight: 'normal',
          },
        },
        {
          id: '6',
          type: 'pricing-table',
          data: {
            title: 'Investment',
            items: [
              { id: '1', description: 'Service Item 1', quantity: 1, unitPrice: 0 },
              { id: '2', description: 'Service Item 2', quantity: 1, unitPrice: 0 },
            ],
            showTotal: true,
            currency: 'USD',
          },
        },
        {
          id: '7',
          type: 'signature',
          data: { role: 'Client', required: true },
        },
      ],
      variables: null,
      settings: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sent_at: null,
      expires_at: null,
    },
    {
      id: 'starter-contract',
      user_id: 'system',
      title: 'Service Agreement',
      status: 'draft',
      is_template: true,
      template_category: 'contracts',
      content: [
        {
          id: '1',
          type: 'text',
          data: {
            content: '<h1>Service Agreement</h1>',
            fontSize: 24,
            alignment: 'center',
            color: '#000000',
            fontWeight: 'bold',
          },
        },
        {
          id: '2',
          type: 'divider',
          data: { style: 'solid', thickness: 1, color: '#e5e7eb' },
        },
        {
          id: '3',
          type: 'text',
          data: {
            content: '<p>This Service Agreement is entered into as of [Date] by and between:</p><p><strong>Service Provider:</strong> [Your Company Name]</p><p><strong>Client:</strong> [Client Name]</p>',
            fontSize: 14,
            alignment: 'left',
            color: '#374151',
            fontWeight: 'normal',
          },
        },
        {
          id: '4',
          type: 'spacer',
          data: { height: 20 },
        },
        {
          id: '5',
          type: 'text',
          data: {
            content: '<h2>1. Services</h2><p>The Service Provider agrees to provide the following services...</p><h2>2. Term</h2><p>This Agreement shall commence on [Start Date] and continue until [End Date]...</p><h2>3. Compensation</h2><p>Client agrees to pay Service Provider as outlined below:</p>',
            fontSize: 14,
            alignment: 'left',
            color: '#000000',
            fontWeight: 'normal',
          },
        },
        {
          id: '6',
          type: 'pricing-table',
          data: {
            title: 'Fees',
            items: [{ id: '1', description: 'Service Fee', quantity: 1, unitPrice: 0 }],
            showTotal: true,
            currency: 'USD',
          },
        },
        {
          id: '7',
          type: 'text',
          data: {
            content: '<h2>4. Terms and Conditions</h2><p>Add your terms and conditions here...</p>',
            fontSize: 14,
            alignment: 'left',
            color: '#000000',
            fontWeight: 'normal',
          },
        },
        {
          id: '8',
          type: 'spacer',
          data: { height: 30 },
        },
        {
          id: '9',
          type: 'signature',
          data: { role: 'Service Provider', required: true },
        },
        {
          id: '10',
          type: 'signature',
          data: { role: 'Client', required: true },
        },
      ],
      variables: null,
      settings: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sent_at: null,
      expires_at: null,
    },
    {
      id: 'starter-invoice',
      user_id: 'system',
      title: 'Invoice',
      status: 'draft',
      is_template: true,
      template_category: 'invoices',
      content: [
        {
          id: '1',
          type: 'text',
          data: {
            content: '<h1>INVOICE</h1>',
            fontSize: 28,
            alignment: 'right',
            color: '#1f2937',
            fontWeight: 'bold',
          },
        },
        {
          id: '2',
          type: 'text',
          data: {
            content: '<p><strong>Invoice #:</strong> [Invoice Number]</p><p><strong>Date:</strong> [Date]</p><p><strong>Due Date:</strong> [Due Date]</p>',
            fontSize: 12,
            alignment: 'right',
            color: '#6b7280',
            fontWeight: 'normal',
          },
        },
        {
          id: '3',
          type: 'divider',
          data: { style: 'solid', thickness: 2, color: '#1f2937' },
        },
        {
          id: '4',
          type: 'text',
          data: {
            content: '<p><strong>From:</strong></p><p>[Your Company Name]</p><p>[Your Address]</p><p>[Your Email]</p>',
            fontSize: 12,
            alignment: 'left',
            color: '#374151',
            fontWeight: 'normal',
          },
        },
        {
          id: '5',
          type: 'text',
          data: {
            content: '<p><strong>Bill To:</strong></p><p>[Client Name]</p><p>[Client Address]</p><p>[Client Email]</p>',
            fontSize: 12,
            alignment: 'left',
            color: '#374151',
            fontWeight: 'normal',
          },
        },
        {
          id: '6',
          type: 'spacer',
          data: { height: 20 },
        },
        {
          id: '7',
          type: 'pricing-table',
          data: {
            title: 'Items',
            items: [
              { id: '1', description: 'Item 1', quantity: 1, unitPrice: 0 },
              { id: '2', description: 'Item 2', quantity: 1, unitPrice: 0 },
            ],
            showTotal: true,
            currency: 'USD',
          },
        },
        {
          id: '8',
          type: 'spacer',
          data: { height: 30 },
        },
        {
          id: '9',
          type: 'text',
          data: {
            content: '<p><strong>Payment Terms:</strong></p><p>Payment is due within 30 days of invoice date.</p><p>Please make checks payable to [Your Company Name] or pay via bank transfer.</p>',
            fontSize: 11,
            alignment: 'left',
            color: '#6b7280',
            fontWeight: 'normal',
          },
        },
      ],
      variables: null,
      settings: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sent_at: null,
      expires_at: null,
    },
    {
      id: 'starter-quote',
      user_id: 'system',
      title: 'Price Quote',
      status: 'draft',
      is_template: true,
      template_category: 'quotes',
      content: [
        {
          id: '1',
          type: 'text',
          data: {
            content: '<h1>Price Quote</h1>',
            fontSize: 24,
            alignment: 'center',
            color: '#000000',
            fontWeight: 'bold',
          },
        },
        {
          id: '2',
          type: 'text',
          data: {
            content: '<p>Quote #: [Quote Number]</p><p>Date: [Date]</p><p>Valid Until: [Expiry Date]</p>',
            fontSize: 12,
            alignment: 'right',
            color: '#6b7280',
            fontWeight: 'normal',
          },
        },
        {
          id: '3',
          type: 'divider',
          data: { style: 'solid', thickness: 1, color: '#e5e7eb' },
        },
        {
          id: '4',
          type: 'text',
          data: {
            content: '<p><strong>Prepared for:</strong> [Client Name]</p><p><strong>Prepared by:</strong> [Your Name] at [Your Company]</p>',
            fontSize: 14,
            alignment: 'left',
            color: '#374151',
            fontWeight: 'normal',
          },
        },
        {
          id: '5',
          type: 'spacer',
          data: { height: 20 },
        },
        {
          id: '6',
          type: 'text',
          data: {
            content: '<h2>Project Overview</h2><p>Description of the project or services being quoted...</p>',
            fontSize: 14,
            alignment: 'left',
            color: '#000000',
            fontWeight: 'normal',
          },
        },
        {
          id: '7',
          type: 'pricing-table',
          data: {
            title: 'Pricing',
            items: [
              { id: '1', description: 'Service/Product 1', quantity: 1, unitPrice: 0 },
              { id: '2', description: 'Service/Product 2', quantity: 1, unitPrice: 0 },
            ],
            showTotal: true,
            currency: 'USD',
          },
        },
        {
          id: '8',
          type: 'spacer',
          data: { height: 20 },
        },
        {
          id: '9',
          type: 'text',
          data: {
            content: '<h2>Terms & Conditions</h2><p>- Quote valid for 30 days</p><p>- 50% deposit required to begin work</p><p>- Final payment due upon completion</p>',
            fontSize: 12,
            alignment: 'left',
            color: '#374151',
            fontWeight: 'normal',
          },
        },
        {
          id: '10',
          type: 'spacer',
          data: { height: 30 },
        },
        {
          id: '11',
          type: 'text',
          data: {
            content: '<p><strong>To accept this quote, please sign below:</strong></p>',
            fontSize: 12,
            alignment: 'left',
            color: '#374151',
            fontWeight: 'normal',
          },
        },
        {
          id: '12',
          type: 'signature',
          data: { role: 'Client', required: true },
        },
      ],
      variables: null,
      settings: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sent_at: null,
      expires_at: null,
    },
  ]
}
