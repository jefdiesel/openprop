"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Eye,
  Send,
  Save,
  Undo2,
  Redo2,
  Check,
  Loader2,
  ArrowLeft,
  MoreVertical,
  Download,
  Copy,
  Trash2,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useBuilder } from "@/hooks/use-builder"

interface BuilderToolbarProps {
  onSave?: () => Promise<void>
  onPreview?: () => void
  onSend?: () => void
}

export function BuilderToolbar({ onSave, onPreview, onSend }: BuilderToolbarProps) {
  const router = useRouter()
  const {
    state,
    setTitle,
    undo,
    redo,
    canUndo,
    canRedo,
    setSaving,
    setSaved,
  } = useBuilder()

  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState(state.documentTitle)

  // Sync title value when state changes
  useEffect(() => {
    setTitleValue(state.documentTitle)
  }, [state.documentTitle])

  const handleTitleSubmit = useCallback(() => {
    setTitle(titleValue.trim() || "Untitled Document")
    setIsEditingTitle(false)
  }, [titleValue, setTitle])

  const handleTitleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleTitleSubmit()
      } else if (e.key === "Escape") {
        setTitleValue(state.documentTitle)
        setIsEditingTitle(false)
      }
    },
    [handleTitleSubmit, state.documentTitle]
  )

  const handleSave = useCallback(async () => {
    if (onSave) {
      setSaving(true)
      try {
        await onSave()
        setSaved(new Date())
      } catch (error) {
        console.error("Failed to save:", error)
      }
    }
  }, [onSave, setSaving, setSaved])

  // Auto-save effect
  useEffect(() => {
    if (!state.isDirty || !onSave) return

    const timeout = setTimeout(() => {
      handleSave()
    }, 2000) // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(timeout)
  }, [state.isDirty, state.blocks, state.documentTitle, handleSave, onSave])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault()
        if (e.shiftKey) {
          redo()
        } else {
          undo()
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault()
        handleSave()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [undo, redo, handleSave])

  const getSaveStatusText = () => {
    if (state.isSaving) {
      return "Saving..."
    }
    if (state.isDirty) {
      return "Unsaved changes"
    }
    if (state.lastSavedAt) {
      const timeAgo = getTimeAgo(state.lastSavedAt)
      return `Saved ${timeAgo}`
    }
    return "All changes saved"
  }

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    if (seconds < 60) return "just now"
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="flex h-14 items-center justify-between border-b bg-background px-4">
      {/* Left Section */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        {/* Document Title */}
        {isEditingTitle ? (
          <Input
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={handleTitleKeyDown}
            className="h-8 w-64"
            autoFocus
          />
        ) : (
          <button
            onClick={() => setIsEditingTitle(true)}
            className="max-w-xs truncate rounded-md px-2 py-1 text-left font-medium hover:bg-accent"
          >
            {state.documentTitle}
          </button>
        )}

        {/* Save Status */}
        <div
          className={cn(
            "flex items-center gap-1.5 rounded-md px-2 py-1 text-xs",
            state.isDirty && !state.isSaving
              ? "text-amber-600 dark:text-amber-500"
              : "text-muted-foreground"
          )}
        >
          {state.isSaving ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : state.isDirty ? (
            <div className="h-2 w-2 rounded-full bg-amber-500" />
          ) : (
            <Check className="h-3 w-3" />
          )}
          <span>{getSaveStatusText()}</span>
        </div>
      </div>

      {/* Center Section - Undo/Redo */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={undo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={redo}
          disabled={!canRedo}
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSave}
          disabled={!state.isDirty || state.isSaving}
        >
          {state.isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save
        </Button>

        <Button variant="outline" size="sm" onClick={onPreview}>
          <Eye className="mr-2 h-4 w-4" />
          Preview
        </Button>

        <Button size="sm" onClick={onSend}>
          <Send className="mr-2 h-4 w-4" />
          Send
        </Button>

        {/* More Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Download className="mr-2 h-4 w-4" />
              Export as PDF
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
