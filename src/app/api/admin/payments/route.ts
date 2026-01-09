import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { payments, documents, recipients } from "@/lib/db/schema";
import { sql, desc, eq } from "drizzle-orm";

// GET /api/admin/payments - List all payments with pagination
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
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    // Validate pagination params
    const validatedPage = Math.max(1, page);
    const validatedLimit = Math.min(Math.max(1, limit), 100);
    const offset = (validatedPage - 1) * validatedLimit;

    // Get total count
    const totalCountResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(payments);
    const totalCount = totalCountResult[0]?.count || 0;

    // Fetch payments with document and recipient info
    const paymentsWithDetails = await db
      .select({
        id: payments.id,
        amount: payments.amount,
        currency: payments.currency,
        status: payments.status,
        paymentMethod: payments.paymentMethod,
        stripePaymentIntentId: payments.stripePaymentIntentId,
        createdAt: payments.createdAt,
        documentId: payments.documentId,
        documentTitle: documents.title,
        recipientId: payments.recipientId,
        recipientEmail: recipients.email,
        recipientName: recipients.name,
      })
      .from(payments)
      .leftJoin(documents, eq(payments.documentId, documents.id))
      .leftJoin(recipients, eq(payments.recipientId, recipients.id))
      .orderBy(desc(payments.createdAt))
      .limit(validatedLimit)
      .offset(offset);

    // Format the results
    const formattedPayments = paymentsWithDetails.map((payment) => ({
      id: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      paymentMethod: payment.paymentMethod,
      stripePaymentIntentId: payment.stripePaymentIntentId,
      createdAt: payment.createdAt.toISOString(),
      document: {
        id: payment.documentId,
        title: payment.documentTitle || "Unknown Document",
      },
      recipient: payment.recipientId
        ? {
            id: payment.recipientId,
            email: payment.recipientEmail || "",
            name: payment.recipientName || "",
          }
        : null,
    }));

    return NextResponse.json({
      payments: formattedPayments,
      pagination: {
        page: validatedPage,
        limit: validatedLimit,
        totalCount,
        totalPages: Math.ceil(totalCount / validatedLimit),
      },
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}
