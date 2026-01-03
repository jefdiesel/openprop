/**
 * x402 Payment Types
 */

// Supported networks for x402 payments
export type X402Network = "base" | "base-sepolia";

// Payment status
export type X402PaymentStatus = "pending" | "completed" | "failed" | "expired";

// Payment requirement returned to client
export interface X402PaymentRequirement {
  scheme: string;
  network: X402Network;
  maxAmountRequired: string;
  resource: string;
  description: string;
  mimeType: string;
  payTo: string;
  maxTimeoutSeconds: number;
  asset: string;
  extra?: Record<string, unknown>;
}

// Payment payload sent by client
export interface X402PaymentPayload {
  x402Version: number;
  scheme: string;
  network: X402Network;
  payload: {
    signature: string;
    authorization: {
      from: string;
      to: string;
      value: string;
      validAfter: string;
      validBefore: string;
      nonce: string;
    };
  };
}

// Payment record stored in database
export interface X402PaymentRecord {
  id: string;
  documentId?: string;
  subscriptionId?: string;
  recipientId?: string;
  userId?: string;
  paymentType: "document" | "subscription";
  amount: number; // in cents (USDC has 6 decimals, we convert)
  currency: "USDC";
  network: X402Network;
  fromAddress: string;
  toAddress: string;
  transactionHash?: string;
  status: X402PaymentStatus;
  createdAt: Date;
  completedAt?: Date;
  metadata?: Record<string, unknown>;
}

// Payment intent for document payments
export interface X402DocumentPaymentIntent {
  documentId: string;
  recipientId: string;
  amount: number; // in dollars
  description: string;
}

// Payment intent for subscriptions
export interface X402SubscriptionPaymentIntent {
  userId: string;
  planId: string;
  billingInterval: "monthly" | "yearly";
  amount: number; // in dollars
  description: string;
}

// Verification result
export interface X402VerificationResult {
  valid: boolean;
  paymentId?: string;
  transactionHash?: string;
  error?: string;
}

// Client wallet info
export interface X402WalletInfo {
  address: string;
  balance: string; // USDC balance formatted
  network: X402Network;
  isConnected: boolean;
}

// Price configuration for x402
export interface X402PriceConfig {
  price: string; // e.g., "$0.01" or "0.01"
  network: X402Network;
  config: {
    description: string;
  };
}
