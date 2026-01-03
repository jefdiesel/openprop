"use client";

import { useCallback, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, GripVertical } from "lucide-react";
import type {
  PricingTableBlockData,
  PricingTableItem,
  BlockComponentProps,
} from "@/types/blocks";

const currencySymbols: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  CAD: "C$",
  AUD: "A$",
};

function formatCurrency(amount: number, currency: string): string {
  const symbol = currencySymbols[currency] || currency;
  return `${symbol}${amount.toFixed(2)}`;
}

export function PricingTableBlock({
  block,
  mode,
  onChange,
}: BlockComponentProps<PricingTableBlockData>) {
  // Calculate totals
  const calculations = useMemo(() => {
    const selectedItems = block.items.filter(
      (item) => !item.isOptional || item.isSelected
    );
    const subtotal = selectedItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );

    let discount = 0;
    if (block.discountValue && block.discountValue > 0) {
      if (block.discountType === "percentage") {
        discount = subtotal * (block.discountValue / 100);
      } else {
        discount = block.discountValue;
      }
    }

    const afterDiscount = subtotal - discount;
    const tax = block.taxRate ? afterDiscount * (block.taxRate / 100) : 0;
    const total = afterDiscount + tax;

    return { subtotal, discount, tax, total };
  }, [block.items, block.discountType, block.discountValue, block.taxRate]);

  const handleAddItem = useCallback(() => {
    if (onChange) {
      const newItem: PricingTableItem = {
        id: uuidv4(),
        name: "",
        description: "",
        quantity: 1,
        unitPrice: 0,
        isOptional: false,
        isSelected: true,
        allowQuantityChange: false,
      };
      onChange({ ...block, items: [...block.items, newItem] });
    }
  }, [block, onChange]);

  const handleRemoveItem = useCallback(
    (itemId: string) => {
      if (onChange) {
        onChange({
          ...block,
          items: block.items.filter((item) => item.id !== itemId),
        });
      }
    },
    [block, onChange]
  );

  const handleUpdateItem = useCallback(
    (itemId: string, updates: Partial<PricingTableItem>) => {
      if (onChange) {
        onChange({
          ...block,
          items: block.items.map((item) =>
            item.id === itemId ? { ...item, ...updates } : item
          ),
        });
      }
    },
    [block, onChange]
  );

  const handleCurrencyChange = useCallback(
    (currency: string) => {
      if (onChange) {
        onChange({ ...block, currency });
      }
    },
    [block, onChange]
  );

  const handleDiscountTypeChange = useCallback(
    (discountType: "percentage" | "fixed") => {
      if (onChange) {
        onChange({ ...block, discountType });
      }
    },
    [block, onChange]
  );

  const handleDiscountValueChange = useCallback(
    (discountValue: number) => {
      if (onChange) {
        onChange({ ...block, discountValue });
      }
    },
    [block, onChange]
  );

  const handleTaxRateChange = useCallback(
    (taxRate: number) => {
      if (onChange) {
        onChange({ ...block, taxRate });
      }
    },
    [block, onChange]
  );

  const handleTaxLabelChange = useCallback(
    (taxLabel: string) => {
      if (onChange) {
        onChange({ ...block, taxLabel });
      }
    },
    [block, onChange]
  );

  // View mode for signers - can toggle optional items
  if (mode === "sign") {
    return (
      <div className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Item</TableHead>
              <TableHead className="w-24 text-right">Qty</TableHead>
              <TableHead className="w-32 text-right">Unit Price</TableHead>
              <TableHead className="w-32 text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {block.items.map((item) => (
              <TableRow
                key={item.id}
                className={cn(
                  item.isOptional && !item.isSelected && "opacity-50"
                )}
              >
                <TableCell>
                  {item.isOptional ? (
                    <Checkbox
                      checked={item.isSelected}
                      onCheckedChange={(checked) =>
                        handleUpdateItem(item.id, { isSelected: !!checked })
                      }
                    />
                  ) : (
                    <Checkbox checked disabled />
                  )}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{item.name}</p>
                    {item.description && (
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    )}
                    {item.isOptional && (
                      <span className="text-xs text-muted-foreground italic">
                        Optional
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {item.allowQuantityChange ? (
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) =>
                        handleUpdateItem(item.id, {
                          quantity: parseInt(e.target.value) || 1,
                        })
                      }
                      className="w-20 text-right"
                    />
                  ) : (
                    item.quantity
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(item.unitPrice, block.currency)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(item.quantity * item.unitPrice, block.currency)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={4} className="text-right">
                Subtotal
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(calculations.subtotal, block.currency)}
              </TableCell>
            </TableRow>
            {calculations.discount > 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-right text-green-600">
                  Discount
                  {block.discountType === "percentage" &&
                    ` (${block.discountValue}%)`}
                </TableCell>
                <TableCell className="text-right text-green-600">
                  -{formatCurrency(calculations.discount, block.currency)}
                </TableCell>
              </TableRow>
            )}
            {calculations.tax > 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-right">
                  {block.taxLabel || "Tax"} ({block.taxRate}%)
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(calculations.tax, block.currency)}
                </TableCell>
              </TableRow>
            )}
            <TableRow>
              <TableCell colSpan={4} className="text-right font-bold">
                Total
              </TableCell>
              <TableCell className="text-right font-bold text-lg">
                {formatCurrency(calculations.total, block.currency)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    );
  }

  // View mode - read only
  if (mode === "view") {
    return (
      <div className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead className="w-24 text-right">Qty</TableHead>
              <TableHead className="w-32 text-right">Unit Price</TableHead>
              <TableHead className="w-32 text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {block.items
              .filter((item) => !item.isOptional || item.isSelected)
              .map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      {item.description && (
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.unitPrice, block.currency)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(item.quantity * item.unitPrice, block.currency)}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3} className="text-right">
                Subtotal
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(calculations.subtotal, block.currency)}
              </TableCell>
            </TableRow>
            {calculations.discount > 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-right text-green-600">
                  Discount
                </TableCell>
                <TableCell className="text-right text-green-600">
                  -{formatCurrency(calculations.discount, block.currency)}
                </TableCell>
              </TableRow>
            )}
            {calculations.tax > 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-right">
                  {block.taxLabel || "Tax"}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(calculations.tax, block.currency)}
                </TableCell>
              </TableRow>
            )}
            <TableRow>
              <TableCell colSpan={3} className="text-right font-bold">
                Total
              </TableCell>
              <TableCell className="text-right font-bold text-lg">
                {formatCurrency(calculations.total, block.currency)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    );
  }

  // Edit mode
  return (
    <div className="space-y-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8"></TableHead>
            <TableHead>Item</TableHead>
            <TableHead className="w-20">Qty</TableHead>
            <TableHead className="w-28">Unit Price</TableHead>
            <TableHead className="w-28">Total</TableHead>
            <TableHead className="w-20">Optional</TableHead>
            <TableHead className="w-20">Qty Edit</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {block.items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <Input
                    type="text"
                    placeholder="Item name"
                    value={item.name}
                    onChange={(e) =>
                      handleUpdateItem(item.id, { name: e.target.value })
                    }
                    className="font-medium"
                  />
                  <Input
                    type="text"
                    placeholder="Description (optional)"
                    value={item.description || ""}
                    onChange={(e) =>
                      handleUpdateItem(item.id, { description: e.target.value })
                    }
                    className="text-sm"
                  />
                </div>
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) =>
                    handleUpdateItem(item.id, {
                      quantity: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-16"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={item.unitPrice}
                  onChange={(e) =>
                    handleUpdateItem(item.id, {
                      unitPrice: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-24"
                />
              </TableCell>
              <TableCell className="font-medium">
                {formatCurrency(item.quantity * item.unitPrice, block.currency)}
              </TableCell>
              <TableCell className="text-center">
                <Checkbox
                  checked={item.isOptional}
                  onCheckedChange={(checked) =>
                    handleUpdateItem(item.id, { isOptional: !!checked })
                  }
                />
              </TableCell>
              <TableCell className="text-center">
                <Checkbox
                  checked={item.allowQuantityChange}
                  onCheckedChange={(checked) =>
                    handleUpdateItem(item.id, { allowQuantityChange: !!checked })
                  }
                />
              </TableCell>
              <TableCell>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleRemoveItem(item.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={4} className="text-right">
              Subtotal
            </TableCell>
            <TableCell className="font-medium">
              {formatCurrency(calculations.subtotal, block.currency)}
            </TableCell>
            <TableCell colSpan={3}></TableCell>
          </TableRow>
          {calculations.discount > 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-right text-green-600">
                Discount
              </TableCell>
              <TableCell className="text-green-600">
                -{formatCurrency(calculations.discount, block.currency)}
              </TableCell>
              <TableCell colSpan={3}></TableCell>
            </TableRow>
          )}
          {calculations.tax > 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-right">
                {block.taxLabel || "Tax"}
              </TableCell>
              <TableCell>
                {formatCurrency(calculations.tax, block.currency)}
              </TableCell>
              <TableCell colSpan={3}></TableCell>
            </TableRow>
          )}
          <TableRow>
            <TableCell colSpan={4} className="text-right font-bold">
              Total
            </TableCell>
            <TableCell className="font-bold text-lg">
              {formatCurrency(calculations.total, block.currency)}
            </TableCell>
            <TableCell colSpan={3}></TableCell>
          </TableRow>
        </TableFooter>
      </Table>

      <Button type="button" variant="outline" onClick={handleAddItem}>
        <Plus className="h-4 w-4 mr-2" />
        Add Item
      </Button>

      <div className="grid grid-cols-2 gap-6 pt-4 border-t">
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="currency">Currency</Label>
            <Select value={block.currency} onValueChange={handleCurrencyChange}>
              <SelectTrigger id="currency" className="w-32">
                <SelectValue placeholder="Currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
                <SelectItem value="CAD">CAD (C$)</SelectItem>
                <SelectItem value="AUD">AUD (A$)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid gap-2">
            <Label>Discount</Label>
            <div className="flex items-center gap-2">
              <Select
                value={block.discountType || "percentage"}
                onValueChange={(v) =>
                  handleDiscountTypeChange(v as "percentage" | "fixed")
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                min={0}
                step={block.discountType === "percentage" ? 1 : 0.01}
                value={block.discountValue || 0}
                onChange={(e) =>
                  handleDiscountValueChange(parseFloat(e.target.value) || 0)
                }
                className="w-24"
              />
              <span className="text-muted-foreground">
                {block.discountType === "percentage" ? "%" : block.currency}
              </span>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Tax</Label>
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder="Tax label"
                value={block.taxLabel || ""}
                onChange={(e) => handleTaxLabelChange(e.target.value)}
                className="w-32"
              />
              <Input
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={block.taxRate || 0}
                onChange={(e) =>
                  handleTaxRateChange(parseFloat(e.target.value) || 0)
                }
                className="w-20"
              />
              <span className="text-muted-foreground">%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
