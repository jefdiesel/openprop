"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sparkles, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function SeedTemplatesButton() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSeed = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/templates/seed", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to create templates")
      }

      const data = await response.json()

      if (data.count > 0) {
        toast.success(`Created ${data.count} starter templates!`)
      } else {
        toast.info("Templates already exist")
      }

      router.refresh()
    } catch (error) {
      toast.error("Failed to create templates")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleSeed} disabled={isLoading}>
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="mr-2 h-4 w-4" />
      )}
      Get Starter Templates
    </Button>
  )
}
