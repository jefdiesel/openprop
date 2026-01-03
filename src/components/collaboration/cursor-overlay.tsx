"use client"

import { cn } from "@/lib/utils"

// Note: This component requires Liveblocks to be configured
// When set up, use useOthers() from "@/lib/liveblocks.config"

interface Cursor {
  x: number
  y: number
  color: string
  name: string
}

interface CursorOverlayProps {
  className?: string
  cursors?: Cursor[]
}

export function CursorOverlay({ className, cursors = [] }: CursorOverlayProps) {
  if (cursors.length === 0) {
    return null
  }

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {cursors.map((cursor, i) => (
        <CursorComponent
          key={i}
          x={cursor.x}
          y={cursor.y}
          color={cursor.color}
          name={cursor.name}
        />
      ))}
    </div>
  )
}

interface CursorComponentProps {
  x: number
  y: number
  color: string
  name: string
}

function CursorComponent({ x, y, color, name }: CursorComponentProps) {
  return (
    <div
      className="absolute transition-transform duration-75 ease-out"
      style={{
        transform: `translate(${x}px, ${y}px)`,
      }}
    >
      {/* Cursor SVG */}
      <svg
        width="24"
        height="36"
        viewBox="0 0 24 36"
        fill="none"
        className="drop-shadow-md"
      >
        <path
          d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
          fill={color}
          stroke="white"
          strokeWidth="1"
        />
      </svg>

      {/* Name label */}
      <div
        className="absolute left-4 top-4 whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium text-white shadow-sm"
        style={{ backgroundColor: color }}
      >
        {name}
      </div>
    </div>
  )
}
