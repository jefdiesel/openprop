import type { Block, ConditionRule, ConditionGroup, PricingTableBlockData } from '@/types/blocks';

// Context passed to evaluator containing current document state
export interface EvaluationContext {
  blocks: Block[];
  // Computed values from pricing tables
  pricing: {
    items: Record<string, { isSelected: boolean; quantity: number; total: number }>;
    subtotal: number;
    total: number;
  };
}

// Build evaluation context from document blocks
export function buildEvaluationContext(blocks: Block[]): EvaluationContext {
  const pricingBlocks = blocks.filter((b): b is PricingTableBlockData => b.type === 'pricing-table');

  const items: Record<string, { isSelected: boolean; quantity: number; total: number }> = {};
  let subtotal = 0;
  let total = 0;

  for (const pricingBlock of pricingBlocks) {
    for (const item of pricingBlock.items) {
      const isSelected = !item.isOptional || item.isSelected;
      const itemTotal = item.quantity * item.unitPrice;

      items[item.id] = {
        isSelected,
        quantity: item.quantity,
        total: itemTotal,
      };

      if (isSelected && (item.name || item.unitPrice > 0)) {
        subtotal += itemTotal;
      }
    }

    // Apply discount
    let discount = 0;
    if (pricingBlock.discountValue && pricingBlock.discountValue > 0) {
      if (pricingBlock.discountType === 'percentage') {
        discount = subtotal * (pricingBlock.discountValue / 100);
      } else {
        discount = pricingBlock.discountValue;
      }
    }

    const afterDiscount = subtotal - discount;
    const tax = pricingBlock.taxRate ? afterDiscount * (pricingBlock.taxRate / 100) : 0;
    total = afterDiscount + tax;
  }

  return { blocks, pricing: { items, subtotal, total } };
}

// Get value from context using dot notation path
function getValueFromPath(context: EvaluationContext, path: string): unknown {
  const parts = path.split('.');
  let current: unknown = context;

  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    if (typeof current === 'object') {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }

  return current;
}

// Evaluate a single condition rule
function evaluateRule(rule: ConditionRule, context: EvaluationContext): boolean {
  const actualValue = getValueFromPath(context, rule.field);
  const expectedValue = rule.value;

  // Handle undefined - condition fails if field doesn't exist
  if (actualValue === undefined) return false;

  switch (rule.operator) {
    case '==':
      return actualValue === expectedValue;
    case '!=':
      return actualValue !== expectedValue;
    case '>':
      return Number(actualValue) > Number(expectedValue);
    case '<':
      return Number(actualValue) < Number(expectedValue);
    case '>=':
      return Number(actualValue) >= Number(expectedValue);
    case '<=':
      return Number(actualValue) <= Number(expectedValue);
    default:
      return false;
  }
}

// Evaluate a condition group (handles nested groups)
export function evaluateConditionGroup(group: ConditionGroup, context: EvaluationContext): boolean {
  if (group.rules.length === 0) return true;

  const results = group.rules.map((rule) => {
    if ('logic' in rule) {
      // Nested group
      return evaluateConditionGroup(rule, context);
    } else {
      // Single rule
      return evaluateRule(rule, context);
    }
  });

  if (group.logic === 'AND') {
    return results.every(Boolean);
  } else {
    return results.some(Boolean);
  }
}

// Check if a block should be visible
export function isBlockVisible(block: Block, context: EvaluationContext): boolean {
  if (!block.visibility?.condition) {
    return true; // No condition = always visible
  }

  return evaluateConditionGroup(block.visibility.condition, context);
}

// Filter blocks to only visible ones
export function filterVisibleBlocks(blocks: Block[], context: EvaluationContext): Block[] {
  return blocks.filter((block) => isBlockVisible(block, context));
}
