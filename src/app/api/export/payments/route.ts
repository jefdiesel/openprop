import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { payments, documents, recipients } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq, desc, and, inArray } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's documents first
    const userDocs = await db
      .select({ id: documents.id, title: documents.title })
      .from(documents)
      .where(eq(documents.userId, userId));

    const docIds = userDocs.map((d) => d.id);
    const docTitles = userDocs.reduce((acc, d) => {
      acc[d.id] = d.title;
      return acc;
    }, {} as Record<string, string>);

    if (docIds.length === 0) {
      // Return empty CSV
      const headers = [
        "Payment ID",
        "Document Title",
        "Recipient Email",
        "Recipient Name",
        "Amount",
        "Currency",
        "Status",
        "Stripe Payment Intent",
        "Created At",
      ];
      return new NextResponse(headers.join(","), {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="payments-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    // Get all payments for user's documents
    const allPayments = await db
      .select({
        id: payments.id,
        documentId: payments.documentId,
        recipientId: payments.recipientId,
        amount: payments.amount,
        currency: payments.currency,
        status: payments.status,
        stripePaymentIntentId: payments.stripePaymentIntentId,
        createdAt: payments.createdAt,
      })
      .from(payments)
      .where(inArray(payments.documentId, docIds))
      .orderBy(desc(payments.createdAt));

    // Get recipient details
    const recipientIds = allPayments
      .map((p) => p.recipientId)
      .filter((id): id is string => id !== null);

    const recipientDetails =
      recipientIds.length > 0
        ? await db
            .select({
              id: recipients.id,
              email: recipients.email,
              name: recipients.name,
            })
            .from(recipients)
            .where(inArray(recipients.id, recipientIds))
        : [];

    const recipientMap = recipientDetails.reduce((acc, r) => {
      acc[r.id] = r;
      return acc;
    }, {} as Record<string, (typeof recipientDetails)[0]>);

    // Build CSV
    const headers = [
      "Payment ID",
      "Document Title",
      "Recipient Email",
      "Recipient Name",
      "Amount",
      "Currency",
      "Status",
      "Stripe Payment Intent",
      "Created At",
    ];

    const rows = allPayments.map((payment) => {
      const recipient = payment.recipientId
        ? recipientMap[payment.recipientId]
        : null;
      // Amount is stored in cents
      const amountFormatted = (payment.amount / 100).toFixed(2);

      return [
        payment.id,
        `"${(docTitles[payment.documentId] || "").replace(/"/g, '""')}"`,
        recipient?.email || "",
        `"${(recipient?.name || "").replace(/"/g, '""')}"`,
        amountFormatted,
        payment.currency.toUpperCase(),
        payment.status,
        payment.stripePaymentIntentId || "",
        payment.createdAt?.toISOString() || "",
      ].join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="payments-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting payments:", error);
    return NextResponse.json(
      { error: "Failed to export payments" },
      { status: 500 }
    );
  }
}
