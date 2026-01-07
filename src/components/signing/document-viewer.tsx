"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import { BlockRenderer } from "@/components/blocks/block-renderer";
import { buildEvaluationContext, isBlockVisible } from "@/lib/conditions/evaluator";
import type { Block } from "@/types/blocks";
import type { Block as DbBlock } from "@/types/database";

interface DocumentViewerProps {
  content: DbBlock[];
  title: string;
  onBlockChange?: (blockId: string, block: Block) => void;
  onBlockView?: (blockId: string, blockType: string, isVisible: boolean) => void;
  onLinkClick?: (url: string, linkText: string) => void;
  className?: string;
  mode?: "sign" | "view";
  downPaymentPercent?: number; // From payment block
}

export function DocumentViewer({
  content,
  title,
  onBlockChange,
  onBlockView,
  onLinkClick,
  className,
  mode = "sign",
  downPaymentPercent,
}: DocumentViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const blockRefsRef = useRef<Map<string, HTMLDivElement>>(new Map());
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

  // Block visibility tracking with IntersectionObserver
  useEffect(() => {
    if (!onBlockView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const blockId = entry.target.getAttribute("data-block-id");
          const blockType = entry.target.getAttribute("data-block-type");
          if (blockId && blockType) {
            onBlockView(blockId, blockType, entry.isIntersecting);
          }
        });
      },
      { threshold: 0.5 } // 50% visible to count as "viewed"
    );

    // Observe all block elements
    blockRefsRef.current.forEach((element) => {
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, [content, onBlockView]);

  // Link click tracking
  useEffect(() => {
    if (!onLinkClick) return;

    const container = containerRef.current;
    if (!container) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");
      if (link && link.href) {
        onLinkClick(link.href, link.textContent || "");
      }
    };

    container.addEventListener("click", handleClick);
    return () => container.removeEventListener("click", handleClick);
  }, [onLinkClick]);

  // Register block ref for visibility tracking
  const setBlockRef = useCallback((blockId: string, blockType: string) => {
    return (el: HTMLDivElement | null) => {
      if (el) {
        el.setAttribute("data-block-id", blockId);
        el.setAttribute("data-block-type", blockType);
        blockRefsRef.current.set(blockId, el);
      } else {
        blockRefsRef.current.delete(blockId);
      }
    };
  }, []);

  // Map database block types to component block types
  // Handles both nested format { type, data: {...} } and flat format { type, ... }
  const mapDbBlockToComponentBlock = useCallback((dbBlock: DbBlock): Block | null => {
    // Check if block uses nested data format (from builder)
    const data = (dbBlock as any).data || dbBlock;

    // Extract visibility from either nested data or top-level
    const visibility = (dbBlock as any).visibility || data.visibility;

    switch (dbBlock.type) {
      case "text":
        return {
          id: dbBlock.id,
          type: "text",
          content: data.content || "",
          alignment: data.alignment || data.format?.align || "left",
          fontSize: data.fontSize ? (data.fontSize <= 14 ? "sm" : data.fontSize <= 18 ? "base" : data.fontSize <= 24 ? "lg" : "xl") : "base",
          visibility,
        };
      case "heading":
        return {
          id: dbBlock.id,
          type: "text",
          content: `<h${data.level || 1}>${data.content || ""}</h${data.level || 1}>`,
          alignment: "left",
          fontSize: data.level === 1 ? "3xl" : data.level === 2 ? "2xl" : "xl",
          visibility,
        };
      case "image":
        return {
          id: dbBlock.id,
          type: "image",
          src: data.url || data.src || "",
          alt: data.alt || "",
          caption: "",
          width: data.width,
          visibility,
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
          visibility,
        };
      case "divider":
        return {
          id: dbBlock.id,
          type: "divider",
          style: data.style || "solid",
          visibility,
        };
      case "spacer":
        const height = data.height || 24;
        return {
          id: dbBlock.id,
          type: "spacer",
          size: height >= 48 ? "large" : height >= 24 ? "medium" : "small",
          visibility,
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
          visibility,
        };
      default:
        return null;
    }
  }, []);

  // Build evaluation context from all blocks for condition evaluation
  const evaluationContext = useMemo(() => {
    // Map all DB blocks to component blocks
    const blocks: Block[] = content
      .map(mapDbBlockToComponentBlock)
      .filter((b): b is Block => b !== null);
    return buildEvaluationContext(blocks);
  }, [content, mapDbBlockToComponentBlock]);

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

              // Check visibility for all blocks in sign/view mode
              if (block && !isBlockVisible(block, evaluationContext)) {
                return null; // Hide block if condition evaluates to false
              }

              if (!block) {
                // Render unsupported blocks as a simple display
                if (dbBlock.type === "table") {
                  return (
                    <div
                      key={dbBlock.id}
                      ref={setBlockRef(dbBlock.id, dbBlock.type)}
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
                    <div key={dbBlock.id} ref={setBlockRef(dbBlock.id, dbBlock.type)} className="flex items-center gap-3">
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
                    <div key={dbBlock.id} ref={setBlockRef(dbBlock.id, dbBlock.type)} className="space-y-1">
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
                    <div key={dbBlock.id} ref={setBlockRef(dbBlock.id, dbBlock.type)} className="space-y-1">
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
                      ref={setBlockRef(dbBlock.id, dbBlock.type)}
                      className="my-8 border-t-2 border-dashed border-muted-foreground/20"
                    />
                  );
                }

                // Skip payment block - payment is handled by PaymentStep component
                if (dbBlock.type === "payment") {
                  return null;
                }

                // Handle data-uri (ethscription) blocks in sign mode
                if (dbBlock.type === "data-uri") {
                  const blockData = (dbBlock as any).data || dbBlock;
                  const dataUriBlock = {
                    id: dbBlock.id,
                    type: "data-uri" as const,
                    payload: blockData.payload || "",
                    network: blockData.network || "base",
                    label: blockData.label || "",
                    inscriptionTxHash: blockData.inscriptionTxHash,
                    inscriptionStatus: blockData.inscriptionStatus,
                    recipientAddress: blockData.recipientAddress,
                  };
                  return (
                    <div key={dbBlock.id} ref={setBlockRef(dbBlock.id, dbBlock.type)}>
                      <BlockRenderer
                        block={dataUriBlock}
                        mode={mode}
                        onChange={handleBlockChange}
                        className="transition-all duration-200"
                      />
                    </div>
                  );
                }

                return null;
              }

              return (
                <div key={block.id} ref={setBlockRef(block.id, block.type)}>
                  <BlockRenderer
                    block={block}
                    mode={mode}
                    onChange={handleBlockChange}
                    className="transition-all duration-200"
                    downPaymentPercent={downPaymentPercent}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
