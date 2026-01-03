/**
 * PandaDoc API Types
 * Full TypeScript definitions for PandaDoc API responses
 */

// ============================================
// OAUTH TYPES
// ============================================

export interface PandaDocOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface PandaDocTokenResponse {
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
  scope: string;
  refresh_token: string;
}

export interface PandaDocTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  scope: string;
}

// ============================================
// COMMON TYPES
// ============================================

export interface PandaDocPagination {
  page: number;
  count: number;
  total: number;
}

export interface PandaDocListResponse<T> {
  results: T[];
  page: number;
  count: number;
  total?: number;
}

export interface PandaDocApiError {
  type: string;
  detail: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

// ============================================
// USER/MEMBER TYPES
// ============================================

export interface PandaDocUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar?: string;
  membership_id?: string;
  date_created?: string;
  date_modified?: string;
  is_active?: boolean;
}

export interface PandaDocMembership {
  membership_id: string;
  user: PandaDocUser;
  workspace: {
    id: string;
    name: string;
  };
  role: string;
  date_created: string;
}

// ============================================
// FOLDER TYPES
// ============================================

export interface PandaDocFolder {
  uuid: string;
  name: string;
  date_created: string;
  date_modified: string;
  created_by: PandaDocUser;
  parent_uuid?: string;
  folder_count?: number;
  document_count?: number;
}

export interface PandaDocFolderListResponse {
  results: PandaDocFolder[];
  page: number;
  count: number;
}

// ============================================
// TEMPLATE TYPES
// ============================================

export interface PandaDocTemplateListItem {
  id: string;
  name: string;
  date_created: string;
  date_modified: string;
  version: string;
  content_placeholders?: PandaDocContentPlaceholder[];
  roles?: PandaDocRole[];
  tokens?: PandaDocToken[];
  fields?: PandaDocFieldSummary[];
  pricing?: PandaDocPricingSummary;
  metadata?: Record<string, string>;
  tags?: string[];
}

export interface PandaDocTemplate extends Omit<PandaDocTemplateListItem, "pricing" | "fields"> {
  content_placeholders: PandaDocContentPlaceholder[];
  roles: PandaDocRole[];
  tokens: PandaDocToken[];
  fields: PandaDocField[];
  pricing?: PandaDocPricingTable[];
  images?: PandaDocImage[];
}

export interface PandaDocContentPlaceholder {
  uuid: string;
  block_id: string;
  name: string;
  content_library_item_id?: string;
  description?: string;
}

export interface PandaDocRole {
  id: string;
  name: string;
  signing_order?: number;
  preassigned_person?: {
    email: string;
    first_name?: string;
    last_name?: string;
  };
}

export interface PandaDocToken {
  name: string;
  value?: string;
}

export interface PandaDocFieldSummary {
  uuid: string;
  name: string;
  type: PandaDocFieldType;
}

export interface PandaDocField {
  uuid: string;
  name: string;
  type: PandaDocFieldType;
  role?: string;
  value?: string | number | boolean | string[];
  placeholder?: string;
  required?: boolean;
  options?: string[];
  merge_field?: string;
  assigned_to?: PandaDocRecipient;
}

export type PandaDocFieldType =
  | "text"
  | "signature"
  | "initials"
  | "date"
  | "checkbox"
  | "dropdown"
  | "radio"
  | "image"
  | "payment"
  | "file_attachment";

export interface PandaDocPricingSummary {
  tables: number;
}

export interface PandaDocPricingTable {
  id: string;
  name: string;
  data_merge: boolean;
  rows: PandaDocPricingRow[];
  columns: PandaDocPricingColumn[];
  summary: {
    subtotal: string;
    total: string;
    discount?: string;
    tax?: string;
  };
  options?: {
    currency: string;
    discount?: {
      type: "percent" | "absolute";
      value: number;
    };
    tax_first?: boolean;
    multicurrency?: boolean;
  };
}

export interface PandaDocPricingRow {
  id: string;
  data: Record<string, PandaDocPricingCellValue>;
  options?: {
    optional?: boolean;
    optional_selected?: boolean;
    qty_editable?: boolean;
    multichoice_enabled?: boolean;
    multichoice_selected?: boolean;
  };
}

export interface PandaDocPricingColumn {
  id: string;
  name: string;
  type: "sku" | "name" | "description" | "qty" | "price" | "cost" | "subtotal" | "discount" | "tax" | "custom";
  merge_id?: string;
}

export type PandaDocPricingCellValue = string | number | null;

export interface PandaDocImage {
  uuid: string;
  name: string;
  urls?: {
    original: string;
    small: string;
    large: string;
  };
}

// ============================================
// DOCUMENT TYPES
// ============================================

export type PandaDocDocumentStatus =
  | "document.draft"
  | "document.sent"
  | "document.completed"
  | "document.viewed"
  | "document.waiting_approval"
  | "document.approved"
  | "document.rejected"
  | "document.waiting_pay"
  | "document.paid"
  | "document.voided"
  | "document.declined"
  | "document.external_review";

export interface PandaDocDocumentListItem {
  id: string;
  name: string;
  status: PandaDocDocumentStatus;
  date_created: string;
  date_modified: string;
  date_completed?: string;
  date_expiration?: string;
  uuid: string;
  version: string;
  template?: {
    id: string;
    name: string;
  };
  created_by?: PandaDocUser;
  grand_total?: {
    amount: string;
    currency: string;
  };
  metadata?: Record<string, string>;
  tags?: string[];
  folder?: {
    uuid: string;
    name: string;
  };
}

export interface PandaDocDocument extends PandaDocDocumentListItem {
  tokens: PandaDocDocumentToken[];
  fields: PandaDocDocumentField[];
  recipients: PandaDocRecipient[];
  pricing_tables?: PandaDocPricingTable[];
  content_placeholders?: PandaDocContentPlaceholder[];
  linked_objects?: PandaDocLinkedObject[];
  info_message?: string;
  audittrail?: PandaDocAuditTrailEntry[];
}

export interface PandaDocDocumentToken {
  name: string;
  value: string;
}

export interface PandaDocDocumentField extends PandaDocField {
  assigned_to?: PandaDocRecipient;
}

export interface PandaDocRecipient {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  role_id?: string;
  type?: "signer" | "cc" | "approver";
  signing_order?: number;
  has_completed?: boolean;
  recipient_type?: "Contact" | "Member";
  shared_link?: string;
  is_sender?: boolean;
  reassigned_from?: PandaDocRecipient;
}

export interface PandaDocLinkedObject {
  id: string;
  provider: string;
  entity_type: string;
  entity_id: string;
}

export interface PandaDocAuditTrailEntry {
  timestamp: string;
  event: string;
  data?: {
    ip_address?: string;
    recipient?: {
      email: string;
      first_name?: string;
      last_name?: string;
    };
    browser?: string;
    operating_system?: string;
  };
}

// ============================================
// DOCUMENT DETAILS (from /documents/{id}/details endpoint)
// ============================================

export interface PandaDocDocumentDetails {
  id: string;
  name: string;
  status: PandaDocDocumentStatus;
  date_created: string;
  date_modified: string;
  date_completed?: string;
  expiration_date?: string;
  version: string;
  uuid: string;
  created_by: PandaDocUser;
  template?: {
    id: string;
    name: string;
  };
  tokens: PandaDocDocumentToken[];
  fields: PandaDocDocumentField[];
  metadata: Record<string, string>;
  pricing: {
    tables: PandaDocPricingTable[];
  };
  recipients: PandaDocRecipient[];
  sent_by?: PandaDocUser;
  grand_total?: {
    amount: string;
    currency: string;
  };
}

// ============================================
// DOCUMENT CONTENT TYPES
// ============================================

export interface PandaDocDocumentContent {
  uuid: string;
  name: string;
  pages: PandaDocPage[];
}

export interface PandaDocPage {
  number: number;
  width: number;
  height: number;
  blocks: PandaDocBlock[];
}

export interface PandaDocBlock {
  uuid: string;
  type: PandaDocBlockType;
  data: Record<string, unknown>;
  position?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export type PandaDocBlockType =
  | "text"
  | "image"
  | "table"
  | "pricing"
  | "signature"
  | "initials"
  | "date"
  | "checkbox"
  | "dropdown"
  | "radio"
  | "content_library"
  | "page_break";

// ============================================
// CREATE DOCUMENT TYPES
// ============================================

export interface PandaDocCreateDocumentFromTemplate {
  name: string;
  template_uuid: string;
  folder_uuid?: string;
  recipients: PandaDocCreateRecipient[];
  tokens?: Array<{
    name: string;
    value: string;
  }>;
  fields?: Record<string, {
    value: string | number | boolean;
  }>;
  pricing_tables?: Array<{
    name: string;
    data_merge: boolean;
    options?: {
      currency?: string;
      discount?: {
        type: "percent" | "absolute";
        value: number;
      };
    };
    rows?: Array<{
      options?: {
        optional?: boolean;
        optional_selected?: boolean;
      };
      data: Record<string, string | number>;
    }>;
  }>;
  metadata?: Record<string, string>;
  tags?: string[];
  content_placeholders?: Array<{
    block_id: string;
    content_library_item_id: string;
  }>;
  images?: Array<{
    name: string;
    urls: {
      url: string;
    };
  }>;
  parse_form_fields?: boolean;
}

export interface PandaDocCreateRecipient {
  email: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  signing_order?: number;
  type?: "signer" | "cc" | "approver";
}

export interface PandaDocCreateDocumentResponse {
  uuid: string;
  id: string;
  name: string;
  status: PandaDocDocumentStatus;
  date_created: string;
  date_modified: string;
}

// ============================================
// SEND DOCUMENT TYPES
// ============================================

export interface PandaDocSendDocumentRequest {
  message?: string;
  subject?: string;
  silent?: boolean;
  sender?: {
    email: string;
  };
  forwarding_settings?: {
    forwarding_allowed?: boolean;
    forwarding_with_reassigning_allowed?: boolean;
  };
}

export interface PandaDocSendDocumentResponse {
  uuid: string;
  id: string;
  name: string;
  status: PandaDocDocumentStatus;
  date_created: string;
  date_modified: string;
  recipients: PandaDocRecipient[];
}

// ============================================
// DOWNLOAD TYPES
// ============================================

export interface PandaDocDownloadOptions {
  /**
   * Whether to include the certificate of completion
   */
  include_certificate?: boolean;

  /**
   * Whether to watermark the document
   */
  watermark?: boolean;

  /**
   * Separate files flag - if true, returns a zip with separate PDFs
   */
  separate_files?: boolean;
}

// ============================================
// WEBHOOK TYPES
// ============================================

export interface PandaDocWebhookEvent {
  event: PandaDocWebhookEventType;
  data: {
    id: string;
    name: string;
    status: PandaDocDocumentStatus;
    date_created: string;
    date_modified: string;
    date_completed?: string;
    metadata?: Record<string, string>;
    recipients?: PandaDocRecipient[];
    sent_by?: PandaDocUser;
    created_by?: PandaDocUser;
    grand_total?: {
      amount: string;
      currency: string;
    };
    action_by?: {
      email: string;
      first_name?: string;
      last_name?: string;
    };
    action_date?: string;
  };
}

export type PandaDocWebhookEventType =
  | "document_state_changed"
  | "recipient_completed"
  | "document_completed"
  | "document_sent"
  | "document_viewed"
  | "document_paid"
  | "document_voided"
  | "document_declined"
  | "document_deleted"
  | "document_creation_failed";

// ============================================
// CONTACT TYPES
// ============================================

export interface PandaDocContact {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  company?: string;
  job_title?: string;
  phone?: string;
  address?: {
    street_address?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  metadata?: Record<string, string>;
  date_created: string;
  date_modified: string;
}

// ============================================
// CONTENT LIBRARY TYPES
// ============================================

export interface PandaDocContentLibraryItem {
  id: string;
  name: string;
  date_created: string;
  date_modified: string;
  created_by: PandaDocUser;
  folder_uuid?: string;
}

// ============================================
// API CLIENT TYPES
// ============================================

export interface PandaDocClientConfig {
  /**
   * Access token for API authentication (OAuth Bearer token)
   */
  accessToken?: string;

  /**
   * API key for simple authentication (alternative to OAuth)
   */
  apiKey?: string;

  /**
   * Refresh token for automatic token refresh (OAuth only)
   */
  refreshToken?: string;

  /**
   * Token expiration timestamp (OAuth only)
   */
  tokenExpiresAt?: Date;

  /**
   * OAuth config for token refresh
   */
  oauthConfig?: PandaDocOAuthConfig;

  /**
   * Callback when tokens are refreshed (OAuth only)
   */
  onTokenRefresh?: (tokens: PandaDocTokens) => Promise<void>;

  /**
   * Base URL for the API (defaults to https://api.pandadoc.com)
   */
  baseUrl?: string;

  /**
   * Request timeout in milliseconds (defaults to 30000)
   */
  timeout?: number;

  /**
   * Maximum number of retries for failed requests (defaults to 3)
   */
  maxRetries?: number;

  /**
   * Initial retry delay in milliseconds (defaults to 1000)
   */
  initialRetryDelay?: number;
}

export interface PandaDocRequestOptions {
  /**
   * Override default timeout for this request
   */
  timeout?: number;

  /**
   * Skip retry logic for this request
   */
  skipRetry?: boolean;

  /**
   * Custom headers for this request
   */
  headers?: Record<string, string>;

  /**
   * Abort signal for request cancellation
   */
  signal?: AbortSignal;
}
