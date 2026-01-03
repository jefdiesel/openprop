"use client";

import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Image as ImageIcon, Upload, X } from "lucide-react";
import type { ImageBlockData, BlockComponentProps } from "@/types/blocks";

export function ImageBlock({
  block,
  mode,
  onChange,
}: BlockComponentProps<ImageBlockData>) {
  const [isUrlInput, setIsUrlInput] = useState(!block.src);

  const handleSrcChange = useCallback(
    (src: string) => {
      if (onChange) {
        onChange({ ...block, src });
      }
    },
    [block, onChange]
  );

  const handleAltChange = useCallback(
    (alt: string) => {
      if (onChange) {
        onChange({ ...block, alt });
      }
    },
    [block, onChange]
  );

  const handleCaptionChange = useCallback(
    (caption: string) => {
      if (onChange) {
        onChange({ ...block, caption });
      }
    },
    [block, onChange]
  );

  const handleWidthChange = useCallback(
    (width: number) => {
      if (onChange) {
        onChange({ ...block, width: Math.min(100, Math.max(10, width)) });
      }
    },
    [block, onChange]
  );

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          if (onChange) {
            onChange({ ...block, src: result });
            setIsUrlInput(false);
          }
        };
        reader.readAsDataURL(file);
      }
    },
    [block, onChange]
  );

  const clearImage = useCallback(() => {
    if (onChange) {
      onChange({ ...block, src: "", alt: "", caption: "" });
      setIsUrlInput(true);
    }
  }, [block, onChange]);

  // View mode
  if (mode === "view" || mode === "sign") {
    if (!block.src) {
      return null;
    }

    return (
      <figure
        className="flex flex-col items-center"
        style={{ width: `${block.width || 100}%`, margin: "0 auto" }}
      >
        <img
          src={block.src}
          alt={block.alt || ""}
          className="max-w-full h-auto rounded-md"
        />
        {block.caption && (
          <figcaption className="mt-2 text-sm text-muted-foreground text-center">
            {block.caption}
          </figcaption>
        )}
      </figure>
    );
  }

  // Edit mode
  return (
    <div className="space-y-4">
      {block.src ? (
        <div className="relative">
          <figure
            className="flex flex-col items-center"
            style={{ width: `${block.width || 100}%`, margin: "0 auto" }}
          >
            <img
              src={block.src}
              alt={block.alt || ""}
              className="max-w-full h-auto rounded-md border"
            />
          </figure>
          <Button
            type="button"
            variant="destructive"
            size="icon-sm"
            className="absolute top-2 right-2"
            onClick={clearImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 p-8">
          <ImageIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <div className="flex flex-col items-center gap-2">
            <label htmlFor="image-upload" className="cursor-pointer">
              <Button type="button" variant="secondary" asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Image
                </span>
              </Button>
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <span className="text-sm text-muted-foreground">or</span>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="image-url">Image URL</Label>
          <Input
            id="image-url"
            type="url"
            placeholder="https://example.com/image.jpg"
            value={block.src}
            onChange={(e) => handleSrcChange(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="image-alt">Alt Text</Label>
            <Input
              id="image-alt"
              type="text"
              placeholder="Image description"
              value={block.alt}
              onChange={(e) => handleAltChange(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="image-width">Width (%)</Label>
            <Input
              id="image-width"
              type="number"
              min={10}
              max={100}
              value={block.width || 100}
              onChange={(e) => handleWidthChange(parseInt(e.target.value) || 100)}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="image-caption">Caption (optional)</Label>
          <Input
            id="image-caption"
            type="text"
            placeholder="Image caption"
            value={block.caption || ""}
            onChange={(e) => handleCaptionChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
