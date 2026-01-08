import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { integrations, documents, recipients, payments } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { createQuickBooksClient } from '@/lib/quickbooks';

interface SyncRequestBody {
  documentId: string;
  recipientId?: string;
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
    const { documentId, recipientId } = body;

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    // Get the integration
    const integration = await db.query.integrations.findFirst({
      where: and(
        eq(integrations.userId, session.user.id),
        eq(integrations.provider, 'quickbooks')
      ),
    });

    if (!integration || !integration.accessToken) {
      return NextResponse.json(
        { error: 'QuickBooks not connected' },
        { status: 404 }
      );
    }

    const metadata = integration.metadata as Record<string, unknown> || {};
    const realmId = (metadata.realmId as string) || integration.accountId;

    if (!realmId) {
      return NextResponse.json(
        { error: 'QuickBooks realm ID not found' },
        { status: 400 }
      );
    }

    // Get the document
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

    // Get recipient (use first recipient if not specified)
    let recipient;
    if (recipientId) {
      recipient = await db.query.recipients.findFirst({
        where: and(
          eq(recipients.id, recipientId),
          eq(recipients.documentId, documentId)
        ),
      });
    } else {
      // Get first recipient with payment
      const allRecipients = await db.query.recipients.findMany({
        where: eq(recipients.documentId, documentId),
      });
      recipient = allRecipients.find(r => r.paymentAmount && r.paymentAmount > 0) || allRecipients[0];
    }

    if (!recipient) {
      return NextResponse.json(
        { error: 'No recipient found for document' },
        { status: 404 }
      );
    }

    // Create QuickBooks client
    const client = createQuickBooksClient(
      {
        accessToken: integration.accessToken,
        refreshToken: integration.refreshToken || '',
        expiresAt: integration.tokenExpiresAt || new Date(),
        refreshTokenExpiresAt: new Date(metadata.refreshTokenExpiresAt as string || Date.now() + 100 * 24 * 60 * 60 * 1000),
        realmId,
      },
      async (newTokens) => {
        // Update tokens in database
        await db
          .update(integrations)
          .set({
            accessToken: newTokens.accessToken,
            refreshToken: newTokens.refreshToken,
            tokenExpiresAt: newTokens.expiresAt,
            metadata: {
              ...metadata,
              refreshTokenExpiresAt: newTokens.refreshTokenExpiresAt.toISOString(),
            },
            updatedAt: new Date(),
          })
          .where(eq(integrations.id, integration.id));
      },
      metadata.environment as 'sandbox' | 'production' || 'production'
    );

    // Step 1: Find or create customer
    const customerName = recipient.name || recipient.email;
    const customer = await client.findOrCreateCustomer(
      recipient.email,
      customerName
    );

    // Step 2: Extract line items from document content
    const lineItems = [];
    const content = document.content as unknown[];

    // Look for pricing table in content
    for (const block of content) {
      const blockData = block as Record<string, unknown>;
      if (blockData.type === 'pricingTable' && blockData.data) {
        const data = blockData.data as Record<string, unknown>;
        const rows = (data.rows as unknown[]) || [];

        for (const row of rows) {
          const rowData = row as Record<string, unknown>;
          const cells = (rowData.cells as Record<string, unknown>) || {};

          const description = (cells.description as string) || 'Service';
          const quantity = parseFloat((cells.quantity as string) || '1');
          const price = parseFloat((cells.price as string) || '0');
          const amount = parseFloat((cells.total as string) || (quantity * price).toString());

          lineItems.push({
            Amount: amount,
            DetailType: 'SalesItemLineDetail' as const,
            Description: description,
            SalesItemLineDetail: {
              Qty: quantity,
              UnitPrice: price,
            },
          });
        }
      }
    }

    // If no line items found, create a generic one
    if (lineItems.length === 0 && recipient.paymentAmount) {
      lineItems.push({
        Amount: recipient.paymentAmount / 100, // Convert cents to dollars
        DetailType: 'SalesItemLineDetail' as const,
        Description: document.title,
        SalesItemLineDetail: {
          Qty: 1,
          UnitPrice: recipient.paymentAmount / 100,
        },
      });
    }

    // Step 3: Create invoice
    const invoice = await client.createInvoice(
      customer.Id,
      lineItems,
      {
        TxnDate: new Date().toISOString().split('T')[0],
        DueDate: recipient.paymentTiming === 'net_30'
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          : recipient.paymentTiming === 'net_60'
          ? new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          : undefined,
        BillEmail: { Address: recipient.email },
        PrivateNote: `Created from OpenProposal document: ${document.title}`,
        CustomerMemo: {
          value: `Thank you for your business!`,
        },
      }
    );

    // Step 4: Record payment if already paid
    let payment;
    if (recipient.paymentStatus === 'succeeded' && recipient.paymentAmount) {
      payment = await client.createPayment(
        invoice.Id,
        invoice.TotalAmt || (recipient.paymentAmount / 100),
        customer.Id,
        {
          TxnDate: recipient.signedAt?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
          PaymentRefNum: recipient.paymentIntentId || undefined,
          PrivateNote: `Payment from OpenProposal (${recipient.paymentMethod || 'stripe'})`,
        }
      );
    }

    // Step 5: Store QuickBooks IDs in document metadata
    const currentSettings = document.settings as Record<string, unknown> || {};
    await db
      .update(documents)
      .set({
        settings: {
          ...currentSettings,
          quickbooks: {
            customerId: customer.Id,
            invoiceId: invoice.Id,
            paymentId: payment?.Id,
            syncedAt: new Date().toISOString(),
          },
        },
        updatedAt: new Date(),
      })
      .where(eq(documents.id, documentId));

    // Update integration last sync time
    await db
      .update(integrations)
      .set({
        updatedAt: new Date(),
      })
      .where(eq(integrations.id, integration.id));

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.Id,
        name: customer.DisplayName,
      },
      invoice: {
        id: invoice.Id,
        number: invoice.DocNumber,
        total: invoice.TotalAmt,
        balance: invoice.Balance,
      },
      payment: payment ? {
        id: payment.Id,
        amount: payment.TotalAmt,
      } : null,
    });
  } catch (error) {
    console.error('Failed to sync to QuickBooks:', error);
    return NextResponse.json(
      {
        error: 'Failed to sync to QuickBooks',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
