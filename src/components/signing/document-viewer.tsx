"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { BlockRenderer } from "@/components/blocks/block-renderer";
import type { Block } from "@/types/blocks";
import type { Block as DbBlock } from "@/types/database";

interface DocumentViewerProps {
  content: DbBlock[];
  title: string;
  onBlockChange?: (blockId: string, block: Block) => void;
  className?: string;
  mode?: "sign" | "view";
}

export function DocumentViewer({
  content,
  title,
  onBlockChange,
  className,
  mode = "sign",
}: DocumentViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Handle scroll progress
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const maxScroll = scrollHeight - clientHeight;
      if (maxScroll > 0) {
        const progress = (scrollTop / maxScroll) * 100;
        setScrollProgress(Math.min(100, Math.max(0, progress)));
      } else {
        setScrollProgress(100);
      }
    };

    container.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial calculation

    return () => container.removeEventListener("scroll", handleScroll);
  }, [content]);

  // Map database block types to component block types
  // Handles both nested format { type, data: {...} } and flat format { type, ... }
  const mapDbBlockToComponentBlock = useCallback((dbBlock: DbBlock): Block | null => {
    // Check if block uses nested data format (from builder)
    const data = (dbBlock as any).data || dbBlock;

    switch (dbBlock.type) {
      case "text":
        return {
          id: dbBlock.id,
          type: "text",
          content: data.content || "",
          alignment: data.alignment || data.format?.align || "left",
          fontSize: data.fontSize ? (data.fontSize <= 14 ? "sm" : data.fontSize <= 18 ? "base" : data.fontSize <= 24 ? "lg" : "xl") : "base",
        };
      case "heading":
        return {
          id: dbBlock.id,
          type: "text",
          content: `<h${data.level || 1}>${data.content || ""}</h${data.level || 1}>`,
          alignment: "left",
          fontSize: data.level === 1 ? "3xl" : data.level === 2 ? "2xl" : "xl",
        };
      case "image":
        return {
          id: dbBlock.id,
          type: "image",
          src: data.url || data.src || "",
          alt: data.alt || "",
          caption: "",
          width: data.width,
        };
      case "signature":
        // Signature data can be at top level (after signing) or nested in data
        const signatureValue =
          (dbBlock as any).signedData ||
          (dbBlock as any).signatureData?.data ||
          data.signedData ||
          data.signatureData?.data;
        const signedAtValue = (dbBlock as any).signedAt || data.signedAt;
        return {
          id: dbBlock.id,
          type: "signature",
          signerRole: data.role || data.recipientId || "Signer",
          required: data.required || false,
          signatureType: "draw",
          signatureValue,
          signedAt: signedAtValue,
        };
      case "divider":
        return {
          id: dbBlock.id,
          type: "divider",
          style: data.style || "solid",
        };
      case "spacer":
        const height = data.height || 24;
        return {
          id: dbBlock.id,
          type: "spacer",
          size: height >= 48 ? "large" : height >= 24 ? "medium" : "small",
        };
      case "pricing-table":
        const items = data.items || [];
        return {
          id: dbBlock.id,
          type: "pricing-table",
          items: items.map((item: any) => ({
            id: item.id,
            name: item.description || item.name || "",
            description: item.description || "",
            quantity: item.quantity || 0,
            unitPrice: item.unitPrice || 0,
            isOptional: item.isOptional || false,
            isSelected: item.isSelected !== false,
            allowQuantityChange: item.allowQuantityChange || false,
          })),
          currency: data.currency || "USD",
          showDescription: data.showDescription !== false,
          taxRate: data.taxRate || 0,
          taxLabel: data.taxLabel || "Tax",
        };
      default:
        return null;
    }
  }, []);

  const handleBlockChange = useCallback(
    (block: Block) => {
      if (onBlockChange) {
        onBlockChange(block.id, block);
      }
    },
    [onBlockChange]
  );

  return (
    <div className={cn("relative flex flex-col", className)}>
      {/* Scroll progress indicator */}
      <div className="sticky top-0 z-10 h-1 w-full bg-muted">
        <div
          className="h-full bg-primary transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Document content */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 md:px-8 lg:px-12"
      >
        <div className="mx-auto max-w-3xl">
          {/* Document title */}
          <h1 className="mb-8 text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
            {title}
          </h1>

          {/* Document blocks */}
          <div className="space-y-6">
            {content.map((dbBlock) => {
              const block = mapDbBlockToComponentBlock(dbBlock);
              if (!block) {
                // Render unsupported blocks as a simple display
                if (dbBlock.type === "table") {
                  return (
                    <div
                      key={dbBlock.id}
                      className="overflow-x-auto rounded-lg border"
                    >
                      <table className="min-w-full divide-y divide-border">
                        <thead className="bg-muted">
                          <tr>
                            {((dbBlock as any).headers || []).map(
                              (header: string, i: number) => (
                                <th
                                  key={i}
                                  className="px-4 py-3 text-left text-sm font-semibold text-foreground"
                                >
                                  {header}
                                </th>
                              )
                            )}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border bg-card">
                          {((dbBlock as any).rows || []).map(
                            (row: any[], rowIndex: number) => (
                              <tr key={rowIndex}>
                                {row.map((cell, cellIndex) => (
                                  <td
                                    key={cellIndex}
                                    className="px-4 py-3 text-sm text-foreground"
                                  >
                                    {typeof cell === "object" ? cell.content : cell}
                                  </td>
                                ))}
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  );
                }

                if (dbBlock.type === "checkbox") {
                  return (
                    <div key={dbBlock.id} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={(dbBlock as any).checked || false}
                        readOnly
                        className="h-4 w-4 rounded border-muted-foreground/30"
                      />
                      <label className="text-sm text-foreground">
                        {(dbBlock as any).label}
                        {(dbBlock as any).required && (
                          <span className="text-destructive ml-1">*</span>
                        )}
                      </label>
                    </div>
                  );
                }

                if (dbBlock.type === "text-input") {
                  return (
                    <div key={dbBlock.id} className="space-y-1">
                      {(dbBlock as any).label && (
                        <label className="text-sm font-medium text-foreground">
                          {(dbBlock as any).label}
                          {(dbBlock as any).required && (
                            <span className="text-destructive ml-1">*</span>
                          )}
                        </label>
                      )}
                      {(dbBlock as any).multiline ? (
                        <textarea
                          placeholder={(dbBlock as any).placeholder}
                          defaultValue={(dbBlock as any).value || ""}
                          readOnly
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          rows={4}
                        />
                      ) : (
                        <input
                          type="text"
                          placeholder={(dbBlock as any).placeholder}
                          defaultValue={(dbBlock as any).value || ""}
                          readOnly
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        />
                      )}
                    </div>
                  );
                }

                if (dbBlock.type === "date") {
                  return (
                    <div key={dbBlock.id} className="space-y-1">
                      <label className="text-sm font-medium text-foreground">
                        Date
                        {(dbBlock as any).required && (
                          <span className="text-destructive ml-1">*</span>
                        )}
                      </label>
                      <input
                        type="date"
                        defaultValue={(dbBlock as any).value || ""}
                        readOnly
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                    </div>
                  );
                }

                if (dbBlock.type === "page-break") {
                  return (
                    <div
                      key={dbBlock.id}
                      className="my-8 border-t-2 border-dashed border-muted-foreground/20"
                    />
                  );
                }

                if (dbBlock.type === "payment") {
                  return (
                    <div
                      key={dbBlock.id}
                      className="rounded-lg border border-primary/20 bg-primary/5 p-4"
                    >
                      <p className="font-medium text-primary">Payment Required</p>
                      <p className="mt-1 text-2xl font-bold">
                        {(dbBlock as any).currency}{" "}
                        {((dbBlock as any).amount || 0).toFixed(2)}
                      </p>
                      {(dbBlock as any).description && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          {(dbBlock as any).description}
                        </p>
                      )}
                    </div>
                  );
                }

                return null;
              }

              return (
                <BlockRenderer
                  key={block.id}
                  block={block}
                  mode={mode}
                  onChange={handleBlockChange}
                  className="transition-all duration-200"
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
