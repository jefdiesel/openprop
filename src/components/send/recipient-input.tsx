"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, X, User, Mail, UserCircle } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type RecipientRole = "signer" | "viewer" | "approver"

export interface Recipient {
  id: string
  email: string
  name: string
  role: RecipientRole
}

interface RecipientInputProps {
  recipient: Recipient
  onUpdate: (id: string, updates: Partial<Recipient>) => void
  onRemove: (id: string) => void
  showDragHandle?: boolean
  emailError?: string
}

export function RecipientInput({
  recipient,
  onUpdate,
  onRemove,
  showDragHandle = true,
  emailError,
}: RecipientInputProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: recipient.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-2 rounded-lg border bg-card p-3"
    >
      {showDragHandle && (
        <button
          type="button"
          className="mt-2.5 cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      )}

      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-start">
        <div className="flex-1 space-y-1">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="email"
              placeholder="Email address"
              value={recipient.email}
              onChange={(e) => onUpdate(recipient.id, { email: e.target.value })}
              className="pl-9"
              aria-invalid={!!emailError}
            />
          </div>
          {emailError && (
            <p className="text-xs text-destructive">{emailError}</p>
          )}
        </div>

        <div className="flex-1">
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Name (optional)"
              value={recipient.name}
              onChange={(e) => onUpdate(recipient.id, { name: e.target.value })}
              className="pl-9"
            />
          </div>
        </div>

        <Select
          value={recipient.role}
          onValueChange={(value: RecipientRole) =>
            onUpdate(recipient.id, { role: value })
          }
        >
          <SelectTrigger className="w-full sm:w-[130px]">
            <UserCircle className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="signer">Signer</SelectItem>
            <SelectItem value="viewer">Viewer</SelectItem>
            <SelectItem value="approver">Approver</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => onRemove(recipient.id)}
        className="mt-0.5 text-muted-foreground hover:text-destructive"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Remove recipient</span>
      </Button>
    </div>
  )
}
