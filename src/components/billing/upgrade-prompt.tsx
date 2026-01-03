"use client"

import Link from "next/link"
import { Lock, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface UpgradePromptProps {
  feature: string
  description: string
  requiredPlan: "pro" | "business"
  className?: string
}

export function UpgradePrompt({
  feature,
  description,
  requiredPlan,
  className = "",
}: UpgradePromptProps) {
  return (
    <Card className={`border-dashed ${className}`}>
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
          <Lock className="h-6 w-6 text-zinc-400" />
        </div>
        <CardTitle className="text-lg">{feature}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <Button asChild>
          <Link href="/dashboard/settings/billing">
            <Sparkles className="mr-2 h-4 w-4" />
            Upgrade to {requiredPlan === "pro" ? "Pro" : "Business"}
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

// Inline version for smaller prompts
export function UpgradeInline({
  feature,
  requiredPlan,
}: {
  feature: string
  requiredPlan: "pro" | "business"
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-dashed p-3">
      <Lock className="h-4 w-4 text-zinc-400" />
      <span className="text-sm text-zinc-600 dark:text-zinc-400">
        {feature} requires{" "}
        <Link
          href="/dashboard/settings/billing"
          className="font-medium text-zinc-900 hover:underline dark:text-zinc-100"
        >
          {requiredPlan === "pro" ? "Pro" : "Business"} plan
        </Link>
      </span>
    </div>
  )
}

// Badge for feature gates
export function ProBadge() {
  return (
    <span className="ml-1 rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium uppercase text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
      Pro
    </span>
  )
}

export function BusinessBadge() {
  return (
    <span className="ml-1 rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-medium uppercase text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
      Business
    </span>
  )
}
