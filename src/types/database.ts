import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import * as schema from '@/lib/db/schema';

// ==========================================
// Inferred types from Drizzle schema
// ==========================================

// Auth.js types
export type User = InferSelectModel<typeof schema.users>;
export type NewUser = InferInsertModel<typeof schema.users>;
export type Account = InferSelectModel<typeof schema.accounts>;
export type NewAccount = InferInsertModel<typeof schema.accounts>;
export type Session = InferSelectModel<typeof schema.sessions>;
export type NewSession = InferInsertModel<typeof schema.sessions>;
export type VerificationToken = InferSelectModel<typeof schema.verificationTokens>;
export type NewVerificationToken = InferInsertModel<typeof schema.verificationTokens>;

// Profile types
export type Profile = InferSelectModel<typeof schema.profiles>;
export type NewProfile = InferInsertModel<typeof schema.profiles>;
export type UpdateProfile = Partial<Omit<Profile, 'id' | 'createdAt'>>;

// Document types
export type Document = InferSelectModel<typeof schema.documents>;
export type NewDocument = InferInsertModel<typeof schema.documents>;
export type UpdateDocument = Partial<Omit<Document, 'id' | 'createdAt' | 'userId'>>;

// Recipient types
export type Recipient = InferSelectModel<typeof schema.recipients>;
export type NewRecipient = InferInsertModel<typeof schema.recipients>;
export type UpdateRecipient = Partial<Omit<Recipient, 'id' | 'createdAt' | 'documentId'>>;

// Document Event types
export type DocumentEvent = InferSelectModel<typeof schema.documentEvents>;
export type NewDocumentEvent = InferInsertModel<typeof schema.documentEvents>;

// Payment types
export type Payment = InferSelectModel<typeof schema.payments>;
export type NewPayment = InferInsertModel<typeof schema.payments>;
export type UpdatePayment = Partial<Omit<Payment, 'id' | 'createdAt' | 'documentId'>>;

// Integration types
export type Integration = InferSelectModel<typeof schema.integrations>;
export type NewIntegration = InferInsertModel<typeof schema.integrations>;
export type UpdateIntegration = Partial<Omit<Integration, 'id' | 'createdAt' | 'userId'>>;

// Import Job types
export type ImportJob = InferSelectModel<typeof schema.importJobs>;
export type NewImportJob = InferInsertModel<typeof schema.importJobs>;
export type UpdateImportJob = Partial<Omit<ImportJob, 'id' | 'createdAt' | 'userId'>>;

// Subscription types
export type Subscription = InferSelectModel<typeof schema.subscriptions>;
export type NewSubscription = InferInsertModel<typeof schema.subscriptions>;
export type UpdateSubscription = Partial<Omit<Subscription, 'id' | 'createdAt' | 'userId'>>;

// Subscription Addon types
export type SubscriptionAddon = InferSelectModel<typeof schema.subscriptionAddons>;
export type NewSubscriptionAddon = InferInsertModel<typeof schema.subscriptionAddons>;

// Early Bird Slot types
export type EarlyBirdSlot = InferSelectModel<typeof schema.earlyBirdSlots>;
export type NewEarlyBirdSlot = InferInsertModel<typeof schema.earlyBirdSlots>;

// ==========================================
// Enum types (derived from schema)
// ==========================================

export type DocumentStatus = 'draft' | 'sent' | 'viewed' | 'completed' | 'expired' | 'declined';
export type RecipientStatus = 'pending' | 'viewed' | 'signed' | 'declined';
export type RecipientRole = 'signer' | 'viewer' | 'approver';
export type PaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete' | 'incomplete_expired';
export type BillingInterval = 'monthly' | 'yearly';
export type PlanId = 'free' | 'pro' | 'business';
export type AddOnId = 'blockchain_audit';
export type ImportJobStatus = 'pending' | 'processing' | 'completed' | 'failed';

// ==========================================
// Block types for document content
// ==========================================

export type BlockType =
  | 'text'
  | 'heading'
  | 'image'
  | 'table'
  | 'signature'
  | 'date'
  | 'checkbox'
  | 'text-input'
  | 'divider'
  | 'spacer'
  | 'page-break'
  | 'pricing-table'
  | 'payment';

// Base block interface
export interface BaseBlock {
  id: string;
  type: BlockType;
  locked?: boolean;
  recipientId?: string;
}

// Text block
export interface TextBlock extends BaseBlock {
  type: 'text';
  content: string;
  format?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    align?: 'left' | 'center' | 'right' | 'justify';
  };
}

// Heading block
export interface HeadingBlock extends BaseBlock {
  type: 'heading';
  content: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
}

// Image block
export interface ImageBlock extends BaseBlock {
  type: 'image';
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  align?: 'left' | 'center' | 'right';
}

// Table cell
export interface TableCell {
  content: string;
  colspan?: number;
  rowspan?: number;
}

// Table block
export interface TableBlock extends BaseBlock {
  type: 'table';
  headers: string[];
  rows: TableCell[][];
}

// Signature block
export interface SignatureBlock extends BaseBlock {
  type: 'signature';
  required: boolean;
  signedData?: string;
  signedAt?: string;
}

// Date block
export interface DateBlock extends BaseBlock {
  type: 'date';
  required: boolean;
  value?: string;
  format?: string;
}

// Checkbox block
export interface CheckboxBlock extends BaseBlock {
  type: 'checkbox';
  label: string;
  required: boolean;
  checked?: boolean;
}

// Text input block
export interface TextInputBlock extends BaseBlock {
  type: 'text-input';
  label?: string;
  placeholder?: string;
  required: boolean;
  value?: string;
  multiline?: boolean;
}

// Divider block
export interface DividerBlock extends BaseBlock {
  type: 'divider';
  style?: 'solid' | 'dashed' | 'dotted';
}

// Spacer block
export interface SpacerBlock extends BaseBlock {
  type: 'spacer';
  height: number;
}

// Page break block
export interface PageBreakBlock extends BaseBlock {
  type: 'page-break';
}

// Pricing item
export interface PricingItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  tax?: number;
}

// Pricing table block
export interface PricingTableBlock extends BaseBlock {
  type: 'pricing-table';
  items: PricingItem[];
  showQuantity?: boolean;
  showDiscount?: boolean;
  showTax?: boolean;
  currency: string;
}

// Payment block
export interface PaymentBlock extends BaseBlock {
  type: 'payment';
  amount: number;
  currency: string;
  description?: string;
  required: boolean;
  timing?: 'due_now' | 'net_30' | 'net_60';
  usePricingTableTotal?: boolean;
  downPaymentPercent?: number; // 0 = full amount, 50 = 50% down, etc.
  paymentIntentId?: string;
  status?: PaymentStatus;
}

// Union type for all blocks
export type Block =
  | TextBlock
  | HeadingBlock
  | ImageBlock
  | TableBlock
  | SignatureBlock
  | DateBlock
  | CheckboxBlock
  | TextInputBlock
  | DividerBlock
  | SpacerBlock
  | PageBreakBlock
  | PricingTableBlock
  | PaymentBlock;

// ==========================================
// JSONB field types
// ==========================================

// Document variables
export interface DocumentVariables {
  [key: string]: string | number | boolean | null;
}

// Document settings
export interface DocumentSettings {
  allowDownload?: boolean;
  allowPrinting?: boolean;
  requireSigningOrder?: boolean;
  expirationDays?: number;
  reminderDays?: number[];
  redirectUrl?: string;
  brandColor?: string;
  logoUrl?: string;
}

// Signature data stored in recipients
export interface SignatureData {
  type: 'drawn' | 'typed' | 'uploaded';
  data: string; // Base64 image or text
  signedAt: string;
}

// ==========================================
// Document with relations
// ==========================================

export interface DocumentWithRecipients extends Document {
  recipients: Recipient[];
}

export interface DocumentWithAll extends Document {
  recipients: Recipient[];
  events: DocumentEvent[];
  payments: Payment[];
}

// ==========================================
// List filters
// ==========================================

export interface DocumentListFilters {
  status?: DocumentStatus;
  isTemplate?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
  orderBy?: 'createdAt' | 'updatedAt' | 'title';
  orderDir?: 'asc' | 'desc';
}

export interface RecipientListFilters {
  documentId?: string;
  status?: RecipientStatus;
  email?: string;
}
