import Stripe from "stripe";

// Lazy-initialized Stripe client to avoid build errors when env vars aren't set
let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      typescript: true,
    });
  }
  return stripeInstance;
}

// For backwards compatibility
export const stripe = {
  get paymentIntents() { return getStripe().paymentIntents; },
  get checkout() { return getStripe().checkout; },
  get accounts() { return getStripe().accounts; },
  get accountLinks() { return getStripe().accountLinks; },
  get webhooks() { return getStripe().webhooks; },
  get refunds() { return getStripe().refunds; },
};

// Currency formatting
const currencySymbols: Record<string, string> = {
  usd: "$",
  eur: "€",
  gbp: "£",
  cad: "C$",
  aud: "A$",
};

export function formatCurrency(amount: number, currency: string): string {
  const symbol = currencySymbols[currency.toLowerCase()] || currency.toUpperCase();
  return `${symbol}${(amount / 100).toFixed(2)}`;
}

// Convert dollars to cents for Stripe
export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

// Convert cents to dollars
export function fromCents(amount: number): number {
  return amount / 100;
}

// Payment Intent Types
export interface CreatePaymentIntentParams {
  amount: number; // in cents
  currency: string;
  documentId: string;
  recipientId: string;
  recipientEmail?: string;
  stripeAccountId?: string; // For Stripe Connect
  applicationFeeAmount?: number; // Platform fee in cents
  metadata?: Record<string, string>;
}

export interface PaymentIntentResult {
  clientSecret: string;
  paymentIntentId: string;
}

// Create a payment intent
export async function createPaymentIntent({
  amount,
  currency,
  documentId,
  recipientId,
  recipientEmail,
  stripeAccountId,
  applicationFeeAmount,
  metadata = {},
}: CreatePaymentIntentParams): Promise<PaymentIntentResult> {
  const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
    amount,
    currency: currency.toLowerCase(),
    automatic_payment_methods: {
      enabled: true,
    },
    metadata: {
      document_id: documentId,
      recipient_id: recipientId,
      ...metadata,
    },
  };

  // Add receipt email if provided
  if (recipientEmail) {
    paymentIntentParams.receipt_email = recipientEmail;
  }

  // Handle Stripe Connect payments
  if (stripeAccountId) {
    paymentIntentParams.transfer_data = {
      destination: stripeAccountId,
    };
    if (applicationFeeAmount && applicationFeeAmount > 0) {
      paymentIntentParams.application_fee_amount = applicationFeeAmount;
    }
  }

  const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);

  return {
    clientSecret: paymentIntent.client_secret!,
    paymentIntentId: paymentIntent.id,
  };
}

// Checkout Session Types
export interface CreateCheckoutSessionParams {
  amount: number; // in cents
  currency: string;
  documentId: string;
  recipientId: string;
  productName: string;
  productDescription?: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  stripeAccountId?: string;
  applicationFeeAmount?: number;
  metadata?: Record<string, string>;
}

export interface CheckoutSessionResult {
  sessionId: string;
  url: string;
}

// Create a checkout session
export async function createCheckoutSession({
  amount,
  currency,
  documentId,
  recipientId,
  productName,
  productDescription,
  successUrl,
  cancelUrl,
  customerEmail,
  stripeAccountId,
  applicationFeeAmount,
  metadata = {},
}: CreateCheckoutSessionParams): Promise<CheckoutSessionResult> {
  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: productName,
            description: productDescription,
          },
          unit_amount: amount,
        },
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      document_id: documentId,
      recipient_id: recipientId,
      ...metadata,
    },
  };

  if (customerEmail) {
    sessionParams.customer_email = customerEmail;
  }

  // Handle Stripe Connect
  if (stripeAccountId) {
    sessionParams.payment_intent_data = {
      transfer_data: {
        destination: stripeAccountId,
      },
    };
    if (applicationFeeAmount && applicationFeeAmount > 0) {
      sessionParams.payment_intent_data.application_fee_amount = applicationFeeAmount;
    }
  }

  const session = await stripe.checkout.sessions.create(sessionParams);

  return {
    sessionId: session.id,
    url: session.url!,
  };
}

// Retrieve payment intent
export async function getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
  return stripe.paymentIntents.retrieve(paymentIntentId);
}

// Stripe Connect Types
export interface CreateConnectAccountParams {
  email: string;
  userId: string;
  businessType?: "individual" | "company";
  country?: string;
}

export interface ConnectAccountResult {
  accountId: string;
  onboardingUrl: string;
}

// Create a Stripe Connect account and return onboarding link
export async function createConnectAccount({
  email,
  userId,
  businessType = "individual",
  country = "US",
}: CreateConnectAccountParams): Promise<ConnectAccountResult> {
  // Create the connected account
  const account = await stripe.accounts.create({
    type: "express",
    email,
    business_type: businessType,
    country,
    metadata: {
      user_id: userId,
    },
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  });

  // Create an account link for onboarding
  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/stripe-connect?refresh=true`,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/stripe-connect?success=true`,
    type: "account_onboarding",
  });

  return {
    accountId: account.id,
    onboardingUrl: accountLink.url,
  };
}

// Create a new account link for existing account
export async function createAccountLink(accountId: string): Promise<string> {
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/stripe-connect?refresh=true`,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/stripe-connect?success=true`,
    type: "account_onboarding",
  });

  return accountLink.url;
}

// Get Connect account status
export interface ConnectAccountStatus {
  accountId: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  requirements: {
    currentlyDue: string[];
    pastDue: string[];
    eventuallyDue: string[];
  };
}

export async function getConnectAccountStatus(accountId: string): Promise<ConnectAccountStatus> {
  const account = await stripe.accounts.retrieve(accountId);

  return {
    accountId: account.id,
    chargesEnabled: account.charges_enabled ?? false,
    payoutsEnabled: account.payouts_enabled ?? false,
    detailsSubmitted: account.details_submitted ?? false,
    requirements: {
      currentlyDue: account.requirements?.currently_due ?? [],
      pastDue: account.requirements?.past_due ?? [],
      eventuallyDue: account.requirements?.eventually_due ?? [],
    },
  };
}

// Create Stripe Connect login link
export async function createConnectLoginLink(accountId: string): Promise<string> {
  const loginLink = await stripe.accounts.createLoginLink(accountId);
  return loginLink.url;
}

// Webhook signature verification
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

// Refund a payment
export async function refundPayment(
  paymentIntentId: string,
  amount?: number // Optional partial refund amount in cents
): Promise<Stripe.Refund> {
  const refundParams: Stripe.RefundCreateParams = {
    payment_intent: paymentIntentId,
  };

  if (amount) {
    refundParams.amount = amount;
  }

  return stripe.refunds.create(refundParams);
}

// ============================================
// SUBSCRIPTION BILLING
// ============================================

// Plan types
export type PlanId = "free" | "pro" | "business" | "pro_team" | "business_team";
export type AddOnId = "blockchain_audit";

export interface Plan {
  id: PlanId;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  earlyBirdPriceMonthly: number;
  earlyBirdPriceYearly: number;
  stripePriceIdMonthly: string | null;
  stripePriceIdYearly: string | null;
  earlyBirdPriceIdMonthly: string | null;
  earlyBirdPriceIdYearly: string | null;
  features: string[];
  limits: {
    customBranding: boolean;
    removeWatermark: boolean;
    workspaces: number;
    apiAccess: boolean;
    prioritySupport: boolean;
    analytics: boolean;
    maxSeats: number; // -1 for unlimited
    storageGb: number; // -1 for BYOS/unlimited
    maxTemplates: number; // 0 for none, -1 for unlimited
  };
}

export interface AddOn {
  id: AddOnId;
  name: string;
  description: string;
  priceMonthly: number;
  stripePriceIdMonthly: string | null;
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: "Free",
    description: "Self-hosted, forever free",
    priceMonthly: 0,
    priceYearly: 0,
    earlyBirdPriceMonthly: 0,
    earlyBirdPriceYearly: 0,
    stripePriceIdMonthly: null,
    stripePriceIdYearly: null,
    earlyBirdPriceIdMonthly: null,
    earlyBirdPriceIdYearly: null,
    features: [
      "Unlimited users",
      "Unlimited documents",
      "Unlimited signatures",
      "All core features",
      "Bring your own storage",
      "Community support",
    ],
    limits: {
      customBranding: false,
      removeWatermark: false,
      workspaces: 1,
      apiAccess: true,
      prioritySupport: false,
      analytics: false,
      maxSeats: -1, // Unlimited for self-hosted
      storageGb: -1, // BYOS
      maxTemplates: 0, // Cannot create templates
    },
  },
  pro: {
    id: "pro",
    name: "Team",
    description: "For small teams, 10 seats included",
    priceMonthly: 2900, // $29/mo
    priceYearly: 29000, // $290/yr
    earlyBirdPriceMonthly: 1500,
    earlyBirdPriceYearly: 15000,
    stripePriceIdMonthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || null,
    stripePriceIdYearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID || null,
    earlyBirdPriceIdMonthly: process.env.STRIPE_PRO_EARLY_BIRD_MONTHLY_PRICE_ID || null,
    earlyBirdPriceIdYearly: process.env.STRIPE_PRO_EARLY_BIRD_YEARLY_PRICE_ID || null,
    features: [
      "10 team members",
      "5GB storage (monthly) / 10GB (annual)",
      "Hosted by us (no DevOps)",
      "Email sending included",
      "Document tracking",
      "Priority support",
    ],
    limits: {
      customBranding: true,
      removeWatermark: false,
      workspaces: 1,
      apiAccess: true,
      prioritySupport: true,
      analytics: false,
      maxSeats: 10,
      storageGb: 5, // 10GB for annual
      maxTemplates: 10,
    },
  },
  business: {
    id: "business",
    name: "Business",
    description: "Unlimited users for growing teams",
    priceMonthly: 9900, // $99/mo
    priceYearly: 99000, // $990/yr
    earlyBirdPriceMonthly: 5000,
    earlyBirdPriceYearly: 50000,
    stripePriceIdMonthly: process.env.STRIPE_BUSINESS_MONTHLY_PRICE_ID || null,
    stripePriceIdYearly: process.env.STRIPE_BUSINESS_YEARLY_PRICE_ID || null,
    earlyBirdPriceIdMonthly: process.env.STRIPE_BUSINESS_EARLY_BIRD_MONTHLY_PRICE_ID || null,
    earlyBirdPriceIdYearly: process.env.STRIPE_BUSINESS_EARLY_BIRD_YEARLY_PRICE_ID || null,
    features: [
      "Unlimited team members",
      "25GB storage",
      "Everything in Team",
      "Remove OpenProposal branding",
      "Real-time collaboration",
      "Analytics dashboard",
      "CRM integrations",
      "API access",
    ],
    limits: {
      customBranding: true,
      removeWatermark: true,
      workspaces: 10,
      apiAccess: true,
      prioritySupport: true,
      analytics: true,
      maxSeats: -1, // Unlimited
      storageGb: 25,
      maxTemplates: -1, // Unlimited
    },
  },
  // Team Plans (for organizations)
  pro_team: {
    id: "pro_team",
    name: "Pro Team",
    description: "For teams up to 10 members",
    priceMonthly: 2900, // $29/mo
    priceYearly: 29000, // $290/yr (2 months free)
    earlyBirdPriceMonthly: 1500,
    earlyBirdPriceYearly: 15000,
    stripePriceIdMonthly: process.env.STRIPE_PRO_TEAM_MONTHLY_PRICE_ID || null,
    stripePriceIdYearly: process.env.STRIPE_PRO_TEAM_YEARLY_PRICE_ID || null,
    earlyBirdPriceIdMonthly: process.env.STRIPE_PRO_TEAM_EARLY_BIRD_MONTHLY_PRICE_ID || null,
    earlyBirdPriceIdYearly: process.env.STRIPE_PRO_TEAM_EARLY_BIRD_YEARLY_PRICE_ID || null,
    features: [
      "Up to 10 team members",
      "5GB shared storage",
      "Shared Stripe Connect",
      "Team document library",
      "Member permissions",
      "Priority support",
    ],
    limits: {
      customBranding: true,
      removeWatermark: false,
      workspaces: 1,
      apiAccess: true,
      prioritySupport: true,
      analytics: false,
      maxSeats: 10,
      storageGb: 5,
      maxTemplates: 10,
    },
  },
  business_team: {
    id: "business_team",
    name: "Business Team",
    description: "Unlimited team members",
    priceMonthly: 9900, // $99/mo
    priceYearly: 99000, // $990/yr (2 months free)
    earlyBirdPriceMonthly: 5000,
    earlyBirdPriceYearly: 50000,
    stripePriceIdMonthly: process.env.STRIPE_BUSINESS_TEAM_MONTHLY_PRICE_ID || null,
    stripePriceIdYearly: process.env.STRIPE_BUSINESS_TEAM_YEARLY_PRICE_ID || null,
    earlyBirdPriceIdMonthly: process.env.STRIPE_BUSINESS_TEAM_EARLY_BIRD_MONTHLY_PRICE_ID || null,
    earlyBirdPriceIdYearly: process.env.STRIPE_BUSINESS_TEAM_EARLY_BIRD_YEARLY_PRICE_ID || null,
    features: [
      "Unlimited team members",
      "25GB shared storage",
      "Shared Stripe Connect",
      "Remove branding",
      "Analytics dashboard",
      "CRM integrations",
      "API access",
      "Dedicated support",
    ],
    limits: {
      customBranding: true,
      removeWatermark: true,
      workspaces: 10,
      apiAccess: true,
      prioritySupport: true,
      analytics: true,
      maxSeats: -1, // Unlimited
      storageGb: 25,
      maxTemplates: -1, // Unlimited
    },
  },
};

export const ADD_ONS: Record<AddOnId, AddOn> = {
  blockchain_audit: {
    id: "blockchain_audit",
    name: "Blockchain Audit Trail",
    description: "Immutable proof of signing on Base L2",
    priceMonthly: 1900,
    stripePriceIdMonthly: process.env.STRIPE_BLOCKCHAIN_ADDON_PRICE_ID || null,
  },
};

// Get or create Stripe customer
export async function getOrCreateCustomer(
  userId: string,
  email: string,
  name?: string
): Promise<string> {
  const s = getStripe();
  const customers = await s.customers.list({ email, limit: 1 });

  if (customers.data.length > 0) {
    const customer = customers.data[0];
    if (customer.metadata.user_id !== userId) {
      await s.customers.update(customer.id, { metadata: { user_id: userId } });
    }
    return customer.id;
  }

  const customer = await s.customers.create({
    email,
    name,
    metadata: { user_id: userId },
  });

  return customer.id;
}

// Create subscription checkout session
export async function createSubscriptionCheckout({
  userId,
  email,
  priceId,
  successUrl,
  cancelUrl,
  isEarlyBird = false,
  addOnPriceIds = [],
}: {
  userId: string;
  email: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  isEarlyBird?: boolean;
  addOnPriceIds?: string[];
}): Promise<{ sessionId: string; url: string }> {
  const s = getStripe();
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
    { price: priceId, quantity: 1 },
  ];

  for (const addOnPriceId of addOnPriceIds) {
    lineItems.push({ price: addOnPriceId, quantity: 1 });
  }

  const session = await s.checkout.sessions.create({
    mode: "subscription",
    customer_email: email,
    line_items: lineItems,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      user_id: userId,
      is_early_bird: isEarlyBird ? "true" : "false",
    },
    subscription_data: {
      metadata: {
        user_id: userId,
        is_early_bird: isEarlyBird ? "true" : "false",
      },
    },
    allow_promotion_codes: true,
  });

  return { sessionId: session.id, url: session.url! };
}

// Get subscription
export async function getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  return getStripe().subscriptions.retrieve(subscriptionId);
}

// Cancel subscription
export async function cancelSubscription(
  subscriptionId: string,
  immediately = false
): Promise<Stripe.Subscription> {
  const s = getStripe();
  if (immediately) {
    return s.subscriptions.cancel(subscriptionId);
  }
  return s.subscriptions.update(subscriptionId, { cancel_at_period_end: true });
}

// Resume subscription
export async function resumeSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  return getStripe().subscriptions.update(subscriptionId, { cancel_at_period_end: false });
}

// Update subscription plan
export async function updateSubscriptionPlan(
  subscriptionId: string,
  newPriceId: string
): Promise<Stripe.Subscription> {
  const s = getStripe();
  const subscription = await s.subscriptions.retrieve(subscriptionId);

  return s.subscriptions.update(subscriptionId, {
    items: [{ id: subscription.items.data[0].id, price: newPriceId }],
    proration_behavior: "create_prorations",
  });
}

// Get customer subscriptions
export async function getCustomerSubscriptions(customerId: string): Promise<Stripe.Subscription[]> {
  const subscriptions = await getStripe().subscriptions.list({
    customer: customerId,
    status: "all",
    expand: ["data.default_payment_method"],
  });
  return subscriptions.data;
}

// Get customer invoices
export async function getCustomerInvoices(customerId: string, limit = 10): Promise<Stripe.Invoice[]> {
  const invoices = await getStripe().invoices.list({ customer: customerId, limit });
  return invoices.data;
}

// Create billing portal session
export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string
): Promise<string> {
  const session = await getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
  return session.url;
}

// ============================================
// ORGANIZATION/TEAM BILLING
// ============================================

// Create subscription checkout for an organization
export async function createOrganizationSubscriptionCheckout({
  organizationId,
  organizationName,
  userId,
  email,
  priceId,
  successUrl,
  cancelUrl,
  isEarlyBird = false,
  seatLimit,
}: {
  organizationId: string;
  organizationName: string;
  userId: string;
  email: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  isEarlyBird?: boolean;
  seatLimit?: number;
}): Promise<{ sessionId: string; url: string }> {
  const s = getStripe();

  const session = await s.checkout.sessions.create({
    mode: "subscription",
    customer_email: email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      organization_id: organizationId,
      user_id: userId,
      is_early_bird: isEarlyBird ? "true" : "false",
      is_team: "true",
    },
    subscription_data: {
      metadata: {
        organization_id: organizationId,
        user_id: userId,
        is_early_bird: isEarlyBird ? "true" : "false",
        is_team: "true",
        seat_limit: seatLimit?.toString() || "",
      },
      description: `SendProp Team - ${organizationName}`,
    },
    allow_promotion_codes: true,
  });

  return { sessionId: session.id, url: session.url! };
}

// Helper to determine if a plan is a team plan
export function isTeamPlan(planId: PlanId): boolean {
  return planId === "pro_team" || planId === "business_team";
}

// Get plan seat limit
export function getPlanSeatLimit(planId: PlanId): number | null {
  const plan = PLANS[planId];
  if (!plan) return null;
  return plan.limits.maxSeats === -1 ? null : plan.limits.maxSeats;
}

// Get plan storage limit in GB
export function getPlanStorageGb(planId: PlanId): number {
  const plan = PLANS[planId];
  if (!plan) return 0;
  return plan.limits.storageGb === -1 ? Infinity : plan.limits.storageGb;
}
