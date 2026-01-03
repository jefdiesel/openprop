"use client";

import { useState, useEffect } from "react";
import { CreditCard, Coins } from "lucide-react";
import { cn } from "@/lib/utils";

export type PaymentMethod = "card" | "usdc";

interface PaymentMethodSelectorProps {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
  x402Enabled?: boolean;
  className?: string;
}

export function PaymentMethodSelector({
  value,
  onChange,
  x402Enabled = false,
  className,
}: PaymentMethodSelectorProps) {
  const [x402Available, setX402Available] = useState(false);

  // Check if x402 is configured on the server
  useEffect(() => {
    async function checkX402() {
      try {
        const response = await fetch("/api/payments/x402/status");
        const data = await response.json();
        setX402Available(data.configured);
      } catch {
        setX402Available(false);
      }
    }

    if (x402Enabled) {
      checkX402();
    }
  }, [x402Enabled]);

  // If x402 is not available, just show card option (no selector needed)
  if (!x402Available) {
    return null;
  }

  return (
    <div className={cn("grid grid-cols-2 gap-3", className)}>
      {/* Card option */}
      <button
        type="button"
        onClick={() => onChange("card")}
        className={cn(
          "flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors",
          value === "card"
            ? "border-primary bg-primary/5"
            : "border-muted hover:border-muted-foreground/50"
        )}
      >
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full",
            value === "card"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          <CreditCard className="h-5 w-5" />
        </div>
        <div className="text-center">
          <p className="font-medium">Card</p>
          <p className="text-xs text-muted-foreground">Stripe payments</p>
        </div>
      </button>

      {/* USDC option */}
      <button
        type="button"
        onClick={() => onChange("usdc")}
        className={cn(
          "flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors",
          value === "usdc"
            ? "border-primary bg-primary/5"
            : "border-muted hover:border-muted-foreground/50"
        )}
      >
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full",
            value === "usdc"
              ? "bg-blue-600 text-white"
              : "bg-muted text-muted-foreground"
          )}
        >
          <Coins className="h-5 w-5" />
        </div>
        <div className="text-center">
          <p className="font-medium">USDC</p>
          <p className="text-xs text-muted-foreground">Pay with crypto</p>
        </div>
      </button>
    </div>
  );
}
