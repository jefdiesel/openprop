/**
 * x402 Server-side Utilities
 */

import { X402_CONFIG, formatX402Price } from "./config";
import type {
  X402PaymentRequirement,
  X402PaymentPayload,
  X402VerificationResult,
  X402Network,
} from "./types";

// Generate payment requirement for a resource
export function generatePaymentRequirement(
  amount: number, // in dollars
  resource: string,
  description: string
): X402PaymentRequirement {
  return {
    scheme: "exact",
    network: X402_CONFIG.network,
    maxAmountRequired: formatX402Price(amount),
    resource,
    description,
    mimeType: "application/json",
    payTo: X402_CONFIG.payToAddress,
    maxTimeoutSeconds: X402_CONFIG.paymentTimeoutSeconds,
    asset: "USDC",
  };
}

// Create 402 Payment Required response headers
export function create402Headers(
  requirement: X402PaymentRequirement
): Headers {
  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  headers.set("X-Payment-Required", JSON.stringify(requirement));
  return headers;
}

// Parse payment signature from request
export function parsePaymentSignature(
  request: Request
): X402PaymentPayload | null {
  const paymentHeader = request.headers.get("X-Payment") ||
    request.headers.get("X-Payment-Signature");

  if (!paymentHeader) {
    return null;
  }

  try {
    return JSON.parse(paymentHeader) as X402PaymentPayload;
  } catch {
    return null;
  }
}

// Verify payment with facilitator
export async function verifyPaymentWithFacilitator(
  payload: X402PaymentPayload,
  expectedAmount: number,
  expectedResource: string
): Promise<X402VerificationResult> {
  try {
    const response = await fetch(`${X402_CONFIG.facilitatorUrl}/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(X402_CONFIG.cdpApiKeyId && {
          "X-CDP-API-Key-Id": X402_CONFIG.cdpApiKeyId,
          "X-CDP-API-Key-Secret": X402_CONFIG.cdpApiKeySecret,
        }),
      },
      body: JSON.stringify({
        payload,
        expectedAmount: formatX402Price(expectedAmount),
        expectedResource,
        expectedPayTo: X402_CONFIG.payToAddress,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return {
        valid: false,
        error: `Facilitator verification failed: ${error}`,
      };
    }

    const result = await response.json();
    return {
      valid: true,
      paymentId: result.paymentId,
      transactionHash: result.transactionHash,
    };
  } catch (error) {
    return {
      valid: false,
      error: `Verification error: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

// Settle payment with facilitator
export async function settlePaymentWithFacilitator(
  payload: X402PaymentPayload
): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
  try {
    const response = await fetch(`${X402_CONFIG.facilitatorUrl}/settle`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(X402_CONFIG.cdpApiKeyId && {
          "X-CDP-API-Key-Id": X402_CONFIG.cdpApiKeyId,
          "X-CDP-API-Key-Secret": X402_CONFIG.cdpApiKeySecret,
        }),
      },
      body: JSON.stringify({ payload }),
    });

    if (!response.ok) {
      const error = await response.text();
      return {
        success: false,
        error: `Settlement failed: ${error}`,
      };
    }

    const result = await response.json();
    return {
      success: true,
      transactionHash: result.transactionHash,
    };
  } catch (error) {
    return {
      success: false,
      error: `Settlement error: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

// Create payment requirement for document payment
export function createDocumentPaymentRequirement(
  documentId: string,
  documentTitle: string,
  amount: number
): X402PaymentRequirement {
  return generatePaymentRequirement(
    amount,
    `/api/payments/x402/document/${documentId}`,
    `Payment for document: ${documentTitle}`
  );
}

// Create payment requirement for subscription
export function createSubscriptionPaymentRequirement(
  planId: string,
  planName: string,
  amount: number,
  interval: "monthly" | "yearly"
): X402PaymentRequirement {
  return generatePaymentRequirement(
    amount,
    `/api/payments/x402/subscription/${planId}`,
    `${planName} subscription (${interval})`
  );
}
