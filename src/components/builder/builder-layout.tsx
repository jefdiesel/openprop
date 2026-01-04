"use client"

import { useState, useCallback } from "react"
import {
  DndContext,
  DragOverlay,
  DragEndEvent,
  DragStartEvent,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { Menu, PanelLeft, PanelRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { BuilderProvider, useBuilder, BlockType, Block } from "@/hooks/use-builder"
import { BlockPalette } from "./block-palette"
import { DocumentCanvas, DragOverlayBlock } from "./document-canvas"
import { BlockSettings } from "./block-settings"
import { BuilderToolbar } from "./builder-toolbar"

interface BuilderLayoutInnerProps {
  onSave?: () => Promise<void>
  onPreview?: () => void
  onSend?: () => void
}

// Palette item preview component
function PaletteItemOverlay({ blockType }: { blockType: BlockType }) {
  const labels: Record<BlockType, string> = {
    text: "Text Block",
    image: "Image",
    "pricing-table": "Pricing Table",
    signature: "Signature",
    divider: "Divider",
    spacer: "Spacer",
    "video-embed": "Video",
    table: "Table",
    payment: "Payment",
    "data-uri": "Ethscription",
  }

  return (
    <div className="rounded-md border bg-background p-4 shadow-lg">
      <span className="text-sm font-medium">{labels[blockType] || blockType}</span>
    </div>
  )
}

function BuilderLayoutInner({ onSave, onPreview, onSend }: BuilderLayoutInnerProps) {
  const { addBlock, moveBlock, state } = useBuilder()
  const [leftPanelOpen, setLeftPanelOpen] = useState(false)
  const [rightPanelOpen, setRightPanelOpen] = useState(false)
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false)
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activePaletteType, setActivePaletteType] = useState<BlockType | null>(null)

  // Configure sensors with activation constraint to prevent scroll interference
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
    // Track if it's a palette item
    if (event.active.data.current?.type === "palette-item") {
      setActivePaletteType(event.active.data.current.blockType as BlockType)
    } else {
      setActivePaletteType(null)
    }
  }, [])

  // Handle drop from palette to canvas AND reordering within canvas
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      setActiveId(null)
      setActivePaletteType(null)

      if (!over) return

      // If dragging from palette (new block)
      if (active.data.current?.type === "palette-item") {
        const blockType = active.data.current.blockType as BlockType

        if (over.id === "canvas-drop-zone") {
          // Drop on empty canvas
          addBlock(blockType)
        } else {
          // Drop near existing block
          const overIndex = state.blocks.findIndex((b) => b.id === over.id)
          if (overIndex !== -1) {
            addBlock(blockType, overIndex + 1)
          } else {
            addBlock(blockType)
          }
        }
        return
      }

      // Reordering existing blocks
      if (active.id !== over.id && over.id !== "canvas-drop-zone") {
        moveBlock(active.id as string, over.id as string)
      }
    },
    [addBlock, moveBlock, state.blocks]
  )

  // Get the active block for drag overlay
  const activeBlock = activeId
    ? state.blocks.find((b) => b.id === activeId)
    : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-screen flex-col">
        {/* Toolbar */}
        <BuilderToolbar onSave={onSave} onPreview={onPreview} onSend={onSend} />

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Mobile Toggle Buttons */}
          <div className="fixed bottom-4 left-4 z-50 flex gap-2 lg:hidden">
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full shadow-lg"
              onClick={() => setLeftPanelOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          <div className="fixed bottom-4 right-4 z-50 lg:hidden">
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full shadow-lg"
              onClick={() => setRightPanelOpen(true)}
            >
              <PanelRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Desktop Left Panel (Block Palette) */}
          <div
            className={cn(
              "hidden transition-all duration-300 lg:block",
              leftPanelCollapsed ? "w-0 overflow-hidden" : "w-64"
            )}
          >
            <BlockPalette />
          </div>

          {/* Left Panel Collapse Toggle */}
          <div className="relative hidden lg:block">
            <Button
              variant="ghost"
              size="icon-sm"
              className="absolute -right-3 top-4 z-10 h-6 w-6 rounded-full border bg-background shadow-sm"
              onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
            >
              <PanelLeft
                className={cn(
                  "h-3 w-3 transition-transform",
                  leftPanelCollapsed && "rotate-180"
                )}
              />
            </Button>
          </div>

          {/* Mobile Left Panel (Sheet) */}
          <Sheet open={leftPanelOpen} onOpenChange={setLeftPanelOpen}>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Block Palette</SheetTitle>
                <SheetDescription>
                  Drag blocks to build your document
                </SheetDescription>
              </SheetHeader>
              <BlockPalette />
            </SheetContent>
          </Sheet>

          {/* Canvas */}
          <DocumentCanvas />

          {/* Right Panel Collapse Toggle */}
          <div className="relative hidden lg:block">
            <Button
              variant="ghost"
              size="icon-sm"
              className="absolute -left-3 top-4 z-10 h-6 w-6 rounded-full border bg-background shadow-sm"
              onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
            >
              <PanelRight
                className={cn(
                  "h-3 w-3 transition-transform",
                  rightPanelCollapsed && "rotate-180"
                )}
              />
            </Button>
          </div>

          {/* Desktop Right Panel (Block Settings) */}
          <div
            className={cn(
              "hidden transition-all duration-300 lg:block",
              rightPanelCollapsed ? "w-0 overflow-hidden" : "w-72"
            )}
          >
            <BlockSettings />
          </div>

          {/* Mobile Right Panel (Sheet) */}
          <Sheet open={rightPanelOpen} onOpenChange={setRightPanelOpen}>
            <SheetContent side="right" className="w-80 p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Block Settings</SheetTitle>
                <SheetDescription>
                  Edit the selected block properties
                </SheetDescription>
              </SheetHeader>
              <BlockSettings />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Drag Overlay - must be above everything */}
      <DragOverlay dropAnimation={null} zIndex={9999}>
        {activePaletteType ? (
          <PaletteItemOverlay blockType={activePaletteType} />
        ) : activeBlock ? (
          <DragOverlayBlock block={activeBlock} />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

interface BuilderLayoutProps {
  documentId?: string
  initialTitle?: string
  initialBlocks?: Block[]
  onSave?: () => Promise<void>
  onPreview?: () => void
  onSend?: () => void
}

export function BuilderLayout({
  onSave,
  onPreview,
  onSend,
}: BuilderLayoutProps) {
  return (
    <BuilderProvider>
      <BuilderLayoutInner
        onSave={onSave}
        onPreview={onPreview}
        onSend={onSend}
      />
    </BuilderProvider>
  )
}
