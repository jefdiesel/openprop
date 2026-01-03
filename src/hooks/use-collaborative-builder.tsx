"use client"

// This hook will be fully implemented when Liveblocks is configured
// For now, it's a placeholder that mirrors the useBuilder interface

import { Block, BlockType, BlockData } from "@/hooks/use-builder"

export interface CollaborativeBuilderState {
  documentId: string
  documentTitle: string
  blocks: Block[]
  selectedBlockId: string | null
  isDirty: boolean
  isSaving: boolean
  lastSavedAt: Date | null
}

// Placeholder - returns a stub when Liveblocks is not configured
export function useCollaborativeBuilder(_documentId: string) {
  // This will be implemented with Liveblocks hooks when configured
  // For now, return a placeholder that matches the interface

  const state: CollaborativeBuilderState = {
    documentId: _documentId,
    documentTitle: "Untitled Document",
    blocks: [],
    selectedBlockId: null,
    isDirty: false,
    isSaving: false,
    lastSavedAt: null,
  }

  return {
    state,
    selectedBlock: null,
    setDocument: (_id: string, _title: string, _blocks: Block[]) => {},
    setTitle: (_title: string) => {},
    addBlock: (_type: BlockType, _index?: number) => {},
    removeBlock: (_id: string) => {},
    updateBlock: (_id: string, _data: Partial<BlockData>) => {},
    moveBlock: (_activeId: string, _overId: string) => {},
    selectBlock: (_id: string | null) => {},
    setTyping: (_isTyping: boolean) => {},
    setCursor: (_cursor: { x: number; y: number } | null) => {},
    setSaving: () => {},
    setSaved: () => {},
    undo: () => {},
    redo: () => {},
    canUndo: false,
    canRedo: false,
  }
}

// Hook to determine if we should use collaborative mode
export function useIsCollaborativeMode() {
  // Collaborative mode requires Liveblocks to be configured
  // Check for the secret key at runtime
  return false // Disabled until Liveblocks is configured
}
