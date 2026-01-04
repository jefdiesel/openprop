"use client";

import { useCallback } from "react";
import { cn } from "@/lib/utils";
import { TextBlock } from "./text-block";
import { ImageBlock } from "./image-block";
import { DividerBlock } from "./divider-block";
import { SpacerBlock } from "./spacer-block";
import { SignatureBlock } from "./signature-block";
import { PricingTableBlock } from "./pricing-table-block";
import { VideoBlock } from "./video-block";
import { DataURIBlock } from "./data-uri-block";
import type {
  Block,
  BlockMode,
  TextBlockData,
  ImageBlockData,
  DividerBlockData,
  SpacerBlockData,
  SignatureBlockData,
  PricingTableBlockData,
  VideoBlockData,
  DataURIBlockData,
} from "@/types/blocks";

export interface BlockRendererProps {
  block: Block;
  mode: BlockMode;
  onChange?: (block: Block) => void;
  className?: string;
  downPaymentPercent?: number; // From payment block, for pricing table display
}

export function BlockRenderer({
  block,
  mode,
  onChange,
  className,
  downPaymentPercent,
}: BlockRendererProps) {
  // Type-safe change handlers for each block type
  const handleTextChange = useCallback(
    (updatedBlock: TextBlockData) => {
      onChange?.(updatedBlock);
    },
    [onChange]
  );

  const handleImageChange = useCallback(
    (updatedBlock: ImageBlockData) => {
      onChange?.(updatedBlock);
    },
    [onChange]
  );

  const handleDividerChange = useCallback(
    (updatedBlock: DividerBlockData) => {
      onChange?.(updatedBlock);
    },
    [onChange]
  );

  const handleSpacerChange = useCallback(
    (updatedBlock: SpacerBlockData) => {
      onChange?.(updatedBlock);
    },
    [onChange]
  );

  const handleSignatureChange = useCallback(
    (updatedBlock: SignatureBlockData) => {
      onChange?.(updatedBlock);
    },
    [onChange]
  );

  const handlePricingTableChange = useCallback(
    (updatedBlock: PricingTableBlockData) => {
      onChange?.(updatedBlock);
    },
    [onChange]
  );

  const handleVideoChange = useCallback(
    (updatedBlock: VideoBlockData) => {
      onChange?.(updatedBlock);
    },
    [onChange]
  );

  const handleDataURIChange = useCallback(
    (updatedBlock: DataURIBlockData) => {
      onChange?.(updatedBlock);
    },
    [onChange]
  );

  const renderBlock = () => {
    switch (block.type) {
      case "text":
        return (
          <TextBlock
            block={block}
            mode={mode}
            onChange={handleTextChange}
          />
        );

      case "image":
        return (
          <ImageBlock
            block={block}
            mode={mode}
            onChange={handleImageChange}
          />
        );

      case "divider":
        return (
          <DividerBlock
            block={block}
            mode={mode}
            onChange={handleDividerChange}
          />
        );

      case "spacer":
        return (
          <SpacerBlock
            block={block}
            mode={mode}
            onChange={handleSpacerChange}
          />
        );

      case "signature":
        return (
          <SignatureBlock
            block={block}
            mode={mode}
            onChange={handleSignatureChange}
          />
        );

      case "pricing-table":
        return (
          <PricingTableBlock
            block={block}
            mode={mode}
            onChange={handlePricingTableChange}
            downPaymentPercent={downPaymentPercent}
          />
        );

      case "video":
        return (
          <VideoBlock
            block={block}
            mode={mode}
            onChange={handleVideoChange}
          />
        );

      case "data-uri":
        return (
          <DataURIBlock
            block={block}
            mode={mode}
            onChange={handleDataURIChange}
          />
        );

      default:
        // Type guard for exhaustive checking
        const _exhaustiveCheck: never = block;
        console.warn(`Unknown block type:`, _exhaustiveCheck);
        return (
          <div className="rounded-md border border-destructive bg-destructive/10 p-4 text-destructive text-sm">
            Unknown block type
          </div>
        );
    }
  };

  return (
    <div
      className={cn(
        "block-renderer",
        mode === "edit" && "rounded-lg border bg-card p-4 shadow-sm",
        className
      )}
      data-block-id={block.id}
      data-block-type={block.type}
    >
      {renderBlock()}
    </div>
  );
}

// Export all block components for direct use
export { TextBlock } from "./text-block";
export { ImageBlock } from "./image-block";
export { DividerBlock } from "./divider-block";
export { SpacerBlock } from "./spacer-block";
export { SignatureBlock } from "./signature-block";
export { PricingTableBlock } from "./pricing-table-block";
export { VideoBlock } from "./video-block";
export { DataURIBlock } from "./data-uri-block";
