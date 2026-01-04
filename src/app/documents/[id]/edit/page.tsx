"use client"

import { useEffect, useCallback, use, useMemo } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { BuilderProvider, useBuilder, Block, BlockType } from "@/hooks/use-builder"
import { BlockPalette } from "@/components/builder/block-palette"
import { DocumentCanvas, DragOverlayBlock } from "@/components/builder/document-canvas"
import { BlockSettings } from "@/components/builder/block-settings"
import { BuilderToolbar } from "@/components/builder/builder-toolbar"
import { SendDialog } from "@/components/send/send-dialog"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { useState } from "react"
import { Menu, PanelRight } from "lucide-react"
import { useSession } from "next-auth/react"
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  DragEndEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable"

// Palette item preview for drag overlay
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

interface PageProps {
  params: Promise<{ id: string }>
}

// Load document from API
async function loadDocument(id: string): Promise<{
  id: string
  title: string
  blocks: Block[]
}> {
  const response = await fetch(`/api/documents/${id}`)
  if (!response.ok) {
    throw new Error("Failed to load document")
  }
  const data = await response.json()
  return {
    id: data.document.id,
    title: data.document.title,
    blocks: (data.document.content as Block[]) || [],
  }
}

// Save document to API
async function saveDocument(
  id: string,
  title: string,
  blocks: Block[]
): Promise<void> {
  const response = await fetch(`/api/documents/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, content: blocks }),
  })
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
    console.error("Save document error:", errorData)
    throw new Error(errorData.error || "Failed to save document")
  }
}

function DocumentEditorContent({ documentId }: { documentId: string }) {
  const router = useRouter()
  const { data: session } = useSession()
  const { state, setDocument, setSaving, setSaved, addBlock, moveBlock } = useBuilder()
  const [leftPanelOpen, setLeftPanelOpen] = useState(false)
  const [rightPanelOpen, setRightPanelOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [sendDialogOpen, setSendDialogOpen] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activePaletteType, setActivePaletteType] = useState<BlockType | null>(null)
  const [stripeConnected, setStripeConnected] = useState(false)

  // Fetch Stripe connection status
  useEffect(() => {
    async function checkStripeStatus() {
      try {
        const response = await fetch("/api/stripe/connect/status")
        if (response.ok) {
          const data = await response.json()
          setStripeConnected(data.hasAccount && data.status?.chargesEnabled)
        }
      } catch (error) {
        console.error("Failed to check Stripe status:", error)
      }
    }
    checkStripeStatus()
  }, [])

  // Calculate if document has a pricing table or payment block and its total
  const { hasPricingTable, pricingTableTotal } = useMemo(() => {
    // First check for pricing-table block
    const pricingBlock = state.blocks.find((b) => b.type === "pricing-table")
    if (pricingBlock) {
      // Handle both flat (types/blocks.ts) and nested (use-builder) structures
      const blockAny = pricingBlock as unknown as Record<string, unknown>
      const dataItems = (pricingBlock.data as { items?: Array<{ quantity: number; unitPrice: number }> })?.items
      const flatItems = blockAny.items as Array<{ quantity: number; unitPrice: number }> | undefined
      const items = dataItems || flatItems || []
      const total = items.reduce((sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0), 0)
      console.log("Pricing table total calculation:", { dataItems: !!dataItems, flatItems: !!flatItems, itemCount: items.length, total })
      return { hasPricingTable: true, pricingTableTotal: total }
    }

    // Also check for payment block
    const paymentBlock = state.blocks.find((b) => b.type === "payment")
    if (paymentBlock) {
      const blockAny = paymentBlock as unknown as Record<string, unknown>
      const dataAmount = (paymentBlock.data as { amount?: number })?.amount
      const flatAmount = blockAny.amount as number | undefined
      const amount = dataAmount || flatAmount || 0
      return { hasPricingTable: true, pricingTableTotal: amount }
    }

    return { hasPricingTable: false, pricingTableTotal: 0 }
  }, [state.blocks])

  // Load document on mount
  useEffect(() => {
    async function load() {
      try {
        const doc = await loadDocument(documentId)
        setDocument(doc.id, doc.title, doc.blocks)
      } catch (error) {
        console.error("Failed to load document:", error)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [documentId, setDocument])

  // Save handler
  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      await saveDocument(state.documentId, state.documentTitle, state.blocks)
      setSaved(new Date())
      toast.success("Document saved")
    } catch (error) {
      console.error("Failed to save document:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save document")
      throw error
    } finally {
      setSaving(false)
    }
  }, [state.documentId, state.documentTitle, state.blocks, setSaving, setSaved])

  // Preview handler
  const handlePreview = useCallback(() => {
    // Open preview in new tab or modal
    window.open(`/documents/${documentId}/preview`, "_blank")
  }, [documentId])

  // Send handler - save first, then open dialog
  const handleSend = useCallback(async () => {
    // Save document first
    try {
      await saveDocument(state.documentId, state.documentTitle, state.blocks)
      setSaved(new Date())
    } catch (error) {
      console.error("Failed to save before send:", error)
      toast.error("Failed to save document")
      return
    }
    // Open send dialog
    setSendDialogOpen(true)
  }, [state.documentId, state.documentTitle, state.blocks, setSaved])

  // Handle successful send
  const handleSendSuccess = useCallback(() => {
    toast.success("Document sent successfully!")
    // Navigate to documents dashboard
    router.push("/documents")
  }, [router])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Drag start handler
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
    if (event.active.data.current?.type === "palette-item") {
      setActivePaletteType(event.active.data.current.blockType as BlockType)
    } else {
      setActivePaletteType(null)
    }
  }, [])

  // Drag end handler - handles both palette drops and reordering
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
          addBlock(blockType)
        } else {
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

  // Get active block for overlay
  const activeBlock = activeId ? state.blocks.find((b) => b.id === activeId) : null

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Loading document...</p>
        </div>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-screen flex-col">
        {/* Toolbar */}
        <BuilderToolbar
          onSave={handleSave}
          onPreview={handlePreview}
          onSend={handleSend}
        />

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Mobile Toggle Buttons */}
          <div className="fixed bottom-4 left-4 z-50 flex gap-2 lg:hidden">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full shadow-lg"
              onClick={() => setLeftPanelOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>

          <div className="fixed bottom-4 right-4 z-50 lg:hidden">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full shadow-lg"
              onClick={() => setRightPanelOpen(true)}
            >
              <PanelRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Desktop Left Panel (Block Palette) */}
          <div className="hidden lg:block">
            <BlockPalette />
          </div>

          {/* Mobile Left Panel (Sheet) */}
          <Sheet open={leftPanelOpen} onOpenChange={setLeftPanelOpen}>
            <SheetContent side="left" className="w-20 p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Block Palette</SheetTitle>
                <SheetDescription>Drag blocks to build your document</SheetDescription>
              </SheetHeader>
              <BlockPalette />
            </SheetContent>
          </Sheet>

          {/* Canvas */}
          <DocumentCanvas />

          {/* Desktop Right Panel (Block Settings) */}
          <div className="hidden w-56 lg:block">
            <BlockSettings />
          </div>

          {/* Mobile Right Panel (Sheet) */}
          <Sheet open={rightPanelOpen} onOpenChange={setRightPanelOpen}>
            <SheetContent side="right" className="w-64 p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Block Settings</SheetTitle>
                <SheetDescription>Edit the selected block properties</SheetDescription>
              </SheetHeader>
              <BlockSettings />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <DragOverlay dropAnimation={null} zIndex={9999}>
        {activePaletteType ? (
          <PaletteItemOverlay blockType={activePaletteType} />
        ) : activeBlock ? (
          <DragOverlayBlock block={activeBlock} />
        ) : null}
      </DragOverlay>

      {/* Send Dialog */}
      <SendDialog
        open={sendDialogOpen}
        onOpenChange={setSendDialogOpen}
        documentId={documentId}
        documentTitle={state.documentTitle}
        senderName={session?.user?.name || ""}
        senderEmail={session?.user?.email || undefined}
        onSuccess={handleSendSuccess}
        stripeConnected={stripeConnected}
        hasPricingTable={hasPricingTable}
        pricingTableTotal={pricingTableTotal}
      />
    </DndContext>
  )
}

export default function DocumentEditPage({ params }: PageProps) {
  const resolvedParams = use(params)

  return (
    <BuilderProvider>
      <DocumentEditorContent documentId={resolvedParams.id} />
    </BuilderProvider>
  )
}
