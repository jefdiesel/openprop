import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { constructWebhookEvent, stripe, getStripe, getPlanSeatLimit } from "@/lib/stripe";
import { db } from "@/lib/db";
import { documents, recipients, payments, documentEvents, profiles, subscriptions, earlyBirdSlots, organizations } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";

// Disable body parsing for webhook signature verification
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    console.error("Missing Stripe signature");
    return NextResponse.json(
      { error: "Missing signature" },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("Missing STRIPE_WEBHOOK_SECRET");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = constructWebhookEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentSucceeded(paymentIntent);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentFailed(paymentIntent);
        break;
      }

      case "payment_intent.processing": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentProcessing(paymentIntent);
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        await handleChargeRefunded(charge);
        break;
      }

      case "account.updated": {
        const account = event.data.object as Stripe.Account;
        await handleAccountUpdated(account);
        break;
      }

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription") {
          await handleSubscriptionCheckoutCompleted(session);
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const documentId = paymentIntent.metadata.document_id;
  const recipientId = paymentIntent.metadata.recipient_id;

  if (!documentId || !recipientId) {
    console.error("Missing document_id or recipient_id in payment intent metadata");
    return;
  }

  // Update payment record
  await db.update(payments)
    .set({ status: "succeeded" })
    .where(eq(payments.stripePaymentIntentId, paymentIntent.id));

  // Update recipient payment status for dashboard display
  await db.update(recipients)
    .set({
      paymentStatus: "succeeded",
      paymentAmount: paymentIntent.amount,
      paymentIntentId: paymentIntent.id,
    })
    .where(eq(recipients.id, recipientId));

  // Log the event
  await db.insert(documentEvents).values({
    documentId,
    recipientId,
    eventType: "payment_succeeded",
    eventData: {
      payment_intent_id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    },
  });

  // Check if document should be marked as completed
  await checkAndUpdateDocumentStatus(documentId);
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  const documentId = paymentIntent.metadata.document_id;
  const recipientId = paymentIntent.metadata.recipient_id;

  // Update payment record
  await db.update(payments)
    .set({ status: "failed" })
    .where(eq(payments.stripePaymentIntentId, paymentIntent.id));

  // Update recipient payment status
  if (recipientId) {
    await db.update(recipients)
      .set({ paymentStatus: "failed" })
      .where(eq(recipients.id, recipientId));
  }

  // Log the event
  if (documentId) {
    await db.insert(documentEvents).values({
      documentId,
      recipientId: recipientId || null,
      eventType: "payment_failed",
      eventData: {
        payment_intent_id: paymentIntent.id,
        error: paymentIntent.last_payment_error?.message,
      },
    });
  }
}

async function handlePaymentIntentProcessing(paymentIntent: Stripe.PaymentIntent) {
  await db.update(payments)
    .set({ status: "processing" })
    .where(eq(payments.stripePaymentIntentId, paymentIntent.id));
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  if (!charge.payment_intent) return;

  const paymentIntentId = typeof charge.payment_intent === "string"
    ? charge.payment_intent
    : charge.payment_intent.id;

  // Get the payment intent to find the document
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  const documentId = paymentIntent.metadata.document_id;
  const recipientId = paymentIntent.metadata.recipient_id;

  // Update payment record
  await db.update(payments)
    .set({ status: "refunded" })
    .where(eq(payments.stripePaymentIntentId, paymentIntentId));

  // Update recipient payment status
  if (recipientId) {
    await db.update(recipients)
      .set({ paymentStatus: "refunded" })
      .where(eq(recipients.id, recipientId));
  }

  // Log the event
  if (documentId) {
    await db.insert(documentEvents).values({
      documentId,
      recipientId: recipientId || null,
      eventType: "payment_refunded",
      eventData: {
        payment_intent_id: paymentIntentId,
        amount_refunded: charge.amount_refunded,
        currency: charge.currency,
      },
    });
  }
}

async function handleAccountUpdated(account: Stripe.Account) {
  const userId = account.metadata?.user_id;
  if (!userId) {
    console.log("No user_id in account metadata");
    return;
  }

  // Update profile with connect account status
  await db.update(profiles)
    .set({
      stripeAccountId: account.id,
      stripeAccountEnabled: account.charges_enabled && account.payouts_enabled,
    })
    .where(eq(profiles.id, userId));
}

async function checkAndUpdateDocumentStatus(documentId: string) {
  // Get document
  const [document] = await db.select({ id: documents.id, status: documents.status })
    .from(documents)
    .where(eq(documents.id, documentId))
    .limit(1);

  if (!document) return;

  // Get all recipients
  const recipientsList = await db.select({ id: recipients.id, status: recipients.status, role: recipients.role })
    .from(recipients)
    .where(eq(recipients.documentId, documentId));

  // Check if all signers have signed
  const signers = recipientsList.filter((r) => r.role === "signer");
  const allSigned = signers.length > 0 && signers.every((r) => r.status === "signed");

  if (!allSigned) return;

  // Check if payment is required and completed
  const paymentsList = await db.select({ status: payments.status })
    .from(payments)
    .where(eq(payments.documentId, documentId));

  const paymentRequired = paymentsList.length > 0;
  const paymentCompleted = !paymentRequired || paymentsList.some((p) => p.status === "succeeded");

  // Update document status if all conditions are met
  if (allSigned && paymentCompleted) {
    await db.update(documents)
      .set({ status: "completed" })
      .where(eq(documents.id, documentId));
  }
}

async function handleSubscriptionCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id;
  const organizationId = session.metadata?.organization_id;
  const isEarlyBird = session.metadata?.is_early_bird === "true";
  const isTeam = session.metadata?.is_team === "true";
  const subscriptionId = session.subscription as string;
  const customerId = session.customer as string;

  if (!subscriptionId) {
    console.error("Missing subscription in checkout session");
    return;
  }

  // Either userId or organizationId should be present
  if (!userId && !organizationId) {
    console.error("Missing user_id or organization_id in checkout session");
    return;
  }

  // Get subscription details from Stripe
  const subscriptionData = await getStripe().subscriptions.retrieve(subscriptionId);
  const priceId = subscriptionData.items.data[0]?.price.id;

  // Determine plan from price ID
  let planId: "pro" | "business" | "pro_team" | "business_team" = "pro";
  if (isTeam || organizationId) {
    if (priceId?.includes("business")) {
      planId = "business_team";
    } else {
      planId = "pro_team";
    }
  } else {
    if (priceId?.includes("business")) {
      planId = "business";
    }
  }

  // Get seat limit for team plans
  const seatLimit = getPlanSeatLimit(planId);

  // Extract period timestamps (Stripe v20+ uses different property names)
  const periodStart = (subscriptionData as unknown as { current_period_start?: number }).current_period_start;
  const periodEnd = (subscriptionData as unknown as { current_period_end?: number }).current_period_end;

  const subscriptionValues = {
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscriptionId,
    planId,
    status: subscriptionData.status as "active" | "canceled" | "past_due" | "trialing" | "incomplete" | "incomplete_expired",
    isEarlyBird,
    billingInterval: subscriptionData.items.data[0]?.price.recurring?.interval === "year" ? "yearly" : "monthly" as "monthly" | "yearly",
    seatLimit,
    currentPeriodStart: periodStart ? new Date(periodStart * 1000) : null,
    currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
    cancelAtPeriodEnd: subscriptionData.cancel_at_period_end,
    updatedAt: new Date(),
  };

  if (organizationId) {
    // Organization subscription
    const [existingSub] = await db.select({ id: subscriptions.id })
      .from(subscriptions)
      .where(eq(subscriptions.organizationId, organizationId))
      .limit(1);

    if (existingSub) {
      await db.update(subscriptions)
        .set(subscriptionValues)
        .where(eq(subscriptions.organizationId, organizationId));
    } else {
      await db.insert(subscriptions).values({
        ...subscriptionValues,
        organizationId,
        userId: null,
      });
    }
  } else if (userId) {
    // User subscription
    const [existingSub] = await db.select({ id: subscriptions.id })
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .limit(1);

    if (existingSub) {
      await db.update(subscriptions)
        .set(subscriptionValues)
        .where(eq(subscriptions.userId, userId));
    } else {
      await db.insert(subscriptions).values({
        ...subscriptionValues,
        userId,
        organizationId: null,
      });
    }

    // If early bird, claim a slot
    if (isEarlyBird) {
      const [{ total }] = await db.select({ total: count() }).from(earlyBirdSlots);
      const slotNumber = (total || 0) + 1;

      if (slotNumber <= 100) {
        await db.insert(earlyBirdSlots).values({
          userId,
          slotNumber,
          planId: planId as "free" | "pro" | "business",
        });
      }
    }
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.user_id;
  const organizationId = subscription.metadata?.organization_id;

  if (!userId && !organizationId) {
    console.log("No user_id or organization_id in subscription metadata");
    return;
  }

  // Extract period timestamps (Stripe v20+ uses different property names)
  const periodStart = (subscription as unknown as { current_period_start?: number }).current_period_start;
  const periodEnd = (subscription as unknown as { current_period_end?: number }).current_period_end;

  await db.update(subscriptions)
    .set({
      status: subscription.status as "active" | "canceled" | "past_due" | "trialing" | "incomplete" | "incomplete_expired",
      currentPeriodStart: periodStart ? new Date(periodStart * 1000) : null,
      currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      canceledAt: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000)
        : null,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await db.update(subscriptions)
    .set({
      status: "canceled",
      canceledAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  // Extract subscription from invoice (Stripe v20+ uses different property structure)
  const invoiceSubscription = (invoice as unknown as { subscription?: string | { id: string } }).subscription;
  if (!invoiceSubscription) return;

  const subscriptionId = typeof invoiceSubscription === "string"
    ? invoiceSubscription
    : invoiceSubscription.id;

  await db.update(subscriptions)
    .set({
      status: "past_due",
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, subscriptionId));
}
