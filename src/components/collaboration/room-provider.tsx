"use client"

import { ReactNode, Suspense } from "react"
import { RoomProvider as LiveblocksRoomProvider } from "@/lib/liveblocks.config"
import type { Block } from "@/hooks/use-builder"
import { Loader2 } from "lucide-react"

interface CollaborationRoomProviderProps {
  documentId: string
  initialBlocks?: Block[]
  initialTitle?: string
  children: ReactNode
}

export function CollaborationRoomProvider({
  documentId,
  initialBlocks = [],
  initialTitle = "Untitled Document",
  children,
}: CollaborationRoomProviderProps) {
  const roomId = `document:${documentId}`

  return (
    <LiveblocksRoomProvider
      id={roomId}
      initialPresence={{
        cursor: null,
        selectedBlockId: null,
        isTyping: false,
      }}
      initialStorage={{
        blocksJson: JSON.stringify(initialBlocks),
        documentTitle: initialTitle,
      }}
    >
      <Suspense fallback={<CollaborationLoadingState />}>
        {children}
      </Suspense>
    </LiveblocksRoomProvider>
  )
}

function CollaborationLoadingState() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Connecting to collaboration...</p>
      </div>
    </div>
  )
}

// Non-collaborative wrapper for when collaboration is disabled
export function LocalRoomProvider({ children }: { children: ReactNode }) {
  return <>{children}</>
}
