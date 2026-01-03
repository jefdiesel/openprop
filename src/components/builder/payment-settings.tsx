"use client";

import { useCallback } from "react";
import { CreditCard, DollarSign, Clock } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export type PaymentTiming = "before_signature" | "after_signature";
export type PaymentAmountType = "fixed" | "pricing_table";

export interface PaymentSettings {
  enabled: boolean;
  timing: PaymentTiming;
  amountType: PaymentAmountType;
  fixedAmount?: number;
  currency: string;
}

export interface PaymentSettingsPanelProps {
  settings: PaymentSettings;
  onChange: (settings: PaymentSettings) => void;
  hasPricingTable?: boolean;
  pricingTableTotal?: number;
}

const currencies = [
  { value: "USD", label: "USD ($)" },
  { value: "EUR", label: "EUR" },
  { value: "GBP", label: "GBP" },
  { value: "CAD", label: "CAD" },
  { value: "AUD", label: "AUD" },
];

export function PaymentSettingsPanel({
  settings,
  onChange,
  hasPricingTable = false,
  pricingTableTotal = 0,
}: PaymentSettingsPanelProps) {
  const handleEnabledChange = useCallback(
    (enabled: boolean) => {
      onChange({ ...settings, enabled });
    },
    [settings, onChange]
  );

  const handleTimingChange = useCallback(
    (timing: PaymentTiming) => {
      onChange({ ...settings, timing });
    },
    [settings, onChange]
  );

  const handleAmountTypeChange = useCallback(
    (amountType: PaymentAmountType) => {
      onChange({ ...settings, amountType });
    },
    [settings, onChange]
  );

  const handleFixedAmountChange = useCallback(
    (value: string) => {
      const amount = parseFloat(value) || 0;
      onChange({ ...settings, fixedAmount: amount });
    },
    [settings, onChange]
  );

  const handleCurrencyChange = useCallback(
    (currency: string) => {
      onChange({ ...settings, currency });
    },
    [settings, onChange]
  );

  const formatCurrency = (amount: number, currency: string) => {
    const symbols: Record<string, string> = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      CAD: "C$",
      AUD: "A$",
    };
    const symbol = symbols[currency] || currency;
    return `${symbol}${amount.toFixed(2)}`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-base">Payment Collection</CardTitle>
        </div>
        <CardDescription>
          Collect payments from recipients when they sign
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable Payment Collection */}
        <div className="flex items-center space-x-3">
          <Checkbox
            id="payment-enabled"
            checked={settings.enabled}
            onCheckedChange={(checked) => handleEnabledChange(!!checked)}
          />
          <Label htmlFor="payment-enabled" className="cursor-pointer font-medium">
            Enable payment collection
          </Label>
        </div>

        {settings.enabled && (
          <>
            <Separator />

            {/* Payment Timing */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Label className="font-medium">Payment Timing</Label>
              </div>
              <Select
                value={settings.timing}
                onValueChange={(v) => handleTimingChange(v as PaymentTiming)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select when to collect payment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="before_signature">
                    Before signing
                  </SelectItem>
                  <SelectItem value="after_signature">
                    After signing
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {settings.timing === "before_signature"
                  ? "Payment will be required before the recipient can sign the document."
                  : "Payment will be collected after the recipient completes their signature."}
              </p>
            </div>

            <Separator />

            {/* Payment Amount */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <Label className="font-medium">Payment Amount</Label>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id="amount-fixed"
                    name="amountType"
                    checked={settings.amountType === "fixed"}
                    onChange={() => handleAmountTypeChange("fixed")}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="amount-fixed" className="cursor-pointer">
                    Fixed amount
                  </Label>
                </div>

                {settings.amountType === "fixed" && (
                  <div className="ml-7 flex items-center gap-2">
                    <Select
                      value={settings.currency}
                      onValueChange={handleCurrencyChange}
                    >
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={settings.fixedAmount || ""}
                      onChange={(e) => handleFixedAmountChange(e.target.value)}
                      className="w-32"
                    />
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id="amount-pricing"
                    name="amountType"
                    checked={settings.amountType === "pricing_table"}
                    onChange={() => handleAmountTypeChange("pricing_table")}
                    disabled={!hasPricingTable}
                    className="h-4 w-4"
                  />
                  <Label
                    htmlFor="amount-pricing"
                    className={`cursor-pointer ${
                      !hasPricingTable ? "text-muted-foreground" : ""
                    }`}
                  >
                    Use pricing table total
                  </Label>
                </div>

                {settings.amountType === "pricing_table" && hasPricingTable && (
                  <div className="ml-7 rounded-md bg-muted p-3">
                    <p className="text-sm">
                      Current total:{" "}
                      <span className="font-semibold">
                        {formatCurrency(pricingTableTotal, settings.currency)}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Amount will be calculated from the pricing table when the
                      document is sent.
                    </p>
                  </div>
                )}

                {!hasPricingTable && settings.amountType === "pricing_table" && (
                  <p className="ml-7 text-xs text-muted-foreground">
                    Add a pricing table block to use this option.
                  </p>
                )}
              </div>
            </div>

            {/* Summary */}
            {(settings.amountType === "fixed" && settings.fixedAmount && settings.fixedAmount > 0) ||
            (settings.amountType === "pricing_table" && hasPricingTable) ? (
              <>
                <Separator />
                <div className="rounded-md bg-primary/5 p-4">
                  <h4 className="text-sm font-medium mb-2">Payment Summary</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>
                      Amount:{" "}
                      <span className="font-medium text-foreground">
                        {settings.amountType === "fixed"
                          ? formatCurrency(settings.fixedAmount!, settings.currency)
                          : formatCurrency(pricingTableTotal, settings.currency) +
                            " (from pricing table)"}
                      </span>
                    </p>
                    <p>
                      When:{" "}
                      <span className="font-medium text-foreground">
                        {settings.timing === "before_signature"
                          ? "Before signing"
                          : "After signing"}
                      </span>
                    </p>
                  </div>
                </div>
              </>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Default payment settings
export const defaultPaymentSettings: PaymentSettings = {
  enabled: false,
  timing: "before_signature",
  amountType: "fixed",
  fixedAmount: 0,
  currency: "USD",
};
