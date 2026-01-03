"use client"

import { cn } from "@/lib/utils"

// Note: This component requires Liveblocks to be configured
// When set up, use useOthers() from "@/lib/liveblocks.config"

interface User {
  name: string
  color: string
  isTyping?: boolean
}

interface SelectionIndicatorProps {
  blockId: string
  className?: string
  // Users who have selected this block
  users?: User[]
}

export function SelectionIndicator({ blockId, className, users = [] }: SelectionIndicatorProps) {
  if (users.length === 0) {
    return null
  }

  // Use the first user's color for the border
  const primaryUser = users[0]
  const color = primaryUser.color || "#888"

  return (
    <div
      className={cn(
        "pointer-events-none absolute -inset-0.5 rounded-lg border-2 transition-opacity",
        className
      )}
      style={{ borderColor: color }}
    >
      {/* User badge */}
      <div
        className="absolute -top-5 left-2 flex items-center gap-1 rounded-t-md px-2 py-0.5 text-xs font-medium text-white"
        style={{ backgroundColor: color }}
      >
        {users.length === 1 ? (
          <span>{primaryUser.name || "Someone"}</span>
        ) : (
          <span>
            {primaryUser.name || "Someone"} +{users.length - 1}
          </span>
        )}
        {/* Typing indicator */}
        {users.some((u) => u.isTyping) && <TypingDots />}
      </div>
    </div>
  )
}

function TypingDots() {
  return (
    <span className="flex items-center gap-0.5 ml-1">
      <span className="h-1 w-1 rounded-full bg-white animate-bounce [animation-delay:-0.3s]" />
      <span className="h-1 w-1 rounded-full bg-white animate-bounce [animation-delay:-0.15s]" />
      <span className="h-1 w-1 rounded-full bg-white animate-bounce" />
    </span>
  )
}

// Hook to check if others have a block selected - placeholder
export function useOthersSelectedBlock(_blockId: string) {
  return {
    hasOthersSelected: false,
    users: [] as User[],
  }
}
