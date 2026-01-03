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
import { Input } from "@/components/ui/input";
import type { DividerBlockData, BlockComponentProps, DividerStyle } from "@/types/blocks";

const dividerStyles: Record<DividerStyle, string> = {
  solid: "border-solid",
  dashed: "border-dashed",
  dotted: "border-dotted",
};

export function DividerBlock({
  block,
  mode,
  onChange,
}: BlockComponentProps<DividerBlockData>) {
  const handleStyleChange = useCallback(
    (style: DividerStyle) => {
      if (onChange) {
        onChange({ ...block, style });
      }
    },
    [block, onChange]
  );

  const handleColorChange = useCallback(
    (color: string) => {
      if (onChange) {
        onChange({ ...block, color });
      }
    },
    [block, onChange]
  );

  const dividerElement = (
    <hr
      className={cn(
        "border-t-2 w-full",
        dividerStyles[block.style]
      )}
      style={block.color ? { borderColor: block.color } : undefined}
    />
  );

  // View mode
  if (mode === "view" || mode === "sign") {
    return <div className="py-2">{dividerElement}</div>;
  }

  // Edit mode
  return (
    <div className="space-y-4">
      <div className="py-4">{dividerElement}</div>

      <div className="flex items-center gap-4">
        <div className="grid gap-2">
          <Label htmlFor="divider-style">Style</Label>
          <Select
            value={block.style}
            onValueChange={(v) => handleStyleChange(v as DividerStyle)}
          >
            <SelectTrigger id="divider-style" className="w-32">
              <SelectValue placeholder="Style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="solid">Solid</SelectItem>
              <SelectItem value="dashed">Dashed</SelectItem>
              <SelectItem value="dotted">Dotted</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="divider-color">Color</Label>
          <div className="flex items-center gap-2">
            <Input
              id="divider-color"
              type="color"
              value={block.color || "#e5e7eb"}
              onChange={(e) => handleColorChange(e.target.value)}
              className="w-12 h-9 p-1 cursor-pointer"
            />
            <Input
              type="text"
              value={block.color || "#e5e7eb"}
              onChange={(e) => handleColorChange(e.target.value)}
              placeholder="#e5e7eb"
              className="w-24"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
