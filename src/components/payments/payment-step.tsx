"use client";

import { useState, useCallback, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { PaymentForm } from "./payment-form";
import { X402PaymentForm } from "./x402-payment-form";
import { PaymentMethodSelector, type PaymentMethod } from "./payment-method-selector";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, CheckCircle2, CreditCard, AlertCircle, Coins } from "lucide-react";

// Load Stripe outside component to avoid recreating on each render
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export interface PaymentStepProps {
  amount: number; // Amount in dollars
  currency: string;
  documentId: string;
  recipientId: string;
  documentTitle?: string;
  onPaymentComplete?: () => void;
  onPaymentError?: (error: string) => void;
  paymentTiming?: "before_signature" | "after_signature";
  isCompleted?: boolean;
}

export function PaymentStep({
  amount,
  currency,
  documentId,
  recipientId,
  documentTitle,
  onPaymentComplete,
  onPaymentError,
  paymentTiming = "before_signature",
  isCompleted = false,
}: PaymentStepProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(isCompleted);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  // Create payment intent on mount
  useEffect(() => {
    if (isCompleted) {
      setIsLoading(false);
      setPaymentSuccess(true);
      return;
    }

    async function createPaymentIntent() {
      try {
        const response = await fetch("/api/payments/create-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount,
            currency,
            documentId,
            recipientId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create payment intent");
        }

        const data = await response.json();
        setClientSecret(data.clientSecret);
        setPaymentIntentId(data.paymentIntentId);
      } catch (err) {
        console.error("Error creating payment intent:", err);
        setError(err instanceof Error ? err.message : "Failed to initialize payment");
        onPaymentError?.(err instanceof Error ? err.message : "Failed to initialize payment");
      } finally {
        setIsLoading(false);
      }
    }

    createPaymentIntent();
  }, [amount, currency, documentId, recipientId, isCompleted, onPaymentError]);

  const handlePaymentSuccess = useCallback(
    (intentId: string) => {
      setPaymentSuccess(true);
      setPaymentIntentId(intentId);
      onPaymentComplete?.();
    },
    [onPaymentComplete]
  );

  const handlePaymentError = useCallback(
    (errorMsg: string) => {
      setError(errorMsg);
      onPaymentError?.(errorMsg);
    },
    [onPaymentError]
  );

  const handleX402Success = useCallback(
    (txHash: string) => {
      setPaymentSuccess(true);
      setTransactionHash(txHash);
      onPaymentComplete?.();
    },
    [onPaymentComplete]
  );

  const handleRetry = useCallback(() => {
    setError(null);
    setIsLoading(true);
    // Re-trigger payment intent creation
    window.location.reload();
  }, []);

  // Format currency display
  const formatCurrency = (amt: number, curr: string) => {
    const symbols: Record<string, string> = {
      usd: "$",
      eur: "€",
      gbp: "£",
      cad: "C$",
      aud: "A$",
    };
    const symbol = symbols[curr.toLowerCase()] || curr.toUpperCase();
    return `${symbol}${amt.toFixed(2)}`;
  };

  // Success state
  if (paymentSuccess) {
    return (
      <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-green-800 dark:text-green-200">
            Payment Successful
          </h3>
          <p className="mt-1 text-sm text-green-600 dark:text-green-400">
            Thank you! Your payment of {formatCurrency(amount, currency)} has been received.
          </p>
          {transactionHash && (
            <a
              href={`https://basescan.org/tx/${transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 text-xs text-green-600 hover:underline dark:text-green-400"
            >
              View transaction on BaseScan
            </a>
          )}
        </CardContent>
      </Card>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">
            Initializing payment...
          </p>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error && !clientSecret) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="rounded-full bg-destructive/10 p-3">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">Payment Error</h3>
          <p className="mt-1 text-sm text-muted-foreground text-center max-w-sm">
            {error}
          </p>
          <Button onClick={handleRetry} variant="outline" className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Payment form
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          {paymentMethod === "card" ? (
            <CreditCard className="h-5 w-5 text-muted-foreground" />
          ) : (
            <Coins className="h-5 w-5 text-blue-500" />
          )}
          <CardTitle>Payment Required</CardTitle>
        </div>
        <CardDescription>
          {paymentTiming === "before_signature"
            ? "Please complete payment to continue with signing"
            : "Complete payment to finalize the document"}
          {documentTitle && ` for "${documentTitle}"`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment method selector */}
        <PaymentMethodSelector
          value={paymentMethod}
          onChange={setPaymentMethod}
          x402Enabled={true}
        />

        <Separator />

        {/* Stripe payment form */}
        {paymentMethod === "card" && clientSecret && (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: "stripe",
                variables: {
                  colorPrimary: "#0f172a",
                  colorBackground: "#ffffff",
                  colorText: "#0f172a",
                  colorDanger: "#ef4444",
                  fontFamily: "system-ui, sans-serif",
                  borderRadius: "8px",
                },
              },
            }}
          >
            <PaymentForm
              amount={amount}
              currency={currency}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              returnUrl={`${window.location.origin}${window.location.pathname}?payment=complete`}
            />
          </Elements>
        )}

        {/* x402 USDC payment form */}
        {paymentMethod === "usdc" && (
          <X402PaymentForm
            amount={amount}
            type="document"
            documentId={documentId}
            recipientId={recipientId}
            onSuccess={handleX402Success}
            onError={handlePaymentError}
          />
        )}
      </CardContent>
    </Card>
  );
}
