"use client"

import { createContext, useContext, useCallback, useMemo } from "react"
import { useImmerReducer } from "use-immer"
import { v4 as uuidv4 } from "uuid"

// Block Types
export type BlockType =
  | "text"
  | "image"
  | "pricing-table"
  | "signature"
  | "divider"
  | "spacer"
  | "video-embed"
  | "table"
  | "payment"

// Block Data Types
export interface TextBlockData {
  content: string
  fontSize: number
  alignment: "left" | "center" | "right"
  color: string
  fontWeight: "normal" | "bold"
}

export interface ImageBlockData {
  url: string
  alt: string
  width: number
  height: number | "auto"
  alignment: "left" | "center" | "right"
}

export interface PricingTableBlockData {
  title: string
  items: Array<{
    id: string
    description: string
    quantity: number
    unitPrice: number
  }>
  showTotal: boolean
  currency: string
}

export interface SignatureBlockData {
  role: string
  required: boolean
  signedAt?: string
  signatureData?: string
}

export interface DividerBlockData {
  style: "solid" | "dashed" | "dotted"
  thickness: number
  color: string
}

export interface SpacerBlockData {
  height: number
}

export interface VideoEmbedBlockData {
  url: string
  title: string
  aspectRatio: "16:9" | "4:3" | "1:1"
}

export interface TableBlockData {
  columns: number
  rows: number
  headers: string[]
  cells: string[][]
  headerBackground: string
}

export interface PaymentBlockData {
  amount: number
  currency: string
  description: string
  timing: "due_now" | "net_30" | "net_60"
  usePricingTableTotal: boolean
  downPaymentPercent: number // 0 = full amount, 50 = 50% down, etc.
  // Payment status (set after payment is made)
  paymentStatus?: "pending" | "paid" | "failed"
  paymentId?: string
  paidAt?: string
}

export type BlockData =
  | TextBlockData
  | ImageBlockData
  | PricingTableBlockData
  | SignatureBlockData
  | DividerBlockData
  | SpacerBlockData
  | VideoEmbedBlockData
  | TableBlockData
  | PaymentBlockData

// Block Interface
export interface Block {
  id: string
  type: BlockType
  data: BlockData
}

// Builder State
export interface BuilderState {
  documentId: string
  documentTitle: string
  blocks: Block[]
  selectedBlockId: string | null
  isDirty: boolean
  isSaving: boolean
  lastSavedAt: Date | null
  history: {
    past: Block[][]
    future: Block[][]
  }
}

// Action Types
type BuilderAction =
  | { type: "SET_DOCUMENT"; payload: { id: string; title: string; blocks: Block[] } }
  | { type: "SET_TITLE"; payload: string }
  | { type: "ADD_BLOCK"; payload: { block: Block; index?: number } }
  | { type: "REMOVE_BLOCK"; payload: string }
  | { type: "UPDATE_BLOCK"; payload: { id: string; data: Partial<BlockData> } }
  | { type: "MOVE_BLOCK"; payload: { activeId: string; overId: string } }
  | { type: "SELECT_BLOCK"; payload: string | null }
  | { type: "SET_SAVING"; payload: boolean }
  | { type: "SET_SAVED"; payload: Date }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "CLEAR_HISTORY" }

// Default Block Data
export function getDefaultBlockData(type: BlockType): BlockData {
  switch (type) {
    case "text":
      return {
        content: "",
        fontSize: 16,
        alignment: "left",
        color: "#000000",
        fontWeight: "normal",
      }
    case "image":
      return {
        url: "",
        alt: "",
        width: 100,
        height: "auto",
        alignment: "center",
      }
    case "pricing-table":
      return {
        title: "Pricing",
        items: [
          { id: uuidv4(), description: "Item 1", quantity: 1, unitPrice: 0 },
        ],
        showTotal: true,
        currency: "USD",
      }
    case "signature":
      return {
        role: "Client",
        required: true,
      }
    case "divider":
      return {
        style: "solid",
        thickness: 1,
        color: "#e5e7eb",
      }
    case "spacer":
      return {
        height: 32,
      }
    case "video-embed":
      return {
        url: "",
        title: "",
        aspectRatio: "16:9",
      }
    case "table":
      return {
        columns: 3,
        rows: 3,
        headers: ["Column 1", "Column 2", "Column 3"],
        cells: [
          ["", "", ""],
          ["", "", ""],
        ],
        headerBackground: "#f3f4f6",
      }
    case "payment":
      return {
        amount: 0,
        currency: "USD",
        description: "Payment required",
        timing: "due_now",
        usePricingTableTotal: true,
        downPaymentPercent: 0, // 0 = full amount due
      }
  }
}

// Reducer
function builderReducer(draft: BuilderState, action: BuilderAction) {
  const saveHistory = () => {
    draft.history.past.push(JSON.parse(JSON.stringify(draft.blocks)))
    draft.history.future = []
    if (draft.history.past.length > 50) {
      draft.history.past.shift()
    }
  }

  switch (action.type) {
    case "SET_DOCUMENT":
      draft.documentId = action.payload.id
      draft.documentTitle = action.payload.title
      draft.blocks = action.payload.blocks
      draft.isDirty = false
      draft.history = { past: [], future: [] }
      break

    case "SET_TITLE":
      draft.documentTitle = action.payload
      draft.isDirty = true
      break

    case "ADD_BLOCK":
      saveHistory()
      if (action.payload.index !== undefined) {
        draft.blocks.splice(action.payload.index, 0, action.payload.block)
      } else {
        draft.blocks.push(action.payload.block)
      }
      draft.selectedBlockId = action.payload.block.id
      draft.isDirty = true
      break

    case "REMOVE_BLOCK":
      saveHistory()
      const removeIndex = draft.blocks.findIndex((b) => b.id === action.payload)
      if (removeIndex !== -1) {
        draft.blocks.splice(removeIndex, 1)
        if (draft.selectedBlockId === action.payload) {
          draft.selectedBlockId = null
        }
      }
      draft.isDirty = true
      break

    case "UPDATE_BLOCK":
      saveHistory()
      const blockToUpdate = draft.blocks.find((b) => b.id === action.payload.id)
      if (blockToUpdate) {
        blockToUpdate.data = { ...blockToUpdate.data, ...action.payload.data } as BlockData
      }
      draft.isDirty = true
      break

    case "MOVE_BLOCK":
      saveHistory()
      const oldIndex = draft.blocks.findIndex((b) => b.id === action.payload.activeId)
      const newIndex = draft.blocks.findIndex((b) => b.id === action.payload.overId)
      if (oldIndex !== -1 && newIndex !== -1) {
        const [removed] = draft.blocks.splice(oldIndex, 1)
        draft.blocks.splice(newIndex, 0, removed)
      }
      draft.isDirty = true
      break

    case "SELECT_BLOCK":
      draft.selectedBlockId = action.payload
      break

    case "SET_SAVING":
      draft.isSaving = action.payload
      break

    case "SET_SAVED":
      draft.isSaving = false
      draft.isDirty = false
      draft.lastSavedAt = action.payload
      break

    case "UNDO":
      if (draft.history.past.length > 0) {
        const previous = draft.history.past.pop()!
        draft.history.future.push(JSON.parse(JSON.stringify(draft.blocks)))
        draft.blocks = previous
        draft.isDirty = true
      }
      break

    case "REDO":
      if (draft.history.future.length > 0) {
        const next = draft.history.future.pop()!
        draft.history.past.push(JSON.parse(JSON.stringify(draft.blocks)))
        draft.blocks = next
        draft.isDirty = true
      }
      break

    case "CLEAR_HISTORY":
      draft.history = { past: [], future: [] }
      break
  }
}

// Initial State
const initialState: BuilderState = {
  documentId: "",
  documentTitle: "Untitled Document",
  blocks: [],
  selectedBlockId: null,
  isDirty: false,
  isSaving: false,
  lastSavedAt: null,
  history: {
    past: [],
    future: [],
  },
}

// Context
interface BuilderContextValue {
  state: BuilderState
  selectedBlock: Block | null
  setDocument: (id: string, title: string, blocks: Block[]) => void
  setTitle: (title: string) => void
  addBlock: (type: BlockType, index?: number) => void
  removeBlock: (id: string) => void
  updateBlock: (id: string, data: Partial<BlockData>) => void
  moveBlock: (activeId: string, overId: string) => void
  selectBlock: (id: string | null) => void
  setSaving: (saving: boolean) => void
  setSaved: (date: Date) => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
}

const BuilderContext = createContext<BuilderContextValue | null>(null)

// Provider Component
export function BuilderProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useImmerReducer(builderReducer, initialState)

  const setDocument = useCallback(
    (id: string, title: string, blocks: Block[]) => {
      dispatch({ type: "SET_DOCUMENT", payload: { id, title, blocks } })
    },
    [dispatch]
  )

  const setTitle = useCallback(
    (title: string) => {
      dispatch({ type: "SET_TITLE", payload: title })
    },
    [dispatch]
  )

  const addBlock = useCallback(
    (type: BlockType, index?: number) => {
      const block: Block = {
        id: uuidv4(),
        type,
        data: getDefaultBlockData(type),
      }
      dispatch({ type: "ADD_BLOCK", payload: { block, index } })
    },
    [dispatch]
  )

  const removeBlock = useCallback(
    (id: string) => {
      dispatch({ type: "REMOVE_BLOCK", payload: id })
    },
    [dispatch]
  )

  const updateBlock = useCallback(
    (id: string, data: Partial<BlockData>) => {
      dispatch({ type: "UPDATE_BLOCK", payload: { id, data } })
    },
    [dispatch]
  )

  const moveBlock = useCallback(
    (activeId: string, overId: string) => {
      dispatch({ type: "MOVE_BLOCK", payload: { activeId, overId } })
    },
    [dispatch]
  )

  const selectBlock = useCallback(
    (id: string | null) => {
      dispatch({ type: "SELECT_BLOCK", payload: id })
    },
    [dispatch]
  )

  const setSaving = useCallback(
    (saving: boolean) => {
      dispatch({ type: "SET_SAVING", payload: saving })
    },
    [dispatch]
  )

  const setSaved = useCallback(
    (date: Date) => {
      dispatch({ type: "SET_SAVED", payload: date })
    },
    [dispatch]
  )

  const undo = useCallback(() => {
    dispatch({ type: "UNDO" })
  }, [dispatch])

  const redo = useCallback(() => {
    dispatch({ type: "REDO" })
  }, [dispatch])

  const selectedBlock = useMemo(
    () => state.blocks.find((b) => b.id === state.selectedBlockId) || null,
    [state.blocks, state.selectedBlockId]
  )

  const canUndo = state.history.past.length > 0
  const canRedo = state.history.future.length > 0

  const value = useMemo(
    () => ({
      state,
      selectedBlock,
      setDocument,
      setTitle,
      addBlock,
      removeBlock,
      updateBlock,
      moveBlock,
      selectBlock,
      setSaving,
      setSaved,
      undo,
      redo,
      canUndo,
      canRedo,
    }),
    [
      state,
      selectedBlock,
      setDocument,
      setTitle,
      addBlock,
      removeBlock,
      updateBlock,
      moveBlock,
      selectBlock,
      setSaving,
      setSaved,
      undo,
      redo,
      canUndo,
      canRedo,
    ]
  )

  return <BuilderContext.Provider value={value}>{children}</BuilderContext.Provider>
}

// Hook
export function useBuilder() {
  const context = useContext(BuilderContext)
  if (!context) {
    throw new Error("useBuilder must be used within a BuilderProvider")
  }
  return context
}
