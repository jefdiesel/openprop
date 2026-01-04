"use client"

import React, { useCallback, useState, useRef, useMemo } from "react"
import {
  useDroppable,
} from "@dnd-kit/core"
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Trash2, GripVertical, Upload, ImageIcon, CreditCard, Clock, DollarSign } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  useBuilder,
  Block,
  TextBlockData,
  ImageBlockData,
  PricingTableBlockData,
  SignatureBlockData,
  DividerBlockData,
  SpacerBlockData,
  VideoEmbedBlockData,
  TableBlockData,
  PaymentBlockData,
} from "@/hooks/use-builder"

// Block Renderers
function TextBlockRenderer({
  data,
  onUpdate,
  isSelected
}: {
  data: TextBlockData
  onUpdate?: (data: Partial<TextBlockData>) => void
  isSelected?: boolean
}) {
  const [isFocused, setIsFocused] = useState(false)
  const [localContent, setLocalContent] = useState(data.content)
  const divRef = useRef<HTMLDivElement>(null)

  // Sync local content with data when it changes externally
  React.useEffect(() => {
    setLocalContent(data.content)
  }, [data.content])

  const handleInput = useCallback((e: React.FormEvent<HTMLDivElement>) => {
    const content = e.currentTarget.innerText
    setLocalContent(content)
  }, [])

  const handleBlur = useCallback((e: React.FormEvent<HTMLDivElement>) => {
    const content = e.currentTarget.innerText
    setIsFocused(false)
    setLocalContent(content)
    onUpdate?.({ content })
  }, [onUpdate])

  const handleFocus = useCallback(() => {
    setIsFocused(true)
  }, [])

  // Prevent keyboard events from bubbling to DndContext (fixes spacebar issue)
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    e.stopPropagation()
  }, [])

  const showPlaceholder = !localContent?.trim() && !isFocused && onUpdate

  return (
    <div className="relative">
      {showPlaceholder && (
        <div
          className="absolute inset-0 text-muted-foreground pointer-events-none px-1"
          style={{
            fontSize: `${data.fontSize}px`,
            textAlign: data.alignment,
          }}
        >
          Click to add text...
        </div>
      )}
      <div
        ref={divRef}
        contentEditable={!!onUpdate}
        suppressContentEditableWarning
        onInput={handleInput}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        style={{
          fontSize: `${data.fontSize}px`,
          textAlign: data.alignment,
          color: data.color,
          fontWeight: data.fontWeight,
        }}
        className={cn(
          "min-h-[24px] whitespace-pre-wrap outline-none",
          onUpdate && "cursor-text focus:ring-1 focus:ring-primary/50 rounded px-1 -mx-1"
        )}
      >
        {data.content}
      </div>
    </div>
  )
}

function ImageBlockRenderer({
  data,
  onUpdate,
}: {
  data: ImageBlockData
  onUpdate?: (data: Partial<ImageBlockData>) => void
}) {
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const url = e.target?.result as string
      onUpdate?.({ url })
    }
    reader.readAsDataURL(file)
  }, [onUpdate])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false)
  }, [])

  const handleClick = useCallback(() => {
    if (onUpdate) fileInputRef.current?.click()
  }, [onUpdate])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }, [handleFile])

  if (!data.url) {
    return (
      <div
        className={cn(
          "flex h-32 flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed transition-colors",
          isDragOver ? "border-primary bg-primary/10" : "border-muted-foreground/25 bg-muted/50",
          onUpdate && "cursor-pointer hover:border-primary/50",
          data.alignment === "center" && "mx-auto",
          data.alignment === "right" && "ml-auto"
        )}
        style={{ width: `${data.width}%` }}
        onDrop={onUpdate ? handleDrop : undefined}
        onDragOver={onUpdate ? handleDragOver : undefined}
        onDragLeave={onUpdate ? handleDragLeave : undefined}
        onClick={handleClick}
      >
        <ImageIcon className="h-8 w-8 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          {onUpdate ? "Drop image or click to upload" : "No image selected"}
        </span>
        {onUpdate && (
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        )}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "relative group",
        data.alignment === "center" && "mx-auto",
        data.alignment === "right" && "ml-auto"
      )}
      style={{ width: `${data.width}%` }}
      onDrop={onUpdate ? handleDrop : undefined}
      onDragOver={onUpdate ? handleDragOver : undefined}
      onDragLeave={onUpdate ? handleDragLeave : undefined}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={data.url}
        alt={data.alt}
        className="h-auto w-full rounded-md"
        style={{ height: data.height === "auto" ? "auto" : data.height }}
      />
      {onUpdate && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md cursor-pointer"
          onClick={handleClick}
        >
          <div className="text-white text-sm flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Replace image
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      )}
    </div>
  )
}

function PricingTableBlockRenderer({ data }: { data: PricingTableBlockData }) {
  const total = data.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: data.currency,
    }).format(amount)
  }

  return (
    <div className="rounded-md border">
      {data.title && (
        <div className="border-b bg-muted/50 px-4 py-2 font-medium">
          {data.title}
        </div>
      )}
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/30">
            <th className="px-4 py-2 text-left text-sm font-medium">Description</th>
            <th className="px-4 py-2 text-right text-sm font-medium">Qty</th>
            <th className="px-4 py-2 text-right text-sm font-medium">Unit Price</th>
            <th className="px-4 py-2 text-right text-sm font-medium">Total</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item) => (
            <tr key={item.id} className="border-b last:border-0">
              <td className="px-4 py-2 text-sm">{item.description}</td>
              <td className="px-4 py-2 text-right text-sm">{item.quantity}</td>
              <td className="px-4 py-2 text-right text-sm">
                {formatCurrency(item.unitPrice)}
              </td>
              <td className="px-4 py-2 text-right text-sm">
                {formatCurrency(item.quantity * item.unitPrice)}
              </td>
            </tr>
          ))}
        </tbody>
        {data.showTotal && (
          <tfoot>
            <tr className="bg-muted/50">
              <td colSpan={3} className="px-4 py-2 text-right font-medium">
                Total
              </td>
              <td className="px-4 py-2 text-right font-medium">
                {formatCurrency(total)}
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  )
}

function SignatureBlockRenderer({ data }: { data: SignatureBlockData }) {
  return (
    <div className="rounded-md border p-4">
      <div className="mb-2 text-sm font-medium">
        {data.role}
        {data.required && <span className="ml-1 text-destructive">*</span>}
      </div>
      {data.signatureData ? (
        <div className="flex flex-col gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.signatureData}
            alt="Signature"
            className="h-16 border-b border-dashed"
          />
          {data.signedAt && (
            <span className="text-xs text-muted-foreground">
              Signed on {new Date(data.signedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      ) : (
        <div className="flex h-16 items-center justify-center border-b border-dashed">
          <span className="text-sm text-muted-foreground">
            Click to sign
          </span>
        </div>
      )}
    </div>
  )
}

function DividerBlockRenderer({ data }: { data: DividerBlockData }) {
  return (
    <hr
      style={{
        borderStyle: data.style,
        borderWidth: `${data.thickness}px 0 0 0`,
        borderColor: data.color,
      }}
      className="my-2"
    />
  )
}

function SpacerBlockRenderer({ data }: { data: SpacerBlockData }) {
  return <div style={{ height: data.height }} className="bg-muted/20" />
}

function VideoEmbedBlockRenderer({ data }: { data: VideoEmbedBlockData }) {
  const getAspectRatioClass = () => {
    switch (data.aspectRatio) {
      case "16:9":
        return "aspect-video"
      case "4:3":
        return "aspect-[4/3]"
      case "1:1":
        return "aspect-square"
    }
  }

  if (!data.url) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/25 bg-muted/50",
          getAspectRatioClass()
        )}
      >
        <span className="text-sm text-muted-foreground">No video URL</span>
      </div>
    )
  }

  // Convert YouTube/Vimeo URLs to embed URLs
  let embedUrl = data.url
  if (data.url.includes("youtube.com/watch")) {
    const videoId = new URL(data.url).searchParams.get("v")
    embedUrl = `https://www.youtube.com/embed/${videoId}`
  } else if (data.url.includes("youtu.be/")) {
    const videoId = data.url.split("youtu.be/")[1]?.split("?")[0]
    embedUrl = `https://www.youtube.com/embed/${videoId}`
  } else if (data.url.includes("vimeo.com/")) {
    const videoId = data.url.split("vimeo.com/")[1]?.split("?")[0]
    embedUrl = `https://player.vimeo.com/video/${videoId}`
  }

  return (
    <div className={cn("w-full overflow-hidden rounded-md", getAspectRatioClass())}>
      <iframe
        src={embedUrl}
        title={data.title || "Embedded video"}
        className="h-full w-full"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    </div>
  )
}

function TableBlockRenderer({ data }: { data: TableBlockData }) {
  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full">
        <thead>
          <tr style={{ backgroundColor: data.headerBackground }}>
            {data.headers.map((header, i) => (
              <th key={i} className="border-b px-4 py-2 text-left text-sm font-medium">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.cells.map((row, i) => (
            <tr key={i} className="border-b last:border-0">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-2 text-sm">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function PaymentBlockRenderer({ data }: { data: PaymentBlockData }) {
  const { state } = useBuilder()
  const currencySymbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    CAD: "C$",
    AUD: "A$",
  }
  const symbol = currencySymbols[data.currency] || data.currency

  // Calculate pricing table total if using it
  const pricingTableTotal = useMemo(() => {
    if (!data.usePricingTableTotal) return 0
    const pricingBlock = state.blocks.find((b) => b.type === "pricing-table")
    if (!pricingBlock) return 0
    const pricingData = pricingBlock.data as PricingTableBlockData
    return pricingData.items.reduce(
      (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
      0
    )
  }, [data.usePricingTableTotal, state.blocks])

  // Calculate amount based on down payment percentage (with NaN protection)
  const safeDownPaymentPercent = useMemo(() => {
    const raw = data.downPaymentPercent
    if (raw === undefined || raw === null) return 0
    const parsed = typeof raw === 'string' ? parseFloat(raw) : Number(raw)
    return Number.isFinite(parsed) ? parsed : 0
  }, [data.downPaymentPercent])

  const displayAmount = useMemo(() => {
    if (data.usePricingTableTotal) {
      if (safeDownPaymentPercent > 0 && safeDownPaymentPercent < 100) {
        return pricingTableTotal * (safeDownPaymentPercent / 100)
      }
      return pricingTableTotal
    }
    return data.amount || 0
  }, [data.usePricingTableTotal, safeDownPaymentPercent, data.amount, pricingTableTotal])

  const downPaymentLabel = safeDownPaymentPercent > 0 && safeDownPaymentPercent < 100
    ? `${safeDownPaymentPercent}% down`
    : null

  return (
    <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <CreditCard className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-primary">Payment Required</h4>
          <p className="text-sm text-muted-foreground">{data.description}</p>

          <div className="mt-3 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold text-primary">
                {symbol}{displayAmount.toFixed(2)}
              </span>
              {downPaymentLabel && (
                <span className="text-sm text-muted-foreground">({downPaymentLabel})</span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {data.timing === "due_now" ? "Due Now" : data.timing === "net_30" ? "Net 30" : "Net 60"}
              </span>
            </div>
          </div>

          {data.paymentStatus === "paid" && (
            <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Paid {data.paidAt ? `on ${new Date(data.paidAt).toLocaleDateString()}` : ""}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Block Renderer Component
function BlockRenderer({
  block,
  onUpdate,
  isSelected,
}: {
  block: Block
  onUpdate?: (data: Record<string, unknown>) => void
  isSelected?: boolean
}) {
  switch (block.type) {
    case "text":
      return <TextBlockRenderer data={block.data as TextBlockData} onUpdate={onUpdate} isSelected={isSelected} />
    case "image":
      return <ImageBlockRenderer data={block.data as ImageBlockData} onUpdate={onUpdate} />
    case "pricing-table":
      return <PricingTableBlockRenderer data={block.data as PricingTableBlockData} />
    case "signature":
      return <SignatureBlockRenderer data={block.data as SignatureBlockData} />
    case "divider":
      return <DividerBlockRenderer data={block.data as DividerBlockData} />
    case "spacer":
      return <SpacerBlockRenderer data={block.data as SpacerBlockData} />
    case "video-embed":
      return <VideoEmbedBlockRenderer data={block.data as VideoEmbedBlockData} />
    case "table":
      return <TableBlockRenderer data={block.data as TableBlockData} />
    case "payment":
      return <PaymentBlockRenderer data={block.data as PaymentBlockData} />
    default:
      return <div>Unknown block type</div>
  }
}

// Sortable Block Item
function SortableBlockItem({
  block,
  isSelected,
  onSelect,
  onDelete,
  onUpdate,
}: {
  block: Block
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
  onUpdate: (data: Record<string, unknown>) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative rounded-md border bg-background transition-all",
        isSelected && "ring-2 ring-primary ring-offset-2",
        isDragging && "z-50 opacity-50"
      )}
      onClick={(e) => {
        e.stopPropagation()
        onSelect()
      }}
    >
      {/* Drag Handle & Actions */}
      <div
        className={cn(
          "absolute -left-10 top-0 flex flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100",
          isSelected && "opacity-100"
        )}
      >
        <button
          className="flex h-8 w-8 cursor-grab items-center justify-center rounded-md border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </div>

      {/* Delete Button */}
      <div
        className={cn(
          "absolute -right-10 top-0 opacity-0 transition-opacity group-hover:opacity-100",
          isSelected && "opacity-100"
        )}
      >
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Block Content */}
      <div className="p-4">
        <BlockRenderer block={block} onUpdate={onUpdate} isSelected={isSelected} />
      </div>
    </div>
  )
}

// Drag Overlay Block
function DragOverlayBlock({ block }: { block: Block }) {
  return (
    <div className="rounded-md border bg-background p-4 shadow-lg">
      <BlockRenderer block={block} />
    </div>
  )
}

// Empty Canvas Drop Zone
function EmptyCanvasDropZone() {
  const { isOver, setNodeRef } = useDroppable({
    id: "canvas-drop-zone",
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors",
        isOver
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25"
      )}
    >
      <p className="text-center text-muted-foreground">
        Drag blocks here to start building your document
      </p>
    </div>
  )
}

// Editable Document Title Component
function DocumentTitle() {
  const { state, setTitle } = useBuilder()
  const [isEditing, setIsEditing] = useState(false)
  const [localTitle, setLocalTitle] = useState(state.documentTitle)
  const inputRef = useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    setLocalTitle(state.documentTitle)
  }, [state.documentTitle])

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleSubmit = useCallback(() => {
    setTitle(localTitle.trim() || "Untitled Document")
    setIsEditing(false)
  }, [localTitle, setTitle])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    e.stopPropagation()
    if (e.key === "Enter") {
      handleSubmit()
    } else if (e.key === "Escape") {
      setLocalTitle(state.documentTitle)
      setIsEditing(false)
    }
  }, [handleSubmit, state.documentTitle])

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={localTitle}
        onChange={(e) => setLocalTitle(e.target.value)}
        onBlur={handleSubmit}
        onKeyDown={handleKeyDown}
        className="w-full text-3xl font-bold bg-transparent border-b-2 border-primary/50 outline-none pb-2 mb-6"
        placeholder="Document Title"
      />
    )
  }

  return (
    <h1
      onClick={() => setIsEditing(true)}
      className="text-3xl font-bold mb-6 pb-2 border-b border-transparent hover:border-muted-foreground/20 cursor-text transition-colors"
    >
      {state.documentTitle || "Untitled Document"}
    </h1>
  )
}

// Main Canvas Component
export function DocumentCanvas() {
  const { state, selectBlock, removeBlock, updateBlock } = useBuilder()

  const handleCanvasClick = useCallback(() => {
    selectBlock(null)
  }, [selectBlock])

  return (
    <div
      className="flex-1 overflow-auto bg-muted/30 p-8"
      onClick={handleCanvasClick}
    >
      <div className="mx-auto max-w-3xl">
        {/* Document Paper */}
        <div className="min-h-[800px] rounded-lg border bg-background p-8 shadow-sm">
          {/* Document Title */}
          <DocumentTitle />

          {state.blocks.length === 0 ? (
            <EmptyCanvasDropZone />
          ) : (
            <SortableContext
              items={state.blocks.map((b) => b.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {state.blocks.map((block) => (
                  <SortableBlockItem
                    key={block.id}
                    block={block}
                    isSelected={state.selectedBlockId === block.id}
                    onSelect={() => selectBlock(block.id)}
                    onDelete={() => removeBlock(block.id)}
                    onUpdate={(data) => updateBlock(block.id, data)}
                  />
                ))}
              </div>
            </SortableContext>
          )}
        </div>
      </div>
    </div>
  )
}

// Export for drag overlay
export { BlockRenderer, DragOverlayBlock }
