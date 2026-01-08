// Variable interpolation system for merge fields

export interface VariableContext {
  recipient?: {
    name?: string
    email?: string
  }
  sender?: {
    name?: string
    email?: string
    company?: string
  }
  document?: {
    title?: string
    expiresAt?: Date
  }
}

export interface CustomVariable {
  name: string
  defaultValue: string
  description?: string
}

// Built-in variables that are auto-filled from context
export const BUILT_IN_VARIABLES = [
  { name: 'recipient.name', description: 'Recipient name', category: 'Recipient' },
  { name: 'recipient.email', description: 'Recipient email', category: 'Recipient' },
  { name: 'sender.name', description: 'Your name', category: 'Sender' },
  { name: 'sender.email', description: 'Your email', category: 'Sender' },
  { name: 'sender.company', description: 'Your company name', category: 'Sender' },
  { name: 'document.title', description: 'Document title', category: 'Document' },
  { name: 'date.today', description: 'Today\'s date', category: 'Date' },
  { name: 'date.expiry', description: 'Document expiry date', category: 'Date' },
] as const

// Regex to match {{variableName}} or {{category.variableName}}
const VARIABLE_REGEX = /\{\{([a-zA-Z_][a-zA-Z0-9_.]*)\}\}/g

// Extract all variable names from content
export function extractVariables(content: string): string[] {
  const matches = content.matchAll(VARIABLE_REGEX)
  return [...new Set([...matches].map(m => m[1]))]
}

// Check if a variable is a built-in variable
export function isBuiltInVariable(name: string): boolean {
  return BUILT_IN_VARIABLES.some(v => v.name === name)
}

// Get value for a built-in variable from context
function getBuiltInValue(name: string, context: VariableContext): string | undefined {
  const today = new Date()

  switch (name) {
    case 'recipient.name':
      return context.recipient?.name
    case 'recipient.email':
      return context.recipient?.email
    case 'sender.name':
      return context.sender?.name
    case 'sender.email':
      return context.sender?.email
    case 'sender.company':
      return context.sender?.company
    case 'document.title':
      return context.document?.title
    case 'date.today':
      return today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    case 'date.expiry':
      return context.document?.expiresAt
        ? new Date(context.document.expiresAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : undefined
    default:
      return undefined
  }
}

// Interpolate all variables in content
export function interpolateVariables(
  content: string,
  customValues: Record<string, string> = {},
  context: VariableContext = {}
): string {
  return content.replace(VARIABLE_REGEX, (match, varName) => {
    // First check custom values (user-provided overrides everything)
    if (customValues[varName] !== undefined) {
      return customValues[varName]
    }

    // Then check built-in variables
    const builtInValue = getBuiltInValue(varName, context)
    if (builtInValue !== undefined) {
      return builtInValue
    }

    // Return placeholder if not found (shows the variable name)
    return `[${varName}]`
  })
}

// Interpolate variables in all text blocks of a document
export function interpolateDocumentContent(
  blocks: Array<{ type: string; data: Record<string, unknown> }>,
  customValues: Record<string, string> = {},
  context: VariableContext = {}
): Array<{ type: string; data: Record<string, unknown> }> {
  return blocks.map(block => {
    if (block.type === 'text' && typeof block.data?.content === 'string') {
      return {
        ...block,
        data: {
          ...block.data,
          content: interpolateVariables(block.data.content as string, customValues, context)
        }
      }
    }
    return block
  })
}

// Get all variables used in document (both built-in and custom)
export function getDocumentVariables(
  blocks: Array<{ type: string; data: Record<string, unknown> }>
): { builtIn: string[]; custom: string[] } {
  const allVars = new Set<string>()

  for (const block of blocks) {
    if (block.type === 'text' && typeof block.data?.content === 'string') {
      const vars = extractVariables(block.data.content as string)
      vars.forEach(v => allVars.add(v))
    }
  }

  const builtIn: string[] = []
  const custom: string[] = []

  for (const varName of allVars) {
    if (isBuiltInVariable(varName)) {
      builtIn.push(varName)
    } else {
      custom.push(varName)
    }
  }

  return { builtIn, custom }
}
