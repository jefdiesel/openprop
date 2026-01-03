import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { documents, recipients, profiles, payments } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { createPaymentIntent, toCents } from "@/lib/stripe";

export interface CreatePaymentIntentRequest {
  amount: number; // Amount in dollars
  currency: string;
  documentId: string;
  recipientId: string;
}

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreatePaymentIntentRequest;
    const { amount, currency, documentId, recipientId } = body;

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    if (!currency) {
      return NextResponse.json(
        { error: "Currency is required" },
        { status: 400 }
      );
    }

    if (!documentId) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 }
      );
    }

    if (!recipientId) {
      return NextResponse.json(
        { error: "Recipient ID is required" },
        { status: 400 }
      );
    }

    // Verify the document exists and get owner info
    const [document] = await db.select({
      id: documents.id,
      userId: documents.userId,
      title: documents.title,
      settings: documents.settings,
    })
      .from(documents)
      .where(eq(documents.id, documentId))
      .limit(1);

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Verify the recipient exists and belongs to this document
    const [recipient] = await db.select({
      id: recipients.id,
      email: recipients.email,
      name: recipients.name,
      documentId: recipients.documentId,
    })
      .from(recipients)
      .where(and(
        eq(recipients.id, recipientId),
        eq(recipients.documentId, documentId)
      ))
      .limit(1);

    if (!recipient) {
      return NextResponse.json(
        { error: "Recipient not found" },
        { status: 404 }
      );
    }

    // Get document owner's Stripe Connect account if they have one
    const [profile] = await db.select({
      stripeAccountId: profiles.stripeAccountId,
    })
      .from(profiles)
      .where(eq(profiles.id, document.userId))
      .limit(1);

    // Calculate platform fee (e.g., 2.5% of transaction)
    const amountInCents = toCents(amount);
    const platformFeePercent = 0.025; // 2.5%
    const applicationFeeAmount = profile?.stripeAccountId
      ? Math.round(amountInCents * platformFeePercent)
      : undefined;

    // Create payment intent
    const { clientSecret, paymentIntentId } = await createPaymentIntent({
      amount: amountInCents,
      currency,
      documentId,
      recipientId,
      recipientEmail: recipient.email,
      stripeAccountId: profile?.stripeAccountId || undefined,
      applicationFeeAmount,
      metadata: {
        document_title: document.title,
        recipient_name: recipient.name || "",
        recipient_email: recipient.email,
      },
    });

    // Create payment record in database
    await db.insert(payments).values({
      documentId,
      recipientId,
      stripePaymentIntentId: paymentIntentId,
      amount: amountInCents,
      currency: currency.toLowerCase(),
      status: "pending",
    });

    return NextResponse.json({
      clientSecret,
      paymentIntentId,
    } as CreatePaymentIntentResponse);
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return NextResponse.json(
      { error: "Failed to create payment intent" },
      { status: 500 }
    );
  }
}
