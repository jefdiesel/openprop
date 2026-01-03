"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { ChevronDown, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"

interface ImportJobStatus {
  id: string
  status: "pending" | "processing" | "completed" | "failed"
  progress: number
  totalItems: number
  processedItems: number
  importedItems: number
  failedItems: number
  createdAt: string
  completedAt: string | null
  errorMessage: string | null
  metadata: Record<string, unknown> | null
}

interface ImportProgressProps {
  jobId: string
  onComplete?: () => void
}

export function ImportProgress({ jobId, onComplete }: ImportProgressProps) {
  const [job, setJob] = useState<ImportJobStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isErrorsOpen, setIsErrorsOpen] = useState(false)
  const onCompleteRef = useRef(onComplete)
  const hasCalledComplete = useRef(false)

  // Keep the ref updated
  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/import/pandadoc-key/${jobId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch import status")
      }
      const data = await response.json()
      setJob(data.job)
      return data.job
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      return null
    }
  }, [jobId])

  useEffect(() => {
    // Initial fetch
    fetchStatus()

    // Set up polling
    const intervalId = setInterval(async () => {
      const currentJob = await fetchStatus()
      if (
        currentJob &&
        (currentJob.status === "completed" || currentJob.status === "failed")
      ) {
        clearInterval(intervalId)
        if (!hasCalledComplete.current) {
          hasCalledComplete.current = true
          onCompleteRef.current?.()
        }
      }
    }, 2000)

    return () => clearInterval(intervalId)
  }, [fetchStatus])

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!job) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading import status...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const statusConfig = {
    pending: {
      color: "bg-gray-500",
      badgeClass: "bg-gray-100 text-gray-800 border-gray-200",
      label: "Pending",
    },
    processing: {
      color: "bg-blue-500",
      badgeClass: "bg-blue-100 text-blue-800 border-blue-200",
      label: "Processing",
    },
    completed: {
      color: "bg-green-500",
      badgeClass: "bg-green-100 text-green-800 border-green-200",
      label: "Completed",
    },
    failed: {
      color: "bg-red-500",
      badgeClass: "bg-red-100 text-red-800 border-red-200",
      label: "Failed",
    },
  }

  const config = statusConfig[job.status]
  const errors = (job.metadata?.errors as string[]) || []

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Import Progress</CardTitle>
          <Badge variant="outline" className={cn(config.badgeClass)}>
            {job.status === "processing" && (
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            )}
            {job.status === "completed" && (
              <CheckCircle2 className="mr-1 h-3 w-3" />
            )}
            {job.status === "failed" && (
              <AlertCircle className="mr-1 h-3 w-3" />
            )}
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Progress</span>
            <span>{job.progress}%</span>
          </div>
          <Progress value={job.progress} className="h-2" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border p-3 text-center">
            <div className="text-2xl font-semibold">{job.totalItems}</div>
            <div className="text-xs text-muted-foreground">Total Items</div>
          </div>
          <div className="rounded-lg border p-3 text-center">
            <div className="text-2xl font-semibold">{job.processedItems}</div>
            <div className="text-xs text-muted-foreground">Processed</div>
          </div>
          <div className="rounded-lg border p-3 text-center">
            <div className="text-2xl font-semibold text-green-600">
              {job.importedItems}
            </div>
            <div className="text-xs text-muted-foreground">Imported</div>
          </div>
          <div className="rounded-lg border p-3 text-center">
            <div
              className={cn(
                "text-2xl font-semibold",
                job.failedItems > 0 && "text-red-600"
              )}
            >
              {job.failedItems}
            </div>
            <div className="text-xs text-muted-foreground">Failed</div>
          </div>
        </div>

        {/* Error Message */}
        {job.errorMessage && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
            <div className="flex items-center gap-2 text-sm text-red-800">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{job.errorMessage}</span>
            </div>
          </div>
        )}

        {/* Errors from Metadata */}
        {errors.length > 0 && (
          <Collapsible open={isErrorsOpen} onOpenChange={setIsErrorsOpen}>
            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 hover:bg-red-100">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>
                  {errors.length} error{errors.length !== 1 ? "s" : ""} occurred
                </span>
              </div>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  isErrorsOpen && "rotate-180"
                )}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-red-200 bg-red-50 p-3">
                {errors.map((err, index) => (
                  <div key={index} className="text-sm text-red-700">
                    {err}
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  )
}
