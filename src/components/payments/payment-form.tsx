"use client";

import { useState, useCallback, FormEvent } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, CreditCard } from "lucide-react";

export interface PaymentFormProps {
  amount: number;
  currency: string;
  onSuccess?: (paymentIntentId: string) => void;
  onError?: (error: string) => void;
  returnUrl?: string;
}

export function PaymentForm({
  amount,
  currency,
  onSuccess,
  onError,
  returnUrl,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const formatCurrency = useCallback((amt: number, curr: string) => {
    const symbols: Record<string, string> = {
      usd: "$",
      eur: "€",
      gbp: "£",
      cad: "C$",
      aud: "A$",
    };
    const symbol = symbols[curr.toLowerCase()] || curr.toUpperCase();
    return `${symbol}${amt.toFixed(2)}`;
  }, []);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!stripe || !elements) {
        // Stripe.js hasn't loaded yet
        return;
      }

      setIsProcessing(true);
      setErrorMessage(null);

      try {
        const { error, paymentIntent } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: returnUrl || `${window.location.origin}/payment-complete`,
          },
          redirect: "if_required",
        });

        if (error) {
          // Show error to customer
          if (error.type === "card_error" || error.type === "validation_error") {
            setErrorMessage(error.message || "Payment failed");
          } else {
            setErrorMessage("An unexpected error occurred.");
          }
          onError?.(error.message || "Payment failed");
        } else if (paymentIntent && paymentIntent.status === "succeeded") {
          // Payment succeeded
          onSuccess?.(paymentIntent.id);
        } else if (paymentIntent && paymentIntent.status === "processing") {
          // Payment is processing (usually for bank debits)
          setErrorMessage(
            "Your payment is processing. You will be notified when it completes."
          );
        }
      } catch (err) {
        console.error("Payment error:", err);
        setErrorMessage("An unexpected error occurred.");
        onError?.("An unexpected error occurred.");
      } finally {
        setIsProcessing(false);
      }
    },
    [stripe, elements, returnUrl, onSuccess, onError]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg border bg-muted/30 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CreditCard className="h-4 w-4" />
            <span>Payment Amount</span>
          </div>
          <span className="text-xl font-bold">
            {formatCurrency(amount, currency)}
          </span>
        </div>

        <PaymentElement
          options={{
            layout: "tabs",
            business: {
              name: "OpenProposal",
            },
          }}
        />
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <Button
        type="submit"
        disabled={isProcessing || !stripe || !elements}
        className="w-full"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Processing...
          </>
        ) : (
          <>Pay {formatCurrency(amount, currency)}</>
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Your payment is securely processed by Stripe. We never store your card details.
      </p>
    </form>
  );
}
