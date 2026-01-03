"use client";

/**
 * x402 Client-side Utilities
 *
 * Handles wallet connection and payment signing for x402 payments.
 */

import { createPublicClient, http, formatUnits, type Address } from "viem";
import { base, baseSepolia } from "viem/chains";
import type { X402Network, X402WalletInfo, X402PaymentRequirement } from "./types";

// USDC ABI (minimal for balance check)
const USDC_ABI = [
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// USDC addresses
const USDC_ADDRESSES: Record<X402Network, Address> = {
  base: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  "base-sepolia": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
};

// Get viem chain config
function getChain(network: X402Network) {
  return network === "base" ? base : baseSepolia;
}

// Create public client for reading blockchain data
function createClient(network: X402Network) {
  return createPublicClient({
    chain: getChain(network),
    transport: http(),
  });
}

// Check if window.ethereum is available
export function isWalletAvailable(): boolean {
  return typeof window !== "undefined" && !!window.ethereum;
}

// Request wallet connection
export async function connectWallet(): Promise<string | null> {
  if (!isWalletAvailable()) {
    return null;
  }

  try {
    const accounts = await window.ethereum!.request({
      method: "eth_requestAccounts",
    }) as string[];
    return accounts[0] || null;
  } catch {
    return null;
  }
}

// Get connected wallet address
export async function getWalletAddress(): Promise<string | null> {
  if (!isWalletAvailable()) {
    return null;
  }

  try {
    const accounts = await window.ethereum!.request({
      method: "eth_accounts",
    }) as string[];
    return accounts[0] || null;
  } catch {
    return null;
  }
}

// Get USDC balance for address
export async function getUsdcBalance(
  address: string,
  network: X402Network = "base"
): Promise<string> {
  try {
    const client = createClient(network);
    const balance = await client.readContract({
      address: USDC_ADDRESSES[network],
      abi: USDC_ABI,
      functionName: "balanceOf",
      args: [address as Address],
    });
    return formatUnits(balance, 6); // USDC has 6 decimals
  } catch {
    return "0";
  }
}

// Get full wallet info
export async function getWalletInfo(
  network: X402Network = "base"
): Promise<X402WalletInfo | null> {
  const address = await getWalletAddress();
  if (!address) {
    return null;
  }

  const balance = await getUsdcBalance(address, network);

  return {
    address,
    balance,
    network,
    isConnected: true,
  };
}

// Switch to correct network
export async function switchToNetwork(network: X402Network): Promise<boolean> {
  if (!isWalletAvailable()) {
    return false;
  }

  const chainId = network === "base" ? "0x2105" : "0x14a34"; // Base: 8453, Base Sepolia: 84532

  try {
    await window.ethereum!.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId }],
    });
    return true;
  } catch (error: unknown) {
    // Chain not added, try to add it
    if ((error as { code?: number })?.code === 4902) {
      try {
        const chain = getChain(network);
        await window.ethereum!.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId,
              chainName: chain.name,
              nativeCurrency: chain.nativeCurrency,
              rpcUrls: [chain.rpcUrls.default.http[0]],
              blockExplorerUrls: [chain.blockExplorers?.default.url],
            },
          ],
        });
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
}

// Make x402 payment request
// This function handles the 402 payment flow manually since the x402-fetch
// library has complex type requirements
export async function makeX402Payment(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  if (!isWalletAvailable()) {
    throw new Error("No wallet available");
  }

  // First request to get payment requirements
  const initialResponse = await fetch(url, options);

  // If not 402, return the response as-is
  if (initialResponse.status !== 402) {
    return initialResponse;
  }

  // Get payment requirements from response
  const paymentData = await initialResponse.json();

  if (!paymentData.requirement) {
    throw new Error("No payment requirement in 402 response");
  }

  const requirement = paymentData.requirement;

  // Get the connected wallet address
  const address = await getWalletAddress();
  if (!address) {
    throw new Error("No wallet connected");
  }

  // Parse the amount from requirement (e.g., "$10.00" -> 10000000 for USDC)
  const priceStr = requirement.maxAmountRequired.replace(/[$,]/g, "");
  const amountInUsdc = Math.round(parseFloat(priceStr) * 1_000_000);

  // Create the payment authorization message
  const message = JSON.stringify({
    from: address,
    to: requirement.payTo,
    value: amountInUsdc.toString(),
    resource: requirement.resource,
    timestamp: Date.now(),
  });

  // Request signature from wallet
  const signature = await window.ethereum!.request({
    method: "personal_sign",
    params: [message, address],
  }) as string;

  // Create payment payload
  const paymentPayload = {
    x402Version: 1,
    scheme: "exact",
    network: requirement.network,
    payload: {
      signature,
      authorization: {
        from: address,
        to: requirement.payTo,
        value: amountInUsdc.toString(),
        validAfter: "0",
        validBefore: (Date.now() + 300000).toString(), // 5 minutes
        nonce: Date.now().toString(),
      },
    },
  };

  // Retry with payment header
  const newOptions: RequestInit = {
    ...options,
    headers: {
      ...(options.headers || {}),
      "X-Payment": JSON.stringify(paymentPayload),
      "Content-Type": "application/json",
    },
  };

  return fetch(url, newOptions);
}

// Format USDC amount for display
export function formatUsdcDisplay(amount: string | number): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(num);
}

// Parse price from x402 requirement
export function parseX402Price(requirement: X402PaymentRequirement): number {
  const priceStr = requirement.maxAmountRequired.replace(/[$,]/g, "");
  return parseFloat(priceStr);
}

// Extend Window interface for ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
      isMetaMask?: boolean;
      isCoinbaseWallet?: boolean;
    };
  }
}
