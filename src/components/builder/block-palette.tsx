"use client"

import { useDraggable } from "@dnd-kit/core"
import {
  Type,
  Image,
  DollarSign,
  PenTool,
  Minus,
  Square,
  Video,
  Table,
  CreditCard,
  FileCode2,
  LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { BlockType } from "@/hooks/use-builder"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface BlockPaletteItem {
  type: BlockType
  label: string
  icon: LucideIcon
  description: string
}

const blockTypes: BlockPaletteItem[] = [
  { type: "text", label: "Text", icon: Type, description: "Add text paragraph" },
  { type: "image", label: "Image", icon: Image, description: "Upload or embed image" },
  { type: "video-embed", label: "Video", icon: Video, description: "Embed YouTube/Vimeo" },
  { type: "pricing-table", label: "Pricing", icon: DollarSign, description: "Itemized pricing table" },
  { type: "table", label: "Table", icon: Table, description: "Data table" },
  { type: "payment", label: "Payment", icon: CreditCard, description: "Collect payment" },
  { type: "signature", label: "Signature", icon: PenTool, description: "Signature field" },
  { type: "data-uri", label: "Ethscription", icon: FileCode2, description: "On-chain data inscription" },
  { type: "divider", label: "Divider", icon: Minus, description: "Horizontal line" },
  { type: "spacer", label: "Spacer", icon: Square, description: "Vertical spacing" },
]

function DraggableBlockItem({ item }: { item: BlockPaletteItem }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${item.type}`,
    data: { type: "palette-item", blockType: item.type },
  })

  const Icon = item.icon

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          ref={setNodeRef}
          style={{ touchAction: "none" }}
          {...listeners}
          {...attributes}
          className={cn(
            "flex h-10 w-10 cursor-grab items-center justify-center rounded-lg border bg-background transition-all",
            "hover:border-primary hover:bg-primary/10 hover:text-primary",
            "active:cursor-grabbing",
            isDragging && "opacity-40"
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>
        <p className="font-medium">{item.label}</p>
        <p className="text-xs text-muted-foreground">{item.description}</p>
      </TooltipContent>
    </Tooltip>
  )
}

export function BlockPalette() {
  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex h-full w-14 flex-col border-r bg-background">
        <div className="flex-1 overflow-auto p-2">
          <div className="grid grid-cols-1 gap-2">
            {blockTypes.map((item) => (
              <DraggableBlockItem key={item.type} item={item} />
            ))}
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
