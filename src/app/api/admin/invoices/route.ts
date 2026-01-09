import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getStripe } from "@/lib/stripe";

// GET /api/admin/invoices - List all subscription invoices from Stripe
export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin();

  if (!adminCheck.authorized) {
    return NextResponse.json(
      { error: adminCheck.error },
      { status: adminCheck.error === "Unauthorized" ? 401 : 403 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const startingAfter = searchParams.get("starting_after") || undefined;

    const stripe = getStripe();

    // Fetch invoices from Stripe
    const invoices = await stripe.invoices.list({
      limit: Math.min(limit, 100),
      starting_after: startingAfter,
      expand: ["data.customer", "data.subscription"],
    });

    // Format the results - handle Stripe SDK v20+ type differences
    const formattedInvoices = invoices.data.map((invoice) => {
      const customer = invoice.customer as { email?: string; name?: string } | string | null;
      const customerEmail = typeof customer === "object" ? customer?.email : null;
      const customerName = typeof customer === "object" ? customer?.name : null;

      // Access properties that may differ between Stripe SDK versions
      const inv = invoice as unknown as {
        paid?: boolean;
        amount_paid?: number;
        amount_due?: number;
        period_start?: number;
        period_end?: number;
        hosted_invoice_url?: string | null;
        invoice_pdf?: string | null;
        status_transitions?: { paid_at?: number | null };
        subscription?: string | { id: string } | null;
      };

      const isPaid = inv.paid ?? invoice.status === "paid";
      const subscriptionId = typeof inv.subscription === "string"
        ? inv.subscription
        : inv.subscription?.id || null;

      return {
        id: invoice.id,
        number: invoice.number,
        amount: inv.amount_paid ?? 0,
        amountDue: inv.amount_due ?? 0,
        currency: invoice.currency,
        status: invoice.status,
        paid: isPaid,
        customerEmail,
        customerName,
        subscriptionId,
        hostedInvoiceUrl: inv.hosted_invoice_url ?? null,
        invoicePdf: inv.invoice_pdf ?? null,
        periodStart: inv.period_start ? new Date(inv.period_start * 1000).toISOString() : null,
        periodEnd: inv.period_end ? new Date(inv.period_end * 1000).toISOString() : null,
        createdAt: invoice.created ? new Date(invoice.created * 1000).toISOString() : null,
        paidAt: inv.status_transitions?.paid_at
          ? new Date(inv.status_transitions.paid_at * 1000).toISOString()
          : null,
      };
    });

    return NextResponse.json({
      invoices: formattedInvoices,
      hasMore: invoices.has_more,
      lastId: invoices.data[invoices.data.length - 1]?.id || null,
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}
