import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { documents, recipients, documentEvents } from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { eq, and, asc } from 'drizzle-orm'
import { canAccessDocument } from '@/lib/document-access'
import { generatePdfBuffer } from '@/lib/pdf-generator'
import type { Document, Recipient } from '@/types/database'

type RouteContext = {
  params: Promise<{ id: string }>
}

// GET /api/documents/[id]/pdf - Generate and return PDF
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check access (owner or team member)
    const access = await canAccessDocument(userId, id);
    if (!access.allowed) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Fetch full document
    const [document] = await db.select()
      .from(documents)
      .where(eq(documents.id, id))
      .limit(1)

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Fetch recipients for signature data
    const recipientsData = await db.select()
      .from(recipients)
      .where(eq(recipients.documentId, id))
      .orderBy(asc(recipients.signingOrder))

    // Document from Drizzle is already in the correct format
    const doc: Document = {
      ...document,
      content: document.content as Document['content'],
      variables: document.variables as Document['variables'],
      settings: document.settings as Document['settings'],
    }

    // Recipients from Drizzle are already in the correct format
    const recipientsList: Recipient[] = recipientsData.map((r) => ({
      ...r,
      signatureData: r.signatureData as Recipient['signatureData'],
    }))

    // Generate PDF buffer
    const pdfBuffer = await generatePdfBuffer(doc, recipientsList.length > 0 ? recipientsList : undefined)

    // Get query params for download behavior
    const { searchParams } = new URL(request.url)
    const download = searchParams.get('download') === 'true'
    const filename = searchParams.get('filename') || `${document.title}.pdf`

    // Set headers for PDF response
    const headers = new Headers({
      'Content-Type': 'application/pdf',
      'Content-Length': pdfBuffer.length.toString(),
    })

    if (download) {
      headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`)
    } else {
      headers.set('Content-Disposition', `inline; filename="${encodeURIComponent(filename)}"`)
    }

    // Create document event for PDF generation
    await db.insert(documentEvents).values({
      documentId: id,
      eventType: 'pdf_generated',
      eventData: {
        download,
        filename,
      },
    })

    // Convert Buffer to Uint8Array for NextResponse
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error('Error in GET /api/documents/[id]/pdf:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
