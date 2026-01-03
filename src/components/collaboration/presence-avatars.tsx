"use client"

import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Note: These components require Liveblocks to be configured with LIVEBLOCKS_SECRET_KEY
// When Liveblocks is set up, import and use:
// import { useOthers, useSelf } from "@/lib/liveblocks.config"

interface User {
  connectionId: number
  info?: {
    name?: string
    email?: string
    color?: string
    avatar?: string
  }
}

interface PresenceAvatarsProps {
  maxDisplayed?: number
  className?: string
  // For now, users are passed as prop until Liveblocks is configured
  users?: User[]
}

export function PresenceAvatars({ maxDisplayed = 5, className, users = [] }: PresenceAvatarsProps) {
  if (users.length === 0) {
    return null
  }

  const displayedUsers = users.slice(0, maxDisplayed)
  const remainingCount = users.length - maxDisplayed

  return (
    <TooltipProvider>
      <div className={cn("flex items-center -space-x-2", className)}>
        {displayedUsers.map((user) => (
          <Tooltip key={user.connectionId}>
            <TooltipTrigger asChild>
              <div
                className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-background text-xs font-medium text-white shadow-sm ring-2 ring-background transition-transform hover:z-10 hover:scale-110"
                style={{ backgroundColor: user.info?.color || "#888" }}
              >
                {user.info?.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.info.avatar}
                    alt={user.info?.name || "User"}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  getInitials(user.info?.name || user.info?.email || "?")
                )}
                {/* Online indicator */}
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="font-medium">{user.info?.name || "Anonymous"}</p>
              {user.info?.email && (
                <p className="text-xs text-muted-foreground">{user.info.email}</p>
              )}
              <p className="text-xs text-green-600">Editing</p>
            </TooltipContent>
          </Tooltip>
        ))}

        {remainingCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium text-muted-foreground shadow-sm">
                +{remainingCount}
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{remainingCount} more {remainingCount === 1 ? "person" : "people"} editing</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  )
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

// Connection status indicator - placeholder for when Liveblocks is configured
export function ConnectionStatus() {
  return null
}
