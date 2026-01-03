"use client";

import { useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bold,
  Italic,
  Link,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Heading1,
  Heading2,
  Heading3,
} from "lucide-react";
import type {
  TextBlockData,
  BlockComponentProps,
  TextAlignment,
  FontSize,
} from "@/types/blocks";

const fontSizeClasses: Record<FontSize, string> = {
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
};

const alignmentClasses: Record<TextAlignment, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
  justify: "text-justify",
};

export function TextBlock({
  block,
  mode,
  onChange,
}: BlockComponentProps<TextBlockData>) {
  const editorRef = useRef<HTMLDivElement>(null);

  const handleContentChange = useCallback(() => {
    if (editorRef.current && onChange) {
      onChange({
        ...block,
        content: editorRef.current.innerHTML,
      });
    }
  }, [block, onChange]);

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleContentChange();
  }, [handleContentChange]);

  const handleAlignmentChange = useCallback(
    (alignment: TextAlignment) => {
      if (onChange) {
        onChange({ ...block, alignment });
      }
    },
    [block, onChange]
  );

  const handleFontSizeChange = useCallback(
    (fontSize: FontSize) => {
      if (onChange) {
        onChange({ ...block, fontSize });
      }
    },
    [block, onChange]
  );

  const insertLink = useCallback(() => {
    const url = window.prompt("Enter URL:");
    if (url) {
      execCommand("createLink", url);
    }
  }, [execCommand]);

  if (mode === "view" || mode === "sign") {
    return (
      <div
        className={cn(
          "prose prose-sm max-w-none dark:prose-invert",
          fontSizeClasses[block.fontSize],
          alignmentClasses[block.alignment]
        )}
        dangerouslySetInnerHTML={{ __html: block.content }}
      />
    );
  }

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 rounded-md border bg-muted/50 p-1">
        <div className="flex items-center gap-0.5 border-r pr-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => execCommand("bold")}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => execCommand("italic")}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={insertLink}
            title="Insert Link"
          >
            <Link className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-0.5 border-r pr-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => execCommand("formatBlock", "<h1>")}
            title="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => execCommand("formatBlock", "<h2>")}
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => execCommand("formatBlock", "<h3>")}
            title="Heading 3"
          >
            <Heading3 className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-0.5 border-r pr-1">
          <Button
            type="button"
            variant={block.alignment === "left" ? "secondary" : "ghost"}
            size="icon-sm"
            onClick={() => handleAlignmentChange("left")}
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={block.alignment === "center" ? "secondary" : "ghost"}
            size="icon-sm"
            onClick={() => handleAlignmentChange("center")}
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={block.alignment === "right" ? "secondary" : "ghost"}
            size="icon-sm"
            onClick={() => handleAlignmentChange("right")}
            title="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={block.alignment === "justify" ? "secondary" : "ghost"}
            size="icon-sm"
            onClick={() => handleAlignmentChange("justify")}
            title="Justify"
          >
            <AlignJustify className="h-4 w-4" />
          </Button>
        </div>

        <Select value={block.fontSize} onValueChange={(v) => handleFontSizeChange(v as FontSize)}>
          <SelectTrigger className="h-8 w-24">
            <SelectValue placeholder="Size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sm">Small</SelectItem>
            <SelectItem value="base">Normal</SelectItem>
            <SelectItem value="lg">Large</SelectItem>
            <SelectItem value="xl">X-Large</SelectItem>
            <SelectItem value="2xl">2X-Large</SelectItem>
            <SelectItem value="3xl">3X-Large</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content Editable */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className={cn(
          "min-h-[100px] rounded-md border bg-background p-3 outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "prose prose-sm max-w-none dark:prose-invert",
          fontSizeClasses[block.fontSize],
          alignmentClasses[block.alignment]
        )}
        onInput={handleContentChange}
        onBlur={handleContentChange}
        dangerouslySetInnerHTML={{ __html: block.content }}
      />
    </div>
  );
}
