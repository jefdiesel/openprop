import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { documents, recipients, payments, profiles, subscriptions, organizations } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import {
  X402_CONFIG,
  isX402Configured,
  formatX402Price,
  generatePaymentRequirement,
  parsePaymentSignature,
  verifyPaymentWithFacilitator,
  settlePaymentWithFacilitator,
} from "@/lib/x402";

// Helper to get the wallet address for a document owner
async function getDocumentOwnerWallet(documentId: string): Promise<string | null> {
  // Get the document with its owner info
  const [doc] = await db
    .select({
      userId: documents.userId,
      organizationId: documents.organizationId,
    })
    .from(documents)
    .where(eq(documents.id, documentId))
    .limit(1);

  if (!doc) return null;

  // If document belongs to an organization, get org wallet
  if (doc.organizationId) {
    const [org] = await db
      .select({ walletAddress: organizations.walletAddress })
      .from(organizations)
      .where(eq(organizations.id, doc.organizationId))
      .limit(1);

    if (org?.walletAddress) return org.walletAddress;
  }

  // Otherwise get user's wallet from profile
  const [profile] = await db
    .select({ walletAddress: profiles.walletAddress })
    .from(profiles)
    .where(eq(profiles.id, doc.userId))
    .limit(1);

  return profile?.walletAddress || null;
}

export interface X402PaymentRequest {
  type: "document" | "subscription";
  // For document payments
  documentId?: string;
  recipientId?: string;
  // For subscription payments
  planId?: string;
  billingInterval?: "monthly" | "yearly";
  // Common
  amount: number; // in dollars
}

// GET: Get payment requirement (returns 402 status with payment details)
export async function GET(request: NextRequest) {
  if (!isX402Configured()) {
    return NextResponse.json(
      { error: "x402 payments are not configured" },
      { status: 503 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get("type") as "document" | "subscription";
  const documentId = searchParams.get("documentId");
  const planId = searchParams.get("planId");
  const billingInterval = searchParams.get("billingInterval") as "monthly" | "yearly";

  if (!type) {
    return NextResponse.json(
      { error: "Payment type is required" },
      { status: 400 }
    );
  }

  let amount: number;
  let description: string;
  let resource: string;

  let payTo: string | undefined;

  if (type === "document") {
    if (!documentId) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 }
      );
    }

    // Get document details
    const [document] = await db
      .select({
        id: documents.id,
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

    const settings = document.settings as Record<string, unknown> | null;
    amount = (settings?.paymentAmount as number) || 0;

    if (amount <= 0) {
      return NextResponse.json(
        { error: "No payment required for this document" },
        { status: 400 }
      );
    }

    // Get the document owner's wallet address
    const ownerWallet = await getDocumentOwnerWallet(documentId);
    if (!ownerWallet) {
      return NextResponse.json(
        { error: "Document owner has not configured a wallet address for receiving USDC payments" },
        { status: 400 }
      );
    }
    payTo = ownerWallet;

    description = `Payment for document: ${document.title}`;
    resource = `/api/payments/x402/document/${documentId}`;
  } else if (type === "subscription") {
    if (!planId || !billingInterval) {
      return NextResponse.json(
        { error: "Plan ID and billing interval are required" },
        { status: 400 }
      );
    }

    // Get plan pricing
    const { PLANS } = await import("@/lib/stripe");
    const plan = PLANS[planId as keyof typeof PLANS];

    if (!plan) {
      return NextResponse.json(
        { error: "Invalid plan" },
        { status: 400 }
      );
    }

    // Convert from cents to dollars
    amount = billingInterval === "yearly"
      ? plan.priceYearly / 100
      : plan.priceMonthly / 100;

    description = `${plan.name} subscription (${billingInterval})`;
    resource = `/api/payments/x402/subscription/${planId}`;
  } else {
    return NextResponse.json(
      { error: "Invalid payment type" },
      { status: 400 }
    );
  }

  const requirement = generatePaymentRequirement(amount, resource, description, payTo);

  // Return 402 Payment Required with payment details
  return NextResponse.json(
    {
      paymentRequired: true,
      requirement,
      network: X402_CONFIG.network,
      payTo: requirement.payTo,
    },
    {
      status: 402,
      headers: {
        "X-Payment-Required": JSON.stringify(requirement),
      },
    }
  );
}

// POST: Process x402 payment
export async function POST(request: NextRequest) {
  if (!isX402Configured()) {
    return NextResponse.json(
      { error: "x402 payments are not configured" },
      { status: 503 }
    );
  }

  try {
    // Parse payment signature from header
    const paymentPayload = parsePaymentSignature(request);

    if (!paymentPayload) {
      return NextResponse.json(
        { error: "Missing payment signature" },
        { status: 402 }
      );
    }

    const body = (await request.json()) as X402PaymentRequest;
    const { type, documentId, recipientId, planId, billingInterval, amount } = body;

    if (!type || !amount) {
      return NextResponse.json(
        { error: "Payment type and amount are required" },
        { status: 400 }
      );
    }

    // Determine resource and payTo based on payment type
    let resource: string;
    let payTo: string | undefined;

    if (type === "document" && documentId) {
      resource = `/api/payments/x402/document/${documentId}`;
      // Get document owner's wallet for verification
      payTo = await getDocumentOwnerWallet(documentId) || undefined;
      if (!payTo) {
        return NextResponse.json(
          { error: "Document owner wallet not configured" },
          { status: 400 }
        );
      }
    } else {
      resource = `/api/payments/x402/subscription/${planId}`;
      // Subscription payments go to platform wallet
    }

    // Verify payment with facilitator
    const verification = await verifyPaymentWithFacilitator(
      paymentPayload,
      amount,
      resource,
      payTo
    );

    if (!verification.valid) {
      return NextResponse.json(
        { error: verification.error || "Payment verification failed" },
        { status: 402 }
      );
    }

    // Settle payment
    const settlement = await settlePaymentWithFacilitator(paymentPayload);

    if (!settlement.success) {
      return NextResponse.json(
        { error: settlement.error || "Payment settlement failed" },
        { status: 500 }
      );
    }

    // Record payment in database
    const fromAddress = paymentPayload.payload.authorization.from;

    if (type === "document" && documentId && recipientId) {
      // Create payment record for document
      await db.insert(payments).values({
        documentId,
        recipientId,
        amount: Math.round(amount * 100), // Convert to cents for consistency
        currency: "usdc",
        status: "succeeded",
        paymentMethod: "x402",
        metadata: {
          transactionHash: settlement.transactionHash,
          fromAddress: fromAddress,
          network: X402_CONFIG.network,
        },
      });

      // Update recipient payment status
      await db
        .update(recipients)
        .set({
          paymentStatus: "succeeded",
          paymentMethod: "x402",
        })
        .where(eq(recipients.id, recipientId));

      return NextResponse.json({
        success: true,
        paymentId: verification.paymentId,
        transactionHash: settlement.transactionHash,
        type: "document",
        documentId,
      });
    } else if (type === "subscription" && planId) {
      // Handle subscription payment
      const session = await auth();

      if (!session?.user?.id) {
        return NextResponse.json(
          { error: "Authentication required for subscription payments" },
          { status: 401 }
        );
      }

      // Update or create subscription
      const existingSub = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.userId, session.user.id),
      });

      const periodEnd = new Date();
      if (billingInterval === "yearly") {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      } else {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      }

      if (existingSub) {
        await db
          .update(subscriptions)
          .set({
            planId: planId as "free" | "pro" | "business",
            status: "active",
            billingInterval: billingInterval || "monthly",
            currentPeriodEnd: periodEnd,
            updatedAt: new Date(),
            // Store x402 tx hash in stripeSubscriptionId with prefix
            stripeSubscriptionId: `x402:${settlement.transactionHash}`,
          })
          .where(eq(subscriptions.id, existingSub.id));
      } else {
        await db.insert(subscriptions).values({
          userId: session.user.id,
          planId: planId as "free" | "pro" | "business",
          status: "active",
          billingInterval: billingInterval || "monthly",
          currentPeriodStart: new Date(),
          currentPeriodEnd: periodEnd,
          // Store x402 tx hash in stripeSubscriptionId with prefix
          stripeSubscriptionId: `x402:${settlement.transactionHash}`,
        });
      }

      return NextResponse.json({
        success: true,
        paymentId: verification.paymentId,
        transactionHash: settlement.transactionHash,
        type: "subscription",
        planId,
      });
    }

    return NextResponse.json(
      { error: "Invalid payment configuration" },
      { status: 400 }
    );
  } catch (error) {
    console.error("x402 payment error:", error);
    return NextResponse.json(
      { error: "Payment processing failed" },
      { status: 500 }
    );
  }
}
