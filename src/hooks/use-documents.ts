'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import type { Document, DocumentStatus } from '@/types/database'

// Types
export interface DocumentFilters {
  status?: DocumentStatus
  is_template?: boolean
  search?: string
  limit?: number
  offset?: number
  sort_by?: 'created_at' | 'updated_at' | 'title' | 'status'
  sort_order?: 'asc' | 'desc'
}

export interface PaginationInfo {
  total: number
  limit: number
  offset: number
  hasMore: boolean
}

export interface UseDocumentsResult {
  documents: Document[]
  pagination: PaginationInfo | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  createDocument: (data: CreateDocumentInput) => Promise<Document | null>
  updateDocument: (id: string, data: UpdateDocumentInput) => Promise<Document | null>
  deleteDocument: (id: string) => Promise<boolean>
  duplicateDocument: (id: string, title?: string) => Promise<Document | null>
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
}

export interface UseDocumentResult {
  document: Document | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  update: (data: UpdateDocumentInput) => Promise<Document | null>
  remove: () => Promise<boolean>
  duplicate: (title?: string) => Promise<Document | null>
  isUpdating: boolean
  isDeleting: boolean
}

export interface CreateDocumentInput {
  title: string
  content?: unknown[]
  is_template?: boolean
  template_category?: string | null
  variables?: Record<string, unknown> | null
  settings?: Record<string, unknown> | null
}

export interface UpdateDocumentInput {
  title?: string
  content?: unknown[]
  status?: DocumentStatus
  is_template?: boolean
  template_category?: string | null
  variables?: Record<string, unknown> | null
  settings?: Record<string, unknown> | null
  expires_at?: string | null
}

// Fetch helper
async function fetchApi<T>(
  url: string,
  options?: RequestInit
): Promise<{ data: T | null; error: string | null }> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    const json = await response.json()

    if (!response.ok) {
      return { data: null, error: json.error || 'Request failed' }
    }

    return { data: json, error: null }
  } catch (error) {
    console.error('Fetch error:', error)
    return { data: null, error: 'Network error' }
  }
}

// Hook for fetching multiple documents with filters
export function useDocuments(filters: DocumentFilters = {}): UseDocumentsResult {
  const [documents, setDocuments] = useState<Document[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Memoize filters to prevent unnecessary refetches
  const filterKey = useMemo(() => JSON.stringify(filters), [filters])

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    // Build query string
    const params = new URLSearchParams()
    if (filters.status) params.set('status', filters.status)
    if (filters.is_template !== undefined) params.set('is_template', String(filters.is_template))
    if (filters.search) params.set('search', filters.search)
    if (filters.limit) params.set('limit', String(filters.limit))
    if (filters.offset) params.set('offset', String(filters.offset))
    if (filters.sort_by) params.set('sort_by', filters.sort_by)
    if (filters.sort_order) params.set('sort_order', filters.sort_order)

    const url = `/api/documents${params.toString() ? `?${params.toString()}` : ''}`
    const { data, error: fetchError } = await fetchApi<{
      documents: Document[]
      pagination: PaginationInfo
    }>(url)

    if (fetchError) {
      setError(fetchError)
      setDocuments([])
      setPagination(null)
    } else if (data) {
      setDocuments(data.documents)
      setPagination(data.pagination)
    }

    setIsLoading(false)
  }, [filterKey])

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  // Create document
  const createDocument = useCallback(async (input: CreateDocumentInput): Promise<Document | null> => {
    setIsCreating(true)
    setError(null)

    const { data, error: createError } = await fetchApi<{ document: Document }>(
      '/api/documents',
      {
        method: 'POST',
        body: JSON.stringify(input),
      }
    )

    setIsCreating(false)

    if (createError) {
      setError(createError)
      return null
    }

    if (data?.document) {
      // Add to list if it matches current filters
      setDocuments((prev) => [data.document, ...prev])
      return data.document
    }

    return null
  }, [])

  // Update document
  const updateDocument = useCallback(async (
    id: string,
    input: UpdateDocumentInput
  ): Promise<Document | null> => {
    setIsUpdating(true)
    setError(null)

    const { data, error: updateError } = await fetchApi<{ document: Document }>(
      `/api/documents/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(input),
      }
    )

    setIsUpdating(false)

    if (updateError) {
      setError(updateError)
      return null
    }

    if (data?.document) {
      // Update in list
      setDocuments((prev) =>
        prev.map((doc) => (doc.id === id ? data.document : doc))
      )
      return data.document
    }

    return null
  }, [])

  // Delete document
  const deleteDocument = useCallback(async (id: string): Promise<boolean> => {
    setIsDeleting(true)
    setError(null)

    const { error: deleteError } = await fetchApi<{ success: boolean }>(
      `/api/documents/${id}`,
      {
        method: 'DELETE',
      }
    )

    setIsDeleting(false)

    if (deleteError) {
      setError(deleteError)
      return false
    }

    // Remove from list
    setDocuments((prev) => prev.filter((doc) => doc.id !== id))
    return true
  }, [])

  // Duplicate document
  const duplicateDocument = useCallback(async (
    id: string,
    title?: string
  ): Promise<Document | null> => {
    setIsCreating(true)
    setError(null)

    const { data, error: dupError } = await fetchApi<{ document: Document }>(
      `/api/documents/${id}/duplicate`,
      {
        method: 'POST',
        body: JSON.stringify({ title }),
      }
    )

    setIsCreating(false)

    if (dupError) {
      setError(dupError)
      return null
    }

    if (data?.document) {
      // Add to list
      setDocuments((prev) => [data.document, ...prev])
      return data.document
    }

    return null
  }, [])

  return {
    documents,
    pagination,
    isLoading,
    error,
    refetch: fetchDocuments,
    createDocument,
    updateDocument,
    deleteDocument,
    duplicateDocument,
    isCreating,
    isUpdating,
    isDeleting,
  }
}

// Hook for fetching a single document by ID
export function useDocument(id: string | null): UseDocumentResult {
  const [document, setDocument] = useState<Document | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchDocument = useCallback(async () => {
    if (!id) {
      setDocument(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    const { data, error: fetchError } = await fetchApi<{ document: Document }>(
      `/api/documents/${id}?include_recipients=true`
    )

    if (fetchError) {
      setError(fetchError)
      setDocument(null)
    } else if (data) {
      setDocument(data.document)
    }

    setIsLoading(false)
  }, [id])

  // Fetch on mount and when ID changes
  useEffect(() => {
    fetchDocument()
  }, [fetchDocument])

  // Update document
  const update = useCallback(async (input: UpdateDocumentInput): Promise<Document | null> => {
    if (!id) return null

    setIsUpdating(true)
    setError(null)

    const { data, error: updateError } = await fetchApi<{ document: Document }>(
      `/api/documents/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(input),
      }
    )

    setIsUpdating(false)

    if (updateError) {
      setError(updateError)
      return null
    }

    if (data?.document) {
      setDocument(data.document)
      return data.document
    }

    return null
  }, [id])

  // Delete document
  const remove = useCallback(async (): Promise<boolean> => {
    if (!id) return false

    setIsDeleting(true)
    setError(null)

    const { error: deleteError } = await fetchApi<{ success: boolean }>(
      `/api/documents/${id}`,
      {
        method: 'DELETE',
      }
    )

    setIsDeleting(false)

    if (deleteError) {
      setError(deleteError)
      return false
    }

    setDocument(null)
    return true
  }, [id])

  // Duplicate document
  const duplicate = useCallback(async (title?: string): Promise<Document | null> => {
    if (!id) return null

    const { data, error: dupError } = await fetchApi<{ document: Document }>(
      `/api/documents/${id}/duplicate`,
      {
        method: 'POST',
        body: JSON.stringify({ title }),
      }
    )

    if (dupError) {
      setError(dupError)
      return null
    }

    return data?.document || null
  }, [id])

  return {
    document,
    isLoading,
    error,
    refetch: fetchDocument,
    update,
    remove,
    duplicate,
    isUpdating,
    isDeleting,
  }
}

// Hook for sending a document
export function useSendDocument() {
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const send = useCallback(async (
    documentId: string,
    recipients: Array<{
      email: string
      name: string
      role?: 'signer' | 'viewer' | 'approver'
      signing_order?: number
    }>,
    options?: {
      message?: string
      expires_in_days?: number
    }
  ): Promise<{
    success: boolean
    signingLinks?: Array<{ email: string; signingUrl: string }>
  }> => {
    setIsSending(true)
    setError(null)

    const { data, error: sendError } = await fetchApi<{
      success: boolean
      signingLinks: Array<{ email: string; signingUrl: string }>
    }>(`/api/documents/${documentId}/send`, {
      method: 'POST',
      body: JSON.stringify({ recipients, ...options }),
    })

    setIsSending(false)

    if (sendError) {
      setError(sendError)
      return { success: false }
    }

    return {
      success: true,
      signingLinks: data?.signingLinks,
    }
  }, [])

  return { send, isSending, error }
}

// Hook for generating PDF
export function useDocumentPdf() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generatePdf = useCallback(async (
    documentId: string,
    options?: {
      download?: boolean
      filename?: string
    }
  ): Promise<Blob | null> => {
    setIsGenerating(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (options?.download) params.set('download', 'true')
      if (options?.filename) params.set('filename', options.filename)

      const url = `/api/documents/${documentId}/pdf${params.toString() ? `?${params.toString()}` : ''}`
      const response = await fetch(url)

      if (!response.ok) {
        const json = await response.json()
        setError(json.error || 'Failed to generate PDF')
        setIsGenerating(false)
        return null
      }

      const blob = await response.blob()
      setIsGenerating(false)
      return blob
    } catch (err) {
      console.error('PDF generation error:', err)
      setError('Network error')
      setIsGenerating(false)
      return null
    }
  }, [])

  const downloadPdf = useCallback(async (
    documentId: string,
    filename?: string
  ): Promise<boolean> => {
    const blob = await generatePdf(documentId, { download: true, filename })
    if (!blob) return false

    // Create download link
    const url = URL.createObjectURL(blob)
    const a = window.document.createElement('a')
    a.href = url
    a.download = filename || 'document.pdf'
    window.document.body.appendChild(a)
    a.click()
    window.document.body.removeChild(a)
    URL.revokeObjectURL(url)

    return true
  }, [generatePdf])

  return { generatePdf, downloadPdf, isGenerating, error }
}

// Hook for templates
export function useTemplates(filters: {
  category?: string
  search?: string
  include_public?: boolean
  limit?: number
  offset?: number
} = {}) {
  const [templates, setTemplates] = useState<(Document & { source: string })[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const filterKey = useMemo(() => JSON.stringify(filters), [filters])

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const params = new URLSearchParams()
    if (filters.category) params.set('category', filters.category)
    if (filters.search) params.set('search', filters.search)
    if (filters.include_public !== undefined) params.set('include_public', String(filters.include_public))
    if (filters.limit) params.set('limit', String(filters.limit))
    if (filters.offset) params.set('offset', String(filters.offset))

    const url = `/api/templates${params.toString() ? `?${params.toString()}` : ''}`
    const { data, error: fetchError } = await fetchApi<{
      templates: (Document & { source: string })[]
      categories: string[]
      pagination: PaginationInfo
    }>(url)

    if (fetchError) {
      setError(fetchError)
      setTemplates([])
      setCategories([])
      setPagination(null)
    } else if (data) {
      setTemplates(data.templates)
      setCategories(data.categories)
      setPagination(data.pagination)
    }

    setIsLoading(false)
  }, [filterKey])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  // Create document from template
  const createFromTemplate = useCallback(async (
    templateId: string,
    title?: string
  ): Promise<Document | null> => {
    // For starter templates, use POST /api/documents with content
    const template = templates.find((t) => t.id === templateId)
    if (!template) return null

    if (template.source === 'starter') {
      const { data, error: createError } = await fetchApi<{ document: Document }>(
        '/api/documents',
        {
          method: 'POST',
          body: JSON.stringify({
            title: title || template.title,
            content: template.content,
            variables: template.variables,
            settings: template.settings,
          }),
        }
      )

      if (createError) {
        setError(createError)
        return null
      }

      return data?.document || null
    }

    // For user templates, use duplicate
    const { data, error: dupError } = await fetchApi<{ document: Document }>(
      `/api/documents/${templateId}/duplicate`,
      {
        method: 'POST',
        body: JSON.stringify({ title }),
      }
    )

    if (dupError) {
      setError(dupError)
      return null
    }

    return data?.document || null
  }, [templates])

  // Save document as template
  const saveAsTemplate = useCallback(async (
    documentId: string,
    options?: { title?: string; category?: string }
  ): Promise<Document | null> => {
    const { data, error: saveError } = await fetchApi<{ template: Document }>(
      '/api/templates',
      {
        method: 'POST',
        body: JSON.stringify({
          document_id: documentId,
          title: options?.title || 'Untitled Template',
          template_category: options?.category,
        }),
      }
    )

    if (saveError) {
      setError(saveError)
      return null
    }

    if (data?.template) {
      setTemplates((prev) => [{ ...data.template, source: 'user' }, ...prev])
      return data.template
    }

    return null
  }, [])

  return {
    templates,
    categories,
    pagination,
    isLoading,
    error,
    refetch: fetchTemplates,
    createFromTemplate,
    saveAsTemplate,
  }
}
