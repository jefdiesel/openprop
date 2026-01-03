"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"

export function EarlyBirdBadge() {
  const [remaining, setRemaining] = useState<number | null>(null)

  useEffect(() => {
    fetch("/api/billing/early-bird")
      .then((res) => res.json())
      .then((data) => setRemaining(data.remaining))
      .catch(() => setRemaining(47)) // Fallback
  }, [])

  if (remaining === null) {
    return (
      <Badge variant="default" className="mb-4 bg-green-600">
        Loading early bird spots...
      </Badge>
    )
  }

  if (remaining <= 0) {
    return null
  }

  return (
    <Badge variant="default" className="mb-4 bg-green-600">
      {remaining} of 100 early bird spots left
    </Badge>
  )
}
