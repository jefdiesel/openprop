import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { documents, recipients } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all documents with recipients
    const docs = await db
      .select({
        id: documents.id,
        title: documents.title,
        status: documents.status,
        isTemplate: documents.isTemplate,
        createdAt: documents.createdAt,
        sentAt: documents.sentAt,
        expiresAt: documents.expiresAt,
      })
      .from(documents)
      .where(eq(documents.userId, userId))
      .orderBy(desc(documents.createdAt));

    // Get recipients for each document
    const docIds = docs.map((d) => d.id);
    const allRecipients = docIds.length > 0
      ? await db
          .select({
            documentId: recipients.documentId,
            email: recipients.email,
            name: recipients.name,
            status: recipients.status,
            signedAt: recipients.signedAt,
          })
          .from(recipients)
          .where(
            // Get recipients for all docs
            eq(recipients.documentId, recipients.documentId)
          )
      : [];

    // Group recipients by document
    const recipientsByDoc = allRecipients.reduce((acc, r) => {
      if (!acc[r.documentId]) acc[r.documentId] = [];
      acc[r.documentId].push(r);
      return acc;
    }, {} as Record<string, typeof allRecipients>);

    // Build CSV
    const headers = [
      "Document ID",
      "Title",
      "Status",
      "Is Template",
      "Created At",
      "Sent At",
      "Expires At",
      "Recipients",
      "Signed By",
    ];

    const rows = docs.map((doc) => {
      const docRecipients = recipientsByDoc[doc.id] || [];
      const recipientEmails = docRecipients.map((r) => r.email).join("; ");
      const signedBy = docRecipients
        .filter((r) => r.status === "signed")
        .map((r) => r.email)
        .join("; ");

      return [
        doc.id,
        `"${(doc.title || "").replace(/"/g, '""')}"`,
        doc.status,
        doc.isTemplate ? "Yes" : "No",
        doc.createdAt?.toISOString() || "",
        doc.sentAt?.toISOString() || "",
        doc.expiresAt?.toISOString() || "",
        `"${recipientEmails}"`,
        `"${signedBy}"`,
      ].join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="documents-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting documents:", error);
    return NextResponse.json(
      { error: "Failed to export documents" },
      { status: 500 }
    );
  }
}
