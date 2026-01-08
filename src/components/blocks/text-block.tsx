"use client";

import { useCallback, useRef, useEffect, useState } from "react";
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

/**
 * Highlights {{variable}} syntax in content by wrapping them in styled spans
 */
function highlightVariables(html: string): string {
  // Create a temporary div to parse HTML
  const temp = document.createElement("div");
  temp.innerHTML = html;

  // Recursively process text nodes
  function processNode(node: Node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || "";
      const variableRegex = /\{\{([^}]+)\}\}/g;

      if (variableRegex.test(text)) {
        // Create a document fragment to replace the text node
        const fragment = document.createDocumentFragment();
        let lastIndex = 0;
        const matches = text.matchAll(/\{\{([^}]+)\}\}/g);

        for (const match of matches) {
          // Add text before the variable
          if (match.index! > lastIndex) {
            fragment.appendChild(
              document.createTextNode(text.slice(lastIndex, match.index))
            );
          }

          // Add highlighted variable
          const span = document.createElement("span");
          span.className = "variable-highlight";
          span.textContent = match[0];
          span.setAttribute("data-variable", match[1]);
          fragment.appendChild(span);

          lastIndex = match.index! + match[0].length;
        }

        // Add remaining text
        if (lastIndex < text.length) {
          fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
        }

        node.parentNode?.replaceChild(fragment, node);
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // Don't process nodes that are already highlighted or are contentEditable false
      const element = node as HTMLElement;
      if (!element.classList.contains("variable-highlight")) {
        // Process children (iterate backwards since we might modify the tree)
        const children = Array.from(node.childNodes);
        children.forEach(child => processNode(child));
      }
    }
  }

  processNode(temp);
  return temp.innerHTML;
}

/**
 * Removes variable highlighting from content, extracting plain text
 */
function removeVariableHighlights(html: string): string {
  const temp = document.createElement("div");
  temp.innerHTML = html;

  // Find all variable highlight spans and replace with their text content
  const highlights = temp.querySelectorAll(".variable-highlight");
  highlights.forEach(span => {
    const textNode = document.createTextNode(span.textContent || "");
    span.parentNode?.replaceChild(textNode, span);
  });

  return temp.innerHTML;
}

export function TextBlock({
  block,
  mode,
  onChange,
}: BlockComponentProps<TextBlockData>) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isHighlighting, setIsHighlighting] = useState(false);

  const handleContentChange = useCallback(() => {
    if (editorRef.current && onChange && !isHighlighting) {
      // Remove highlighting before saving to preserve clean content
      const cleanContent = removeVariableHighlights(editorRef.current.innerHTML);
      onChange({
        ...block,
        content: cleanContent,
      });
    }
  }, [block, onChange, isHighlighting]);

  // Apply variable highlighting when content changes in edit mode
  useEffect(() => {
    if (mode === "edit" && editorRef.current) {
      const editor = editorRef.current;

      // Save cursor position
      const selection = window.getSelection();
      let cursorOffset = 0;
      let cursorNode: Node | null = null;

      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        cursorNode = range.startContainer;
        cursorOffset = range.startOffset;
      }

      // Apply highlighting
      setIsHighlighting(true);
      const highlighted = highlightVariables(block.content);

      if (editor.innerHTML !== highlighted) {
        editor.innerHTML = highlighted;

        // Restore cursor position (best effort)
        if (cursorNode && selection) {
          try {
            const newRange = document.createRange();

            // Find the equivalent node in the new DOM
            function findEquivalentNode(oldNode: Node, oldOffset: number): { node: Node; offset: number } | null {
              // If we're in a text node, try to find a similar text node
              if (oldNode.nodeType === Node.TEXT_NODE) {
                const textContent = oldNode.textContent || "";
                const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);

                let currentNode: Node | null;
                while ((currentNode = walker.nextNode())) {
                  if (currentNode.textContent === textContent) {
                    return { node: currentNode, offset: Math.min(oldOffset, currentNode.textContent?.length || 0) };
                  }
                }
              }

              // Fallback: position at the end of the editor
              const lastChild = editor.lastChild;
              if (lastChild) {
                if (lastChild.nodeType === Node.TEXT_NODE) {
                  return { node: lastChild, offset: lastChild.textContent?.length || 0 };
                } else {
                  return { node: lastChild, offset: 0 };
                }
              }

              return null;
            }

            const equivalentPos = findEquivalentNode(cursorNode, cursorOffset);
            if (equivalentPos) {
              newRange.setStart(equivalentPos.node, equivalentPos.offset);
              newRange.collapse(true);
              selection.removeAllRanges();
              selection.addRange(newRange);
            }
          } catch (e) {
            // Cursor restoration failed, continue without restoring
            console.debug("Could not restore cursor position", e);
          }
        }
      }

      setIsHighlighting(false);
    }
  }, [block.content, mode]);

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
      <div className="relative">
        <style>{`
          .variable-highlight {
            background-color: rgb(219 234 254);
            color: rgb(30 64 175);
            border-radius: 0.25rem;
            padding: 0.125rem 0.25rem;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
            font-size: 0.875rem;
            line-height: 1.25rem;
            display: inline-block;
            margin: 0 0.125rem;
          }

          .dark .variable-highlight {
            background-color: rgb(30 58 138);
            color: rgb(191 219 254);
          }
        `}</style>
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
    </div>
  );
}
