// Block Types for OpenProposal Document Builder

export type BlockType =
  | "text"
  | "image"
  | "divider"
  | "spacer"
  | "signature"
  | "pricing-table"
  | "video"
  | "data-uri";

// Supported networks for ethscriptions
export type EthscriptionNetwork = "ethereum" | "base" | "arbitrum" | "optimism" | "polygon";

export type TextAlignment = "left" | "center" | "right" | "justify";

export type FontSize = "sm" | "base" | "lg" | "xl" | "2xl" | "3xl";

export type DividerStyle = "solid" | "dashed" | "dotted";

export type SpacerSize = "small" | "medium" | "large";

export type SignatureType = "draw" | "type";

// Condition operators
export type ConditionOperator = '==' | '!=' | '>' | '<' | '>=' | '<=';

// Single condition rule
export interface ConditionRule {
  field: string;  // e.g., "pricing.item_abc.isSelected", "pricing.total"
  operator: ConditionOperator;
  value: string | number | boolean;
}

// Condition group with AND/OR logic
export interface ConditionGroup {
  logic: 'AND' | 'OR';
  rules: (ConditionRule | ConditionGroup)[];
}

// Block visibility settings
export interface BlockVisibility {
  condition?: ConditionGroup;
  showInEditor?: boolean;  // Always show in editor even if condition fails (default true)
}

// Base block interface
export interface BlockBase {
  id: string;
  type: BlockType;
  createdAt?: string;
  updatedAt?: string;
  visibility?: BlockVisibility;
}

// Text Block
export interface TextBlockData extends BlockBase {
  type: "text";
  content: string; // HTML content with formatting
  alignment: TextAlignment;
  fontSize: FontSize;
}

// Image Block
export interface ImageBlockData extends BlockBase {
  type: "image";
  src: string;
  alt: string;
  caption?: string;
  width?: number; // percentage 0-100
}

// Divider Block
export interface DividerBlockData extends BlockBase {
  type: "divider";
  style: DividerStyle;
  color?: string;
}

// Spacer Block
export interface SpacerBlockData extends BlockBase {
  type: "spacer";
  size: SpacerSize;
}

// Signature Block
export interface SignatureBlockData extends BlockBase {
  type: "signature";
  signerRole: string; // e.g., "Client", "Contractor", "Witness"
  required: boolean;
  signatureType: SignatureType;
  signatureValue?: string; // base64 for drawn, text for typed
  signedAt?: string;
  signedBy?: string;
}

// Pricing Table Item
export interface PricingTableItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  isOptional: boolean;
  isSelected: boolean; // For optional items
  allowQuantityChange: boolean;
}

// Pricing Table Block
export interface PricingTableBlockData extends BlockBase {
  type: "pricing-table";
  items: PricingTableItem[];
  currency: string;
  showDescription: boolean;
  discountType?: "percentage" | "fixed";
  discountValue?: number;
  taxRate?: number; // percentage
  taxLabel?: string;
}

// Video Block
export interface VideoBlockData extends BlockBase {
  type: "video";
  url: string;
  provider?: "youtube" | "loom" | "vimeo" | "other";
}

// Data URI Block for Ethscriptions
export interface DataURIBlockData extends BlockBase {
  type: "data-uri";
  payload: string; // Base64 encoded data (hidden from recipient)
  network: EthscriptionNetwork;
  label?: string; // Optional label shown to creator only
  inscriptionTxHash?: string; // Transaction hash after inscription
  inscriptionStatus?: "pending" | "inscribed" | "failed";
  recipientAddress?: string; // EVM address entered by recipient
}

// Union type of all blocks
export type Block =
  | TextBlockData
  | ImageBlockData
  | DividerBlockData
  | SpacerBlockData
  | SignatureBlockData
  | PricingTableBlockData
  | VideoBlockData
  | DataURIBlockData;

// Mode for rendering blocks
export type BlockMode = "edit" | "view" | "sign";

// Common props for all block components
export interface BlockComponentProps<T extends Block> {
  block: T;
  mode: BlockMode;
  onChange?: (block: T) => void;
}

// Helper type for creating new blocks
export type NewBlockData<T extends Block> = Omit<T, "id" | "createdAt" | "updatedAt">;

// Default values for new blocks
export const DEFAULT_TEXT_BLOCK: Omit<TextBlockData, "id"> = {
  type: "text",
  content: "",
  alignment: "left",
  fontSize: "base",
};

export const DEFAULT_IMAGE_BLOCK: Omit<ImageBlockData, "id"> = {
  type: "image",
  src: "",
  alt: "",
  caption: "",
  width: 100,
};

export const DEFAULT_DIVIDER_BLOCK: Omit<DividerBlockData, "id"> = {
  type: "divider",
  style: "solid",
};

export const DEFAULT_SPACER_BLOCK: Omit<SpacerBlockData, "id"> = {
  type: "spacer",
  size: "medium",
};

export const DEFAULT_SIGNATURE_BLOCK: Omit<SignatureBlockData, "id"> = {
  type: "signature",
  signerRole: "Client",
  required: true,
  signatureType: "draw",
};

export const DEFAULT_PRICING_TABLE_BLOCK: Omit<PricingTableBlockData, "id"> = {
  type: "pricing-table",
  items: [],
  currency: "USD",
  showDescription: true,
  taxRate: 0,
  taxLabel: "Tax",
};

export const DEFAULT_VIDEO_BLOCK: Omit<VideoBlockData, "id"> = {
  type: "video",
  url: "",
};

export const DEFAULT_DATA_URI_BLOCK: Omit<DataURIBlockData, "id"> = {
  type: "data-uri",
  payload: "",
  network: "base",
  label: "",
};
