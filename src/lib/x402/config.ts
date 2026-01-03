/**
 * x402 Configuration
 */

import type { X402Network } from "./types";

// Environment configuration
export const X402_CONFIG = {
  // Recipient wallet address for payments (set in env)
  payToAddress: process.env.X402_PAY_TO_ADDRESS || "",

  // Network to use (base for production, base-sepolia for testing)
  network: (process.env.X402_NETWORK || "base") as X402Network,

  // Coinbase Developer Platform API keys for facilitator
  cdpApiKeyId: process.env.CDP_API_KEY_ID || "",
  cdpApiKeySecret: process.env.CDP_API_KEY_SECRET || "",

  // Whether x402 payments are enabled
  enabled: process.env.X402_ENABLED === "true",

  // Facilitator URL (Coinbase's hosted facilitator)
  facilitatorUrl:
    process.env.X402_FACILITATOR_URL ||
    "https://x402.org/facilitator",

  // Payment timeout in seconds
  paymentTimeoutSeconds: 300, // 5 minutes

  // USDC contract addresses
  usdcAddresses: {
    base: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    "base-sepolia": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  } as Record<X402Network, string>,
} as const;

// Get USDC address for current network
export function getUsdcAddress(): string {
  return X402_CONFIG.usdcAddresses[X402_CONFIG.network];
}

// Format amount to USDC (6 decimals)
export function formatToUsdc(amountInDollars: number): bigint {
  return BigInt(Math.round(amountInDollars * 1_000_000));
}

// Format USDC to dollars
export function formatFromUsdc(amountInUsdc: bigint): number {
  return Number(amountInUsdc) / 1_000_000;
}

// Format price string for x402
export function formatX402Price(amountInDollars: number): string {
  return `$${amountInDollars.toFixed(2)}`;
}

// Validate configuration
export function isX402Configured(): boolean {
  return (
    X402_CONFIG.enabled &&
    !!X402_CONFIG.payToAddress &&
    X402_CONFIG.payToAddress.startsWith("0x") &&
    X402_CONFIG.payToAddress.length === 42
  );
}

// Get network display name
export function getNetworkDisplayName(): string {
  return X402_CONFIG.network === "base" ? "Base" : "Base Sepolia (Testnet)";
}
