"use client"

import * as React from "react"
import { X, Plus } from "lucide-react"
import { ConditionGroup, ConditionRule, ConditionOperator } from "@/types/blocks"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface ConditionBuilderProps {
  condition?: ConditionGroup
  onChange: (condition: ConditionGroup | undefined) => void
  pricingItems: Array<{ id: string; name: string }>
  trigger: React.ReactNode
}

type FieldType = "item-selected" | "item-quantity" | "pricing-total"

interface RuleDisplay extends ConditionRule {
  _id: string // Internal ID for React keys
}

const OPERATORS: { value: ConditionOperator; label: string }[] = [
  { value: "==", label: "equals" },
  { value: "!=", label: "not equals" },
  { value: ">", label: "greater than" },
  { value: "<", label: "less than" },
  { value: ">=", label: "greater than or equal" },
  { value: "<=", label: "less than or equal" },
]

export function ConditionBuilder({
  condition,
  onChange,
  pricingItems,
  trigger,
}: ConditionBuilderProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  // Parse rules with internal IDs for rendering
  const getRulesWithIds = (): RuleDisplay[] => {
    if (!condition?.rules) return []
    return condition.rules.map((rule, idx) => ({
      ...(rule as ConditionRule),
      _id: `rule-${idx}`,
    }))
  }

  const [rules, setRules] = React.useState<RuleDisplay[]>(getRulesWithIds)
  const [logic, setLogic] = React.useState<"AND" | "OR">(condition?.logic || "AND")

  // Sync with external condition changes
  React.useEffect(() => {
    if (condition) {
      setRules(getRulesWithIds())
      setLogic(condition.logic)
    } else {
      setRules([])
      setLogic("AND")
    }
  }, [condition])

  // Parse field path to extract type and item ID
  const parseField = (field: string): { type: FieldType; itemId?: string } => {
    if (field === "pricing.total") {
      return { type: "pricing-total" }
    }

    const itemMatch = field.match(/^pricing\.items\.([^.]+)\.(isSelected|quantity)$/)
    if (itemMatch) {
      const [, itemId, prop] = itemMatch
      return {
        type: prop === "isSelected" ? "item-selected" : "item-quantity",
        itemId,
      }
    }

    return { type: "pricing-total" }
  }

  // Build field path from type and item ID
  const buildField = (type: FieldType, itemId?: string): string => {
    if (type === "pricing-total") {
      return "pricing.total"
    }
    if (type === "item-selected" && itemId) {
      return `pricing.items.${itemId}.isSelected`
    }
    if (type === "item-quantity" && itemId) {
      return `pricing.items.${itemId}.quantity`
    }
    return "pricing.total"
  }

  const updateCondition = (newRules: RuleDisplay[], newLogic: "AND" | "OR") => {
    if (newRules.length === 0) {
      onChange(undefined)
      return
    }

    const cleanRules: ConditionRule[] = newRules.map(({ _id, ...rule }) => rule)
    onChange({
      logic: newLogic,
      rules: cleanRules,
    })
  }

  const addRule = () => {
    const newRule: RuleDisplay = {
      _id: `rule-${Date.now()}`,
      field: "pricing.total",
      operator: "==",
      value: 0,
    }
    const newRules = [...rules, newRule]
    setRules(newRules)
    updateCondition(newRules, logic)
  }

  const deleteRule = (id: string) => {
    const newRules = rules.filter((r) => r._id !== id)
    setRules(newRules)
    updateCondition(newRules, logic)
  }

  const updateRule = (id: string, updates: Partial<ConditionRule>) => {
    const newRules = rules.map((r) => (r._id === id ? { ...r, ...updates } : r))
    setRules(newRules)
    updateCondition(newRules, logic)
  }

  const updateLogic = (newLogic: "AND" | "OR") => {
    setLogic(newLogic)
    updateCondition(rules, newLogic)
  }

  const clearAll = () => {
    setRules([])
    setLogic("AND")
    onChange(undefined)
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-[400px]" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">Visibility Conditions</Label>
            {rules.length > 0 && (
              <button
                onClick={clearAll}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          {rules.length > 0 && (
            <>
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground">Show when</Label>
                <Switch
                  checked={logic === "OR"}
                  onCheckedChange={(checked) => updateLogic(checked ? "OR" : "AND")}
                />
                <Label className="text-xs text-muted-foreground">
                  {logic === "AND" ? "ALL" : "ANY"} conditions match
                </Label>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {rules.map((rule, index) => (
                  <RuleEditor
                    key={rule._id}
                    rule={rule}
                    index={index}
                    pricingItems={pricingItems}
                    onUpdate={(updates) => updateRule(rule._id, updates)}
                    onDelete={() => deleteRule(rule._id)}
                    parseField={parseField}
                    buildField={buildField}
                  />
                ))}
              </div>
            </>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={addRule}
            className="w-full"
          >
            <Plus className="size-4" />
            Add condition
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

interface RuleEditorProps {
  rule: RuleDisplay
  index: number
  pricingItems: Array<{ id: string; name: string }>
  onUpdate: (updates: Partial<ConditionRule>) => void
  onDelete: () => void
  parseField: (field: string) => { type: FieldType; itemId?: string }
  buildField: (type: FieldType, itemId?: string) => string
}

function RuleEditor({
  rule,
  index,
  pricingItems,
  onUpdate,
  onDelete,
  parseField,
  buildField,
}: RuleEditorProps) {
  const { type, itemId } = parseField(rule.field)

  const handleFieldTypeChange = (newType: FieldType) => {
    if (newType === "pricing-total") {
      onUpdate({
        field: buildField(newType),
        value: 0,
      })
    } else if (pricingItems.length > 0) {
      const firstItemId = pricingItems[0].id
      onUpdate({
        field: buildField(newType, firstItemId),
        value: newType === "item-selected" ? true : 0,
      })
    }
  }

  const handleItemChange = (newItemId: string) => {
    onUpdate({
      field: buildField(type, newItemId),
    })
  }

  const handleValueChange = (newValue: string | number | boolean) => {
    onUpdate({ value: newValue })
  }

  return (
    <div className="border rounded-md p-3 space-y-2 bg-muted/30">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 space-y-2">
          {/* Field Type Select */}
          <Select value={type} onValueChange={handleFieldTypeChange}>
            <SelectTrigger size="sm" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="item-selected">Item selected</SelectItem>
              <SelectItem value="item-quantity">Item quantity</SelectItem>
              <SelectItem value="pricing-total">Pricing total</SelectItem>
            </SelectContent>
          </Select>

          {/* Item Select (for item-specific fields) */}
          {(type === "item-selected" || type === "item-quantity") && (
            <Select value={itemId || ""} onValueChange={handleItemChange}>
              <SelectTrigger size="sm" className="w-full">
                <SelectValue placeholder="Select item" />
              </SelectTrigger>
              <SelectContent>
                {pricingItems.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Operator Select */}
          <Select
            value={rule.operator}
            onValueChange={(op) => onUpdate({ operator: op as ConditionOperator })}
          >
            <SelectTrigger size="sm" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {OPERATORS.map((op) => (
                <SelectItem key={op.value} value={op.value}>
                  {op.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Value Input */}
          {type === "item-selected" ? (
            <div className="flex items-center gap-2 h-8 px-3 border rounded-md bg-background">
              <Switch
                checked={rule.value === true}
                onCheckedChange={handleValueChange}
              />
              <Label className="text-xs">
                {rule.value === true ? "Selected" : "Not selected"}
              </Label>
            </div>
          ) : (
            <Input
              type="number"
              value={rule.value as number}
              onChange={(e) => handleValueChange(Number(e.target.value))}
              className="h-8"
              placeholder="Value"
            />
          )}
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onDelete}
          className="text-muted-foreground hover:text-destructive"
        >
          <X className="size-4" />
        </Button>
      </div>
    </div>
  )
}
