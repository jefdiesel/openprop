"use client"

import * as React from "react"
import {
  FileIcon,
  FolderIcon,
  ChevronRightIcon,
  LoaderIcon,
  HomeIcon,
  FileTextIcon,
  ImageIcon,
  FileSpreadsheetIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { toast } from "sonner"

interface FileItem {
  id: string
  name: string
  path?: string
  type: 'file' | 'folder'
  size?: number
  modified?: string
  mimeType?: string
}

interface GoogleDriveFile {
  id: string
  name: string
  mimeType: string
  modifiedTime?: string
  size?: string
}

interface DropboxFile {
  id: string
  name: string
  path: string
  size: number
  modified: string
  type: 'file' | 'folder'
}

interface FilePickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (file: FileItem & { provider: 'google-drive' | 'dropbox' }) => void
  defaultProvider?: 'google-drive' | 'dropbox'
  allowedFileTypes?: string[] // MIME types for filtering
  title?: string
  description?: string
}

export function FilePicker({
  open,
  onOpenChange,
  onSelect,
  defaultProvider = 'google-drive',
  allowedFileTypes,
  title = "Select a file",
  description = "Choose a file from your cloud storage",
}: FilePickerProps) {
  const [provider, setProvider] = React.useState<'google-drive' | 'dropbox'>(defaultProvider)
  const [loading, setLoading] = React.useState(false)
  const [files, setFiles] = React.useState<FileItem[]>([])
  const [currentPath, setCurrentPath] = React.useState<string[]>([])
  const [selectedFile, setSelectedFile] = React.useState<FileItem | null>(null)

  // Google Drive specific state
  const [googleDriveFolderId, setGoogleDriveFolderId] = React.useState<string | null>(null)
  const [googleDriveNextPageToken, setGoogleDriveNextPageToken] = React.useState<string | null>(null)

  // Dropbox specific state
  const [dropboxPath, setDropboxPath] = React.useState<string>('')

  // Load files when provider or path changes
  React.useEffect(() => {
    if (open) {
      loadFiles()
    }
  }, [open, provider, googleDriveFolderId, dropboxPath])

  // Reset state when dialog opens
  React.useEffect(() => {
    if (open) {
      setCurrentPath([])
      setSelectedFile(null)
      setGoogleDriveFolderId(null)
      setDropboxPath('')
    }
  }, [open])

  const loadFiles = async () => {
    setLoading(true)
    try {
      if (provider === 'google-drive') {
        await loadGoogleDriveFiles()
      } else {
        await loadDropboxFiles()
      }
    } catch (error) {
      console.error('Failed to load files:', error)
      toast.error('Failed to load files. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const loadGoogleDriveFiles = async () => {
    const params = new URLSearchParams()
    if (googleDriveFolderId) {
      params.set('folderId', googleDriveFolderId)
    }

    const response = await fetch(`/api/integrations/google-drive/files?${params.toString()}`)

    if (!response.ok) {
      throw new Error('Failed to load Google Drive files')
    }

    const data = await response.json()

    const formattedFiles: FileItem[] = (data.files || []).map((file: GoogleDriveFile) => ({
      id: file.id,
      name: file.name,
      type: file.mimeType === 'application/vnd.google-apps.folder' ? 'folder' : 'file',
      mimeType: file.mimeType,
      modified: file.modifiedTime,
      size: file.size ? parseInt(file.size) : undefined,
    }))

    // Filter by allowed file types if specified
    const filteredFiles = allowedFileTypes
      ? formattedFiles.filter(file =>
          file.type === 'folder' ||
          (file.mimeType && allowedFileTypes.some(type => file.mimeType?.includes(type)))
        )
      : formattedFiles

    setFiles(filteredFiles)
    setGoogleDriveNextPageToken(data.nextPageToken || null)
  }

  const loadDropboxFiles = async () => {
    const params = new URLSearchParams()
    if (dropboxPath) {
      params.set('path', dropboxPath)
    }

    const response = await fetch(`/api/integrations/dropbox/files?${params.toString()}`)

    if (!response.ok) {
      throw new Error('Failed to load Dropbox files')
    }

    const data = await response.json()

    const formattedFiles: FileItem[] = [
      ...(data.folders || []).map((folder: DropboxFile) => ({
        id: folder.id,
        name: folder.name,
        path: folder.path,
        type: 'folder' as const,
      })),
      ...(data.files || []).map((file: DropboxFile) => ({
        id: file.id,
        name: file.name,
        path: file.path,
        type: 'file' as const,
        size: file.size,
        modified: file.modified,
      })),
    ]

    // Filter by file extension if allowed file types specified
    const filteredFiles = allowedFileTypes
      ? formattedFiles.filter(file =>
          file.type === 'folder' ||
          allowedFileTypes.some(type => file.name.toLowerCase().endsWith(type.toLowerCase()))
        )
      : formattedFiles

    setFiles(filteredFiles)
  }

  const navigateToFolder = (file: FileItem) => {
    if (file.type !== 'folder') return

    setCurrentPath([...currentPath, file.name])

    if (provider === 'google-drive') {
      setGoogleDriveFolderId(file.id)
    } else {
      setDropboxPath(file.path || `/${file.name}`)
    }
  }

  const navigateUp = () => {
    if (currentPath.length === 0) return

    const newPath = [...currentPath]
    newPath.pop()
    setCurrentPath(newPath)

    if (provider === 'google-drive') {
      // For Google Drive, we'd need to track parent IDs
      // For simplicity, reset to root
      setGoogleDriveFolderId(null)
    } else {
      // For Dropbox, construct path from remaining segments
      const newDropboxPath = newPath.length > 0 ? `/${newPath.join('/')}` : ''
      setDropboxPath(newDropboxPath)
    }
  }

  const navigateToRoot = () => {
    setCurrentPath([])
    setGoogleDriveFolderId(null)
    setDropboxPath('')
  }

  const handleSelect = () => {
    if (!selectedFile) return

    onSelect({
      ...selectedFile,
      provider,
    })
    onOpenChange(false)
  }

  const getFileIcon = (file: FileItem) => {
    if (file.type === 'folder') {
      return <FolderIcon className="h-5 w-5 text-blue-500" />
    }

    const fileName = file.name.toLowerCase()
    const mimeType = file.mimeType?.toLowerCase() || ''

    if (mimeType.includes('image') || /\.(jpg|jpeg|png|gif|svg|webp)$/.test(fileName)) {
      return <ImageIcon className="h-5 w-5 text-purple-500" />
    }

    if (mimeType.includes('spreadsheet') || /\.(xls|xlsx|csv)$/.test(fileName)) {
      return <FileSpreadsheetIcon className="h-5 w-5 text-green-500" />
    }

    if (mimeType.includes('document') || mimeType.includes('pdf') || /\.(doc|docx|pdf|txt)$/.test(fileName)) {
      return <FileTextIcon className="h-5 w-5 text-orange-500" />
    }

    return <FileIcon className="h-5 w-5 text-gray-500" />
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ''

    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return ''

    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Tabs value={provider} onValueChange={(v) => setProvider(v as 'google-drive' | 'dropbox')} className="flex-1 flex flex-col">
          <TabsList className="w-full">
            <TabsTrigger value="google-drive" className="flex-1">
              Google Drive
            </TabsTrigger>
            <TabsTrigger value="dropbox" className="flex-1">
              Dropbox
            </TabsTrigger>
          </TabsList>

          <TabsContent value="google-drive" className="flex-1 flex flex-col mt-4">
            {renderFileList()}
          </TabsContent>

          <TabsContent value="dropbox" className="flex-1 flex flex-col mt-4">
            {renderFileList()}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSelect}
            disabled={!selectedFile || selectedFile.type === 'folder'}
          >
            Select File
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  function renderFileList() {
    return (
      <>
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 mb-4 text-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={navigateToRoot}
            className="h-8 px-2"
          >
            <HomeIcon className="h-4 w-4" />
          </Button>
          {currentPath.length > 0 && (
            <>
              <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
              {currentPath.map((segment, index) => (
                <React.Fragment key={index}>
                  <span className="text-muted-foreground">{segment}</span>
                  {index < currentPath.length - 1 && (
                    <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
                  )}
                </React.Fragment>
              ))}
            </>
          )}
          {currentPath.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={navigateUp}
              className="h-8 ml-auto"
            >
              Back
            </Button>
          )}
        </div>

        {/* File List */}
        <div className="flex-1 border rounded-lg overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <LoaderIcon className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : files.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <FolderIcon className="h-12 w-12 mb-2" />
              <p>No files found</p>
            </div>
          ) : (
            <div className="overflow-y-auto max-h-96">
              {files.map((file) => (
                <div
                  key={file.id}
                  className={cn(
                    "flex items-center gap-3 p-3 border-b last:border-b-0 cursor-pointer hover:bg-accent transition-colors",
                    selectedFile?.id === file.id && "bg-accent"
                  )}
                  onClick={() => {
                    if (file.type === 'folder') {
                      navigateToFolder(file)
                    } else {
                      setSelectedFile(file)
                    }
                  }}
                  onDoubleClick={() => {
                    if (file.type === 'folder') {
                      navigateToFolder(file)
                    } else {
                      setSelectedFile(file)
                      handleSelect()
                    }
                  }}
                >
                  {getFileIcon(file)}

                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    {file.type === 'file' && (
                      <div className="flex gap-3 text-xs text-muted-foreground">
                        {file.size && <span>{formatFileSize(file.size)}</span>}
                        {file.modified && <span>{formatDate(file.modified)}</span>}
                      </div>
                    )}
                  </div>

                  {file.type === 'folder' && (
                    <ChevronRightIcon className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </>
    )
  }
}
