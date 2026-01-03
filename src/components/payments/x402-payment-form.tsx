"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  AlertCircle,
  Wallet,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import {
  isWalletAvailable,
  connectWallet,
  getWalletInfo,
  switchToNetwork,
  makeX402Payment,
  formatUsdcDisplay,
} from "@/lib/x402/client";
import type { X402Network } from "@/lib/x402/types";

export interface X402PaymentFormProps {
  amount: number; // in dollars
  type: "document" | "subscription";
  documentId?: string;
  recipientId?: string;
  planId?: string;
  billingInterval?: "monthly" | "yearly";
  network?: X402Network;
  onSuccess?: (transactionHash: string) => void;
  onError?: (error: string) => void;
}

export function X402PaymentForm({
  amount,
  type,
  documentId,
  recipientId,
  planId,
  billingInterval,
  network = "base",
  onSuccess,
  onError,
}: X402PaymentFormProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [usdcBalance, setUsdcBalance] = useState<string>("0");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Check wallet connection on mount
  useEffect(() => {
    async function checkWallet() {
      const info = await getWalletInfo(network);
      if (info) {
        setWalletAddress(info.address);
        setUsdcBalance(info.balance);
      }
    }
    checkWallet();
  }, [network]);

  // Refresh balance
  const refreshBalance = useCallback(async () => {
    if (walletAddress) {
      const info = await getWalletInfo(network);
      if (info) {
        setUsdcBalance(info.balance);
      }
    }
  }, [walletAddress, network]);

  // Handle wallet connection
  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      if (!isWalletAvailable()) {
        setError("Please install a Web3 wallet like MetaMask or Coinbase Wallet");
        return;
      }

      // Switch to correct network
      const switched = await switchToNetwork(network);
      if (!switched) {
        setError(`Please switch to ${network === "base" ? "Base" : "Base Sepolia"} network`);
        return;
      }

      const address = await connectWallet();
      if (address) {
        setWalletAddress(address);
        const info = await getWalletInfo(network);
        if (info) {
          setUsdcBalance(info.balance);
        }
      } else {
        setError("Failed to connect wallet");
      }
    } catch (err) {
      setError("Failed to connect wallet");
      console.error(err);
    } finally {
      setIsConnecting(false);
    }
  };

  // Handle payment
  const handlePayment = async () => {
    if (!walletAddress) {
      setError("Please connect your wallet first");
      return;
    }

    // Check balance
    const balanceNum = parseFloat(usdcBalance);
    if (balanceNum < amount) {
      setError(`Insufficient USDC balance. You need ${formatUsdcDisplay(amount)} but have ${formatUsdcDisplay(usdcBalance)}`);
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Build request body
      const requestBody = {
        type,
        amount,
        ...(type === "document" && { documentId, recipientId }),
        ...(type === "subscription" && { planId, billingInterval }),
      };

      // Make x402 payment request
      const response = await makeX402Payment("/api/payments/x402", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Payment failed");
      }

      const result = await response.json();

      if (result.success) {
        setSuccess(result.transactionHash);
        onSuccess?.(result.transactionHash);
      } else {
        throw new Error(result.error || "Payment failed");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Payment failed";
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // Truncate address for display
  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (success) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium text-green-800 dark:text-green-200">
                Payment Successful!
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                Your USDC payment has been processed.
              </p>
            </div>
          </div>
          <div className="mt-3">
            <a
              href={`https://${network === "base" ? "" : "sepolia."}basescan.org/tx/${success}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-green-700 hover:underline dark:text-green-300"
            >
              View transaction
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Payment amount display */}
      <div className="rounded-lg border bg-muted/30 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">$</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pay with USDC</p>
              <p className="text-xl font-bold">{formatUsdcDisplay(amount)}</p>
            </div>
          </div>
          <Badge variant="secondary" className="gap-1">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            {network === "base" ? "Base" : "Base Sepolia"}
          </Badge>
        </div>
      </div>

      {/* Wallet connection */}
      {!walletAddress ? (
        <div className="space-y-3">
          <Button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full"
            size="lg"
          >
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="mr-2 h-4 w-4" />
                Connect Wallet
              </>
            )}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Connect your wallet to pay with USDC on {network === "base" ? "Base" : "Base Sepolia"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Connected wallet info */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <Wallet className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium">{truncateAddress(walletAddress)}</p>
                <p className="text-xs text-muted-foreground">
                  Balance: {formatUsdcDisplay(usdcBalance)} USDC
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={refreshBalance}
              className="h-8 w-8"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {/* Insufficient balance warning */}
          {parseFloat(usdcBalance) < amount && (
            <div className="flex items-start gap-2 rounded-md bg-yellow-50 p-3 text-sm dark:bg-yellow-900/20">
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800 dark:text-yellow-200">
                  Insufficient USDC balance
                </p>
                <p className="text-yellow-700 dark:text-yellow-300">
                  You need {formatUsdcDisplay(amount)} but only have{" "}
                  {formatUsdcDisplay(usdcBalance)}.
                </p>
                <a
                  href="https://www.coinbase.com/onramp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-yellow-700 hover:underline dark:text-yellow-300"
                >
                  Get USDC
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          )}

          {/* Pay button */}
          <Button
            onClick={handlePayment}
            disabled={isProcessing || parseFloat(usdcBalance) < amount}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>Pay {formatUsdcDisplay(amount)} USDC</>
            )}
          </Button>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Info text */}
      <p className="text-xs text-center text-muted-foreground">
        Powered by{" "}
        <a
          href="https://x402.org"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          x402
        </a>
        {" "}&bull;{" "}
        Instant USDC payments on Base
      </p>
    </div>
  );
}
