"use client";

import { useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MoveVertical } from "lucide-react";
import type { SpacerBlockData, BlockComponentProps, SpacerSize } from "@/types/blocks";

const spacerHeights: Record<SpacerSize, string> = {
  small: "h-4",
  medium: "h-8",
  large: "h-16",
};

const spacerLabels: Record<SpacerSize, string> = {
  small: "16px",
  medium: "32px",
  large: "64px",
};

export function SpacerBlock({
  block,
  mode,
  onChange,
}: BlockComponentProps<SpacerBlockData>) {
  const handleSizeChange = useCallback(
    (size: SpacerSize) => {
      if (onChange) {
        onChange({ ...block, size });
      }
    },
    [block, onChange]
  );

  const spacerElement = (
    <div
      className={cn("w-full", spacerHeights[block.size])}
      aria-hidden="true"
    />
  );

  // View mode
  if (mode === "view" || mode === "sign") {
    return spacerElement;
  }

  // Edit mode
  return (
    <div className="space-y-2">
      <div className="relative rounded-md border border-dashed border-muted-foreground/25 bg-muted/30">
        <div
          className={cn(
            "w-full flex items-center justify-center",
            spacerHeights[block.size]
          )}
        >
          <div className="flex items-center gap-2 text-muted-foreground/50">
            <MoveVertical className="h-4 w-4" />
            <span className="text-xs font-medium">
              Spacer ({spacerLabels[block.size]})
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="grid gap-2">
          <Label htmlFor="spacer-size">Height</Label>
          <Select
            value={block.size}
            onValueChange={(v) => handleSizeChange(v as SpacerSize)}
          >
            <SelectTrigger id="spacer-size" className="w-32">
              <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Small (16px)</SelectItem>
              <SelectItem value="medium">Medium (32px)</SelectItem>
              <SelectItem value="large">Large (64px)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
