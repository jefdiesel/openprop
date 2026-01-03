"use client"

import Link from "next/link"
import { useSubscription } from "@/hooks/use-subscription"

interface PoweredByProps {
  className?: string
}

export function PoweredBy({ className = "" }: PoweredByProps) {
  const { canRemoveBranding, loading } = useSubscription()

  // Don't show anything if user can remove branding or still loading
  if (loading || canRemoveBranding) {
    return null
  }

  return (
    <div className={`text-center text-xs text-zinc-400 ${className}`}>
      Powered by{" "}
      <Link
        href="https://sendprop.com"
        target="_blank"
        className="font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
      >
        OpenProposal
      </Link>
    </div>
  )
}

// Server-side version for PDFs and static content
export function PoweredByStatic({ show = true }: { show?: boolean }) {
  if (!show) return null

  return (
    <div className="text-center text-xs text-zinc-400">
      Powered by{" "}
      <span className="font-medium text-zinc-600">OpenProposal</span>
    </div>
  )
}
