"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { HardDrive, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StorageUsage {
  usedBytes: number;
  usedGb: number;
  limitGb: number;
  limitBytes: number;
  percentUsed: number;
  isAtLimit: boolean;
  formatted: {
    used: string;
    limit: string;
  };
}

interface StorageUsageBarProps {
  className?: string;
  compact?: boolean;
}

export function StorageUsageBar({ className, compact = false }: StorageUsageBarProps) {
  const [usage, setUsage] = useState<StorageUsage | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUsage() {
      try {
        const res = await fetch("/api/storage/usage");
        if (!res.ok) return;
        const data = await res.json();
        setUsage(data);
      } catch (error) {
        console.error("Failed to fetch storage usage:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUsage();
  }, []);

  if (isLoading) {
    return (
      <div className={cn("animate-pulse", className)}>
        <div className="h-4 w-full rounded bg-muted" />
      </div>
    );
  }

  if (!usage || usage.limitGb < 0) {
    // Unlimited storage or personal context
    return null;
  }

  const isWarning = usage.percentUsed >= 80;
  const isCritical = usage.percentUsed >= 95;

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2 text-sm", className)}>
        <HardDrive className="h-4 w-4 text-muted-foreground" />
        <div className="flex-1">
          <Progress
            value={usage.percentUsed}
            className={cn(
              "h-2",
              isCritical && "[&>div]:bg-destructive",
              isWarning && !isCritical && "[&>div]:bg-yellow-500"
            )}
          />
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {usage.formatted.used} / {usage.formatted.limit}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg border p-4", className)}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <HardDrive className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium">Storage</span>
        </div>
        {isCritical && (
          <div className="flex items-center gap-1 text-destructive text-sm">
            <AlertTriangle className="h-4 w-4" />
            <span>Almost full</span>
          </div>
        )}
      </div>

      <Progress
        value={usage.percentUsed}
        className={cn(
          "h-3 mb-2",
          isCritical && "[&>div]:bg-destructive",
          isWarning && !isCritical && "[&>div]:bg-yellow-500"
        )}
      />

      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{usage.formatted.used} used</span>
        <span>{usage.formatted.limit} total</span>
      </div>

      {usage.isAtLimit && (
        <p className="mt-3 text-sm text-destructive">
          You've reached your storage limit. Upgrade your plan to upload more files.
        </p>
      )}
    </div>
  );
}
