"use client"

import * as React from "react"
import { BracesIcon, SearchIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { BUILT_IN_VARIABLES } from "@/lib/variables"

interface VariablePickerProps {
  customVariables?: Array<{
    name: string
    defaultValue: string
    description?: string
  }>
  onSelect: (variable: string) => void // Callback with "{{varName}}"
  trigger?: React.ReactNode // Optional custom trigger, defaults to button
}

interface VariableItem {
  key: string
  label: string
  description?: string
  category: string
}

export function VariablePicker({
  customVariables = [],
  onSelect,
  trigger,
}: VariablePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")

  // Transform built-in variables into a flat structure
  const builtInItems: VariableItem[] = React.useMemo(() => {
    return BUILT_IN_VARIABLES.map((variable) => ({
      key: variable.name,
      label: variable.name.split('.').pop() || variable.name, // e.g., "recipient.name" -> "name"
      description: variable.description,
      category: variable.category,
    }))
  }, [])

  // Transform custom variables
  const customItems: VariableItem[] = React.useMemo(() => {
    return customVariables.map((variable) => ({
      key: variable.name,
      label: variable.name,
      description: variable.description || variable.defaultValue,
      category: "Custom",
    }))
  }, [customVariables])

  const allItems = [...builtInItems, ...customItems]

  // Group items by category
  const groupedItems = React.useMemo(() => {
    const groups = new Map<string, VariableItem[]>()

    allItems.forEach((item) => {
      const category = item.category
      if (!groups.has(category)) {
        groups.set(category, [])
      }
      groups.get(category)!.push(item)
    })

    return groups
  }, [allItems])

  const handleSelect = (variableKey: string) => {
    onSelect(`{{${variableKey}}}`)
    setOpen(false)
    setSearch("")
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <BracesIcon className="h-4 w-4" />
            Insert Variable
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <Command>
          <div className="flex items-center gap-2 border-b px-3 py-2">
            <SearchIcon className="h-4 w-4 shrink-0 opacity-50" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search variables..."
              className="flex h-8 w-full bg-transparent text-sm outline-hidden placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <CommandList>
            <CommandEmpty>No variables found.</CommandEmpty>
            {Array.from(groupedItems.entries()).map(([category, items]) => {
              // Filter items based on search
              const filteredItems = search
                ? items.filter(
                    (item) =>
                      item.label.toLowerCase().includes(search.toLowerCase()) ||
                      item.key.toLowerCase().includes(search.toLowerCase()) ||
                      item.description
                        ?.toLowerCase()
                        .includes(search.toLowerCase())
                  )
                : items

              if (filteredItems.length === 0) return null

              return (
                <CommandGroup key={category} heading={category}>
                  {filteredItems.map((item) => (
                    <CommandItem
                      key={item.key}
                      value={item.key}
                      onSelect={() => handleSelect(item.key)}
                      className="flex flex-col items-start gap-1 px-3 py-2"
                    >
                      <div className="flex w-full items-center justify-between">
                        <span className="font-medium">{item.label}</span>
                        <code className="text-muted-foreground rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                          {`{{${item.key}}}`}
                        </code>
                      </div>
                      {item.description && (
                        <span className="text-muted-foreground text-xs">
                          {item.description}
                        </span>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
