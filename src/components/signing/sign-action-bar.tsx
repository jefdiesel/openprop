"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  PenLine,
  Check,
  AlertCircle,
  Loader2,
  ChevronUp,
  X,
} from "lucide-react";

interface SignActionBarProps {
  requiredSignatures: number;
  completedSignatures: number;
  onSign: () => void;
  onDecline?: () => void;
  isSubmitting?: boolean;
  disabled?: boolean;
  className?: string;
}

export function SignActionBar({
  requiredSignatures,
  completedSignatures,
  onSign,
  onDecline,
  isSubmitting = false,
  disabled = false,
  className,
}: SignActionBarProps) {
  const remainingSignatures = requiredSignatures - completedSignatures;
  const allSigned = remainingSignatures <= 0;
  const canSign = !disabled && !isSubmitting;

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
    >
      {/* Pull up indicator for mobile */}
      <div className="flex justify-center py-1 sm:hidden">
        <div className="h-1 w-8 rounded-full bg-muted-foreground/30" />
      </div>

      <div className="mx-auto max-w-4xl px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Status indicator */}
          <div className="flex items-center gap-3">
            {allSigned ? (
              <>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                  <Check className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-green-600 dark:text-green-400">
                    All signatures complete
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Ready to submit your document
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">
                    {remainingSignatures} signature{remainingSignatures !== 1 ? "s" : ""}{" "}
                    required
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {completedSignatures} of {requiredSignatures} completed
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {onDecline && (
              <Button
                type="button"
                variant="outline"
                onClick={onDecline}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none"
              >
                <X className="mr-2 h-4 w-4" />
                Decline
              </Button>
            )}

            <Button
              type="button"
              onClick={onSign}
              disabled={!canSign || !allSigned}
              className={cn(
                "flex-1 sm:flex-none sm:min-w-[180px]",
                allSigned
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : ""
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : allSigned ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Complete & Submit
                </>
              ) : (
                <>
                  <PenLine className="mr-2 h-4 w-4" />
                  Sign Document
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        {requiredSignatures > 0 && (
          <div className="mt-3 sm:mt-4">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full transition-all duration-500 ease-out",
                  allSigned ? "bg-green-500" : "bg-primary"
                )}
                style={{
                  width: `${Math.min(100, (completedSignatures / requiredSignatures) * 100)}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Safe area padding for mobile */}
      <div className="h-safe-area-inset-bottom bg-background" />
    </div>
  );
}
