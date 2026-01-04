"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
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
import { Loader2, CheckCircle2, CreditCard, AlertCircle, Coins, ArrowLeft } from "lucide-react";

// Load Stripe outside component to avoid recreating on each render
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface PaymentStepProps {
  amount: number; // Amount in dollars
  currency: string;
  documentId: string;
  recipientId: string;
  documentTitle?: string;
  lineItems?: LineItem[]; // Invoice line items
  downPaymentPercent?: number; // If this is a down payment
  onPaymentComplete?: () => void;
  onPaymentError?: (error: string) => void;
  onBack?: () => void; // Go back to document review
  paymentTiming?: "due_now" | "net_30" | "net_60";
  isCompleted?: boolean;
}

export function PaymentStep({
  amount,
  currency,
  documentId,
  recipientId,
  documentTitle,
  lineItems,
  downPaymentPercent,
  onPaymentComplete,
  onPaymentError,
  onBack,
  paymentTiming = "due_now",
  isCompleted = false,
}: PaymentStepProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(isCompleted);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  // Safe down payment percentage (handles NaN, undefined, null)
  const safeDownPaymentPercent = useMemo(() => {
    if (downPaymentPercent === undefined || downPaymentPercent === null) return 0;
    const parsed = typeof downPaymentPercent === 'string' ? parseFloat(downPaymentPercent as any) : Number(downPaymentPercent);
    return Number.isFinite(parsed) ? parsed : 0;
  }, [downPaymentPercent]);

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
        {onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="w-fit -ml-2 mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Document
          </Button>
        )}
        <div className="flex items-center gap-2">
          {paymentMethod === "card" ? (
            <CreditCard className="h-5 w-5 text-muted-foreground" />
          ) : (
            <Coins className="h-5 w-5 text-blue-500" />
          )}
          <CardTitle>Payment Required</CardTitle>
        </div>
        <CardDescription>
          {paymentTiming === "due_now"
            ? "Please complete payment to continue with signing"
            : `Payment due within ${paymentTiming === "net_30" ? "30" : "60"} days`}
          {documentTitle && ` for "${documentTitle}"`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Invoice breakdown */}
        {lineItems && lineItems.filter(item => item.description && item.unitPrice > 0).length > 0 && (
          <div className="rounded-lg border bg-muted/30 p-4">
            <h4 className="font-medium mb-3">Invoice Details</h4>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground text-left">
                  <th className="pb-2">Description</th>
                  <th className="pb-2 text-right">Qty</th>
                  <th className="pb-2 text-right">Price</th>
                  <th className="pb-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {lineItems
                  .filter(item => item.description && item.unitPrice > 0)
                  .map((item) => (
                  <tr key={item.id} className="border-t border-muted">
                    <td className="py-2">{item.description}</td>
                    <td className="py-2 text-right">{item.quantity || 1}</td>
                    <td className="py-2 text-right">
                      {new Intl.NumberFormat("en-US", { style: "currency", currency }).format(item.unitPrice)}
                    </td>
                    <td className="py-2 text-right font-medium">
                      {new Intl.NumberFormat("en-US", { style: "currency", currency }).format((item.quantity || 1) * item.unitPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-muted font-medium">
                <tr>
                  <td colSpan={3} className="pt-2 text-right">
                    {safeDownPaymentPercent > 0 ? "Invoice Total:" : "Total:"}
                  </td>
                  <td className="pt-2 text-right">
                    {new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
                      lineItems
                        .filter(item => item.description && item.unitPrice > 0)
                        .reduce((sum, item) => sum + (item.quantity || 1) * item.unitPrice, 0)
                    )}
                  </td>
                </tr>
                {safeDownPaymentPercent > 0 && (
                  <>
                    <tr className="bg-primary/5">
                      <td colSpan={3} className="pt-2 pb-1 text-right font-semibold text-primary">
                        {safeDownPaymentPercent}% Down Payment Due Now:
                      </td>
                      <td className="pt-2 pb-1 text-right font-semibold text-primary">
                        {new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount)}
                      </td>
                    </tr>
                    <tr className="text-muted-foreground text-sm">
                      <td colSpan={3} className="pt-1 text-right">
                        Balance Due Later:
                      </td>
                      <td className="pt-1 text-right">
                        {new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
                          lineItems
                            .filter(item => item.description && item.unitPrice > 0)
                            .reduce((sum, item) => sum + (item.quantity || 1) * item.unitPrice, 0) - amount
                        )}
                      </td>
                    </tr>
                  </>
                )}
              </tfoot>
            </table>
          </div>
        )}

        {/* Simple amount display if no line items */}
        {(!lineItems || lineItems.length === 0) && (
          <div className="text-center py-2">
            <div className="text-3xl font-bold">
              {new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount)}
            </div>
            {safeDownPaymentPercent > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                {safeDownPaymentPercent}% down payment
              </p>
            )}
          </div>
        )}

        <Separator />

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
