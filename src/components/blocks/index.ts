// Block Components
export { BlockRenderer } from "./block-renderer";
export { TextBlock } from "./text-block";
export { ImageBlock } from "./image-block";
export { DividerBlock } from "./divider-block";
export { SpacerBlock } from "./spacer-block";
export { SignatureBlock } from "./signature-block";
export { PricingTableBlock } from "./pricing-table-block";
export { VideoBlock } from "./video-block";

// Re-export types
export type {
  Block,
  BlockBase,
  BlockType,
  BlockMode,
  BlockComponentProps,
  TextBlockData,
  ImageBlockData,
  DividerBlockData,
  SpacerBlockData,
  SignatureBlockData,
  PricingTableBlockData,
  PricingTableItem,
  VideoBlockData,
  TextAlignment,
  FontSize,
  DividerStyle,
  SpacerSize,
  SignatureType,
} from "@/types/blocks";

// Re-export defaults
export {
  DEFAULT_TEXT_BLOCK,
  DEFAULT_IMAGE_BLOCK,
  DEFAULT_DIVIDER_BLOCK,
  DEFAULT_SPACER_BLOCK,
  DEFAULT_SIGNATURE_BLOCK,
  DEFAULT_PRICING_TABLE_BLOCK,
  DEFAULT_VIDEO_BLOCK,
} from "@/types/blocks";
