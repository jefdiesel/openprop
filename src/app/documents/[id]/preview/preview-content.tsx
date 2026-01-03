"use client"

import { BlockRenderer } from "@/components/builder/document-canvas"
import type { Block } from "@/hooks/use-builder"

interface PreviewContentProps {
  blocks: Block[]
}

export function PreviewContent({ blocks }: PreviewContentProps) {
  return (
    <div className="space-y-2">
      {blocks.map((block) => (
        <BlockRenderer key={block.id} block={block} />
      ))}
    </div>
  )
}
