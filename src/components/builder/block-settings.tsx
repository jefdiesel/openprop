"use client"

import { useCallback } from "react"
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Plus,
  Trash2,
} from "lucide-react"
import { v4 as uuidv4 } from "uuid"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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

// Settings Components for Each Block Type

function TextBlockSettings({
  block,
  onUpdate,
}: {
  block: Block
  onUpdate: (data: Partial<TextBlockData>) => void
}) {
  const data = block.data as TextBlockData

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Content</Label>
        <Textarea
          value={data.content}
          onChange={(e) => onUpdate({ content: e.target.value })}
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label>Font Size</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={8}
            max={72}
            value={data.fontSize}
            onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) || 16 })}
            className="w-20"
          />
          <span className="text-sm text-muted-foreground">px</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Alignment</Label>
        <div className="flex gap-1">
          <Button
            variant={data.alignment === "left" ? "default" : "outline"}
            size="icon-sm"
            onClick={() => onUpdate({ alignment: "left" })}
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            variant={data.alignment === "center" ? "default" : "outline"}
            size="icon-sm"
            onClick={() => onUpdate({ alignment: "center" })}
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            variant={data.alignment === "right" ? "default" : "outline"}
            size="icon-sm"
            onClick={() => onUpdate({ alignment: "right" })}
          >
            <AlignRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Font Weight</Label>
        <Select
          value={data.fontWeight}
          onValueChange={(value: "normal" | "bold") => onUpdate({ fontWeight: value })}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="bold">Bold</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Color</Label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={data.color}
            onChange={(e) => onUpdate({ color: e.target.value })}
            className="h-9 w-9 cursor-pointer rounded-md border"
          />
          <Input
            value={data.color}
            onChange={(e) => onUpdate({ color: e.target.value })}
            className="flex-1"
          />
        </div>
      </div>
    </div>
  )
}

function ImageBlockSettings({
  block,
  onUpdate,
}: {
  block: Block
  onUpdate: (data: Partial<ImageBlockData>) => void
}) {
  const data = block.data as ImageBlockData

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Image URL</Label>
        <Input
          type="url"
          placeholder="https://..."
          value={data.url}
          onChange={(e) => onUpdate({ url: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Alt Text</Label>
        <Input
          placeholder="Describe the image"
          value={data.alt}
          onChange={(e) => onUpdate({ alt: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Width (%)</Label>
        <Input
          type="number"
          min={10}
          max={100}
          value={data.width}
          onChange={(e) => onUpdate({ width: parseInt(e.target.value) || 100 })}
        />
      </div>

      <div className="space-y-2">
        <Label>Alignment</Label>
        <div className="flex gap-1">
          <Button
            variant={data.alignment === "left" ? "default" : "outline"}
            size="icon-sm"
            onClick={() => onUpdate({ alignment: "left" })}
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            variant={data.alignment === "center" ? "default" : "outline"}
            size="icon-sm"
            onClick={() => onUpdate({ alignment: "center" })}
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            variant={data.alignment === "right" ? "default" : "outline"}
            size="icon-sm"
            onClick={() => onUpdate({ alignment: "right" })}
          >
            <AlignRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

function PricingTableBlockSettings({
  block,
  onUpdate,
}: {
  block: Block
  onUpdate: (data: Partial<PricingTableBlockData>) => void
}) {
  const data = block.data as PricingTableBlockData

  const addItem = useCallback(() => {
    onUpdate({
      items: [
        ...data.items,
        { id: uuidv4(), description: "", quantity: 1, unitPrice: 0 },
      ],
    })
  }, [data.items, onUpdate])

  const removeItem = useCallback(
    (id: string) => {
      onUpdate({
        items: data.items.filter((item) => item.id !== id),
      })
    },
    [data.items, onUpdate]
  )

  const updateItem = useCallback(
    (id: string, field: string, value: string | number) => {
      onUpdate({
        items: data.items.map((item) =>
          item.id === id ? { ...item, [field]: value } : item
        ),
      })
    },
    [data.items, onUpdate]
  )

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Title</Label>
        <Input
          value={data.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Pricing"
        />
      </div>

      <div className="space-y-2">
        <Label>Currency</Label>
        <Select
          value={data.currency}
          onValueChange={(value) => onUpdate({ currency: value })}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USD">USD ($)</SelectItem>
            <SelectItem value="EUR">EUR</SelectItem>
            <SelectItem value="GBP">GBP</SelectItem>
            <SelectItem value="CAD">CAD</SelectItem>
            <SelectItem value="AUD">AUD</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="showTotal"
          checked={data.showTotal}
          onCheckedChange={(checked) => onUpdate({ showTotal: !!checked })}
        />
        <Label htmlFor="showTotal" className="cursor-pointer">
          Show Total
        </Label>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label>Line Items</Label>
        <div className="space-y-3">
          {data.items.map((item, index) => (
            <div key={item.id} className="space-y-2 rounded-md border p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Item {index + 1}
                </span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removeItem(item.id)}
                  disabled={data.items.length === 1}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              <Input
                placeholder="Description"
                value={item.description}
                onChange={(e) =>
                  updateItem(item.id, "description", e.target.value)
                }
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Quantity</Label>
                  <Input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(item.id, "quantity", parseInt(e.target.value) || 1)
                    }
                  />
                </div>
                <div>
                  <Label className="text-xs">Unit Price</Label>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={item.unitPrice}
                    onChange={(e) =>
                      updateItem(
                        item.id,
                        "unitPrice",
                        parseFloat(e.target.value) || 0
                      )
                    }
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" className="w-full" onClick={addItem}>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>
    </div>
  )
}

function SignatureBlockSettings({
  block,
  onUpdate,
}: {
  block: Block
  onUpdate: (data: Partial<SignatureBlockData>) => void
}) {
  const data = block.data as SignatureBlockData

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Signer Role</Label>
        <Input
          value={data.role}
          onChange={(e) => onUpdate({ role: e.target.value })}
          placeholder="e.g., Client, Contractor"
        />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="required"
          checked={data.required}
          onCheckedChange={(checked) => onUpdate({ required: !!checked })}
        />
        <Label htmlFor="required" className="cursor-pointer">
          Required signature
        </Label>
      </div>

      {data.signatureData && (
        <div className="space-y-2">
          <Label>Signature Preview</Label>
          <div className="rounded-md border p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={data.signatureData}
              alt="Signature preview"
              className="h-16 w-full object-contain"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onUpdate({ signatureData: undefined, signedAt: undefined })}
          >
            Clear Signature
          </Button>
        </div>
      )}
    </div>
  )
}

function DividerBlockSettings({
  block,
  onUpdate,
}: {
  block: Block
  onUpdate: (data: Partial<DividerBlockData>) => void
}) {
  const data = block.data as DividerBlockData

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Style</Label>
        <Select
          value={data.style}
          onValueChange={(value: "solid" | "dashed" | "dotted") =>
            onUpdate({ style: value })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="solid">Solid</SelectItem>
            <SelectItem value="dashed">Dashed</SelectItem>
            <SelectItem value="dotted">Dotted</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Thickness</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={1}
            max={10}
            value={data.thickness}
            onChange={(e) => onUpdate({ thickness: parseInt(e.target.value) || 1 })}
            className="w-20"
          />
          <span className="text-sm text-muted-foreground">px</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Color</Label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={data.color}
            onChange={(e) => onUpdate({ color: e.target.value })}
            className="h-9 w-9 cursor-pointer rounded-md border"
          />
          <Input
            value={data.color}
            onChange={(e) => onUpdate({ color: e.target.value })}
            className="flex-1"
          />
        </div>
      </div>
    </div>
  )
}

function SpacerBlockSettings({
  block,
  onUpdate,
}: {
  block: Block
  onUpdate: (data: Partial<SpacerBlockData>) => void
}) {
  const data = block.data as SpacerBlockData

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Height</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={8}
            max={200}
            value={data.height}
            onChange={(e) => onUpdate({ height: parseInt(e.target.value) || 32 })}
            className="w-24"
          />
          <span className="text-sm text-muted-foreground">px</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Quick Sizes</Label>
        <div className="flex flex-wrap gap-2">
          {[16, 32, 48, 64, 96, 128].map((size) => (
            <Button
              key={size}
              variant={data.height === size ? "default" : "outline"}
              size="sm"
              onClick={() => onUpdate({ height: size })}
            >
              {size}px
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}

function VideoEmbedBlockSettings({
  block,
  onUpdate,
}: {
  block: Block
  onUpdate: (data: Partial<VideoEmbedBlockData>) => void
}) {
  const data = block.data as VideoEmbedBlockData

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Video URL</Label>
        <Input
          type="url"
          placeholder="YouTube or Vimeo URL"
          value={data.url}
          onChange={(e) => onUpdate({ url: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">
          Supports YouTube and Vimeo links
        </p>
      </div>

      <div className="space-y-2">
        <Label>Title</Label>
        <Input
          placeholder="Video title for accessibility"
          value={data.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Aspect Ratio</Label>
        <Select
          value={data.aspectRatio}
          onValueChange={(value: "16:9" | "4:3" | "1:1") =>
            onUpdate({ aspectRatio: value })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="16:9">16:9 (Widescreen)</SelectItem>
            <SelectItem value="4:3">4:3 (Standard)</SelectItem>
            <SelectItem value="1:1">1:1 (Square)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

function TableBlockSettings({
  block,
  onUpdate,
}: {
  block: Block
  onUpdate: (data: Partial<TableBlockData>) => void
}) {
  const data = block.data as TableBlockData

  const updateColumns = useCallback(
    (newColumns: number) => {
      const currentColumns = data.columns
      let newHeaders = [...data.headers]
      let newCells = data.cells.map((row) => [...row])

      if (newColumns > currentColumns) {
        // Add columns
        for (let i = currentColumns; i < newColumns; i++) {
          newHeaders.push(`Column ${i + 1}`)
          newCells = newCells.map((row) => [...row, ""])
        }
      } else if (newColumns < currentColumns) {
        // Remove columns
        newHeaders = newHeaders.slice(0, newColumns)
        newCells = newCells.map((row) => row.slice(0, newColumns))
      }

      onUpdate({ columns: newColumns, headers: newHeaders, cells: newCells })
    },
    [data, onUpdate]
  )

  const updateRows = useCallback(
    (newRows: number) => {
      const currentRows = data.rows - 1 // Exclude header row
      let newCells = [...data.cells]

      if (newRows > currentRows) {
        // Add rows
        for (let i = currentRows; i < newRows; i++) {
          newCells.push(Array(data.columns).fill(""))
        }
      } else if (newRows < currentRows) {
        // Remove rows
        newCells = newCells.slice(0, newRows)
      }

      onUpdate({ rows: newRows + 1, cells: newCells })
    },
    [data, onUpdate]
  )

  const updateHeader = useCallback(
    (index: number, value: string) => {
      const newHeaders = [...data.headers]
      newHeaders[index] = value
      onUpdate({ headers: newHeaders })
    },
    [data.headers, onUpdate]
  )

  const updateCell = useCallback(
    (rowIndex: number, colIndex: number, value: string) => {
      const newCells = data.cells.map((row, i) =>
        i === rowIndex
          ? row.map((cell, j) => (j === colIndex ? value : cell))
          : [...row]
      )
      onUpdate({ cells: newCells })
    },
    [data.cells, onUpdate]
  )

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Columns</Label>
          <Input
            type="number"
            min={1}
            max={10}
            value={data.columns}
            onChange={(e) => updateColumns(parseInt(e.target.value) || 1)}
          />
        </div>
        <div className="space-y-2">
          <Label>Rows</Label>
          <Input
            type="number"
            min={1}
            max={20}
            value={data.rows - 1}
            onChange={(e) => updateRows(parseInt(e.target.value) || 1)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Header Background</Label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={data.headerBackground}
            onChange={(e) => onUpdate({ headerBackground: e.target.value })}
            className="h-9 w-9 cursor-pointer rounded-md border"
          />
          <Input
            value={data.headerBackground}
            onChange={(e) => onUpdate({ headerBackground: e.target.value })}
            className="flex-1"
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label>Headers</Label>
        <div className="space-y-2">
          {data.headers.map((header, i) => (
            <Input
              key={i}
              placeholder={`Header ${i + 1}`}
              value={header}
              onChange={(e) => updateHeader(i, e.target.value)}
            />
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label>Cell Data</Label>
        <div className="max-h-60 space-y-3 overflow-auto">
          {data.cells.map((row, rowIndex) => (
            <div key={rowIndex} className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">
                Row {rowIndex + 1}
              </span>
              <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${data.columns}, 1fr)` }}>
                {row.map((cell, colIndex) => (
                  <Input
                    key={`${rowIndex}-${colIndex}`}
                    placeholder={`R${rowIndex + 1}C${colIndex + 1}`}
                    value={cell}
                    onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                    className="text-xs"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function PaymentBlockSettings({
  block,
  onUpdate,
}: {
  block: Block
  onUpdate: (data: Partial<PaymentBlockData>) => void
}) {
  const data = block.data as PaymentBlockData

  const currencies = [
    { value: "USD", label: "USD ($)" },
    { value: "EUR", label: "EUR" },
    { value: "GBP", label: "GBP" },
    { value: "CAD", label: "CAD" },
    { value: "AUD", label: "AUD" },
  ]

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={data.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Payment for services..."
          rows={2}
        />
      </div>

      <Separator />

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Checkbox
            id="use-pricing-total"
            checked={data.usePricingTableTotal}
            onCheckedChange={(checked) =>
              onUpdate({ usePricingTableTotal: !!checked })
            }
          />
          <Label htmlFor="use-pricing-total" className="cursor-pointer">
            Use pricing table total
          </Label>
        </div>
        <p className="text-xs text-muted-foreground">
          Automatically calculate amount from pricing table in this document
        </p>
      </div>

      {data.usePricingTableTotal && (
        <>
          <Separator />

          <div className="space-y-2">
            <Label>Down Payment %</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                max="100"
                value={data.downPaymentPercent || ""}
                onChange={(e) =>
                  onUpdate({ downPaymentPercent: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })
                }
                placeholder="0"
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {data.downPaymentPercent && data.downPaymentPercent > 0
                ? `Collect ${data.downPaymentPercent}% of total now, remainder due later`
                : "Leave empty or 0 for full amount"}
            </p>
          </div>
        </>
      )}

      {!data.usePricingTableTotal && (
        <>
          <Separator />

          <div className="space-y-2">
            <Label>Amount</Label>
            <div className="flex gap-2">
              <Select
                value={data.currency}
                onValueChange={(value) => onUpdate({ currency: value })}
              >
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={data.amount || ""}
                onChange={(e) =>
                  onUpdate({ amount: parseFloat(e.target.value) || 0 })
                }
                placeholder="0.00"
                className="flex-1"
              />
            </div>
          </div>
        </>
      )}

      <Separator />

      <div className="space-y-2">
        <Label>Payment Terms</Label>
        <Select
          value={data.timing}
          onValueChange={(value: "due_now" | "net_30" | "net_60") =>
            onUpdate({ timing: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="due_now">Due Now</SelectItem>
            <SelectItem value="net_30">Net 30</SelectItem>
            <SelectItem value="net_60">Net 60</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {data.timing === "due_now"
            ? "Recipient must pay before they can sign"
            : `Payment due within ${data.timing === "net_30" ? "30" : "60"} days`}
        </p>
      </div>
    </div>
  )
}

// Main Block Settings Component
export function BlockSettings() {
  const { selectedBlock, updateBlock } = useBuilder()

  const handleUpdate = useCallback(
    (data: Record<string, unknown>) => {
      if (selectedBlock) {
        updateBlock(selectedBlock.id, data)
      }
    },
    [selectedBlock, updateBlock]
  )

  const getBlockTypeName = (type: string) => {
    const names: Record<string, string> = {
      text: "Text Block",
      image: "Image Block",
      "pricing-table": "Pricing Table",
      signature: "Signature Block",
      divider: "Divider",
      spacer: "Spacer",
      "video-embed": "Video Embed",
      table: "Table",
      payment: "Payment Block",
    }
    return names[type] || type
  }

  if (!selectedBlock) {
    return (
      <div className="flex h-full w-full flex-col border-l bg-background">
        <div className="border-b px-3 py-2">
          <h2 className="text-sm font-medium">Settings</h2>
        </div>
        <div className="flex flex-1 items-center justify-center p-3">
          <p className="text-center text-xs text-muted-foreground">
            Select a block to edit
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full w-full flex-col border-l bg-background">
      <div className="border-b px-3 py-2">
        <h2 className="text-sm font-medium">{getBlockTypeName(selectedBlock.type)}</h2>
      </div>
      <div className="flex-1 overflow-auto p-3">
        {selectedBlock.type === "text" && (
          <TextBlockSettings block={selectedBlock} onUpdate={handleUpdate} />
        )}
        {selectedBlock.type === "image" && (
          <ImageBlockSettings block={selectedBlock} onUpdate={handleUpdate} />
        )}
        {selectedBlock.type === "pricing-table" && (
          <PricingTableBlockSettings block={selectedBlock} onUpdate={handleUpdate} />
        )}
        {selectedBlock.type === "signature" && (
          <SignatureBlockSettings block={selectedBlock} onUpdate={handleUpdate} />
        )}
        {selectedBlock.type === "divider" && (
          <DividerBlockSettings block={selectedBlock} onUpdate={handleUpdate} />
        )}
        {selectedBlock.type === "spacer" && (
          <SpacerBlockSettings block={selectedBlock} onUpdate={handleUpdate} />
        )}
        {selectedBlock.type === "video-embed" && (
          <VideoEmbedBlockSettings block={selectedBlock} onUpdate={handleUpdate} />
        )}
        {selectedBlock.type === "table" && (
          <TableBlockSettings block={selectedBlock} onUpdate={handleUpdate} />
        )}
        {selectedBlock.type === "payment" && (
          <PaymentBlockSettings block={selectedBlock} onUpdate={handleUpdate} />
        )}
      </div>
    </div>
  )
}
