"use client"

import { createClient } from "@liveblocks/client"
import { createRoomContext } from "@liveblocks/react"

// Create the Liveblocks client
const client = createClient({
  authEndpoint: "/api/liveblocks-auth",
})

// User colors for presence indicators
export const PRESENCE_COLORS = [
  "#E57373", // Red
  "#64B5F6", // Blue
  "#81C784", // Green
  "#FFB74D", // Orange
  "#BA68C8", // Purple
  "#4DD0E1", // Cyan
  "#F06292", // Pink
  "#AED581", // Light Green
]

// Get a consistent color for a user based on their ID
export function getUserColor(userId: string): string {
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash)
  }
  return PRESENCE_COLORS[Math.abs(hash) % PRESENCE_COLORS.length]
}

// Presence type - ephemeral data about each user
type Presence = {
  cursor: { x: number; y: number } | null
  selectedBlockId: string | null
  isTyping: boolean
}

// Storage type - using JSON-compatible types for Liveblocks
// Blocks are stored as serialized JSON string to avoid complex nested types
type Storage = {
  blocksJson: string // JSON.stringify(blocks)
  documentTitle: string
}

// User metadata (from auth)
type UserMeta = {
  id: string
  info: {
    name: string
    email: string
    color: string
    avatar?: string
  }
}

// Room event types
type RoomEvent =
  | { type: "BLOCK_UPDATED"; blockId: string; userId: string }
  | { type: "USER_JOINED"; userId: string; userName: string }
  | { type: "USER_LEFT"; userId: string }

// Create the room context with typed hooks
export const {
  RoomProvider,
  useRoom,
  useMyPresence,
  useUpdateMyPresence,
  useSelf,
  useOthers,
  useOthersMapped,
  useOthersConnectionIds,
  useOther,
  useBroadcastEvent,
  useEventListener,
  useErrorListener,
  useStorage,
  useMutation,
  useHistory,
  useUndo,
  useRedo,
  useCanUndo,
  useCanRedo,
  useStatus,
} = createRoomContext<Presence, Storage, UserMeta, RoomEvent>(client)
