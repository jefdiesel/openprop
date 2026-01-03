/**
 * HubSpot API Types
 * Full TypeScript definitions for HubSpot CRM API v3
 */

// ============================================
// OAUTH TYPES
// ============================================

export interface HubSpotOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface HubSpotTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: "bearer";
}

export interface HubSpotTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

// ============================================
// COMMON TYPES
// ============================================

export interface HubSpotPaging {
  next?: {
    after: string;
    link: string;
  };
}

export interface HubSpotListResponse<T> {
  results: T[];
  paging?: HubSpotPaging;
}

export interface HubSpotApiError {
  status: string;
  message: string;
  correlationId: string;
  category: string;
  errors?: Array<{
    message: string;
    context?: Record<string, unknown>;
  }>;
}

// ============================================
// CONTACT TYPES
// ============================================

export interface HubSpotContactProperties {
  email?: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  company?: string;
  jobtitle?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  lifecyclestage?: string;
  hs_lead_status?: string;
  createdate?: string;
  lastmodifieddate?: string;
  [key: string]: string | undefined;
}

export interface HubSpotContact {
  id: string;
  properties: HubSpotContactProperties;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

export interface HubSpotContactInput {
  email: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  company?: string;
  jobtitle?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  lifecyclestage?: string;
  hs_lead_status?: string;
  [key: string]: string | undefined;
}

export interface HubSpotSearchContactsRequest {
  filterGroups?: Array<{
    filters: Array<{
      propertyName: string;
      operator: string;
      value: string;
    }>;
  }>;
  sorts?: Array<{
    propertyName: string;
    direction: "ASCENDING" | "DESCENDING";
  }>;
  properties?: string[];
  limit?: number;
  after?: string;
}

// ============================================
// COMPANY TYPES
// ============================================

export interface HubSpotCompanyProperties {
  name?: string;
  domain?: string;
  industry?: string;
  phone?: string;
  website?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  description?: string;
  numberofemployees?: string;
  annualrevenue?: string;
  createdate?: string;
  lastmodifieddate?: string;
  [key: string]: string | undefined;
}

export interface HubSpotCompany {
  id: string;
  properties: HubSpotCompanyProperties;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

export interface HubSpotCompanyInput {
  name: string;
  domain?: string;
  industry?: string;
  phone?: string;
  website?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  description?: string;
  numberofemployees?: string;
  annualrevenue?: string;
  [key: string]: string | undefined;
}

// ============================================
// DEAL TYPES
// ============================================

export type HubSpotDealStage =
  | "appointmentscheduled"
  | "qualifiedtobuy"
  | "presentationscheduled"
  | "decisionmakerboughtin"
  | "contractsent"
  | "closedwon"
  | "closedlost"
  | string;

export interface HubSpotDealProperties {
  dealname?: string;
  dealstage?: HubSpotDealStage;
  pipeline?: string;
  amount?: string;
  closedate?: string;
  hubspot_owner_id?: string;
  description?: string;
  createdate?: string;
  hs_lastmodifieddate?: string;
  [key: string]: string | undefined;
}

export interface HubSpotDeal {
  id: string;
  properties: HubSpotDealProperties;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

export interface HubSpotDealInput {
  dealname: string;
  dealstage?: HubSpotDealStage;
  pipeline?: string;
  amount?: string;
  closedate?: string;
  hubspot_owner_id?: string;
  description?: string;
  [key: string]: string | undefined;
}

// ============================================
// ASSOCIATION TYPES
// ============================================

export type HubSpotAssociationType =
  | "contact_to_company"
  | "contact_to_deal"
  | "company_to_deal"
  | "deal_to_contact"
  | "deal_to_company"
  | "company_to_contact";

export interface HubSpotAssociation {
  id: string;
  type: string;
}

export interface HubSpotAssociationInput {
  to: {
    id: string;
  };
  types: Array<{
    associationCategory: "HUBSPOT_DEFINED" | "USER_DEFINED";
    associationTypeId: number;
  }>;
}

// ============================================
// NOTE/ENGAGEMENT TYPES
// ============================================

export interface HubSpotNoteProperties {
  hs_note_body?: string;
  hs_timestamp?: string;
  hubspot_owner_id?: string;
  hs_attachment_ids?: string;
  [key: string]: string | undefined;
}

export interface HubSpotNote {
  id: string;
  properties: HubSpotNoteProperties;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

export interface HubSpotNoteInput {
  hs_note_body: string;
  hs_timestamp?: string;
  hubspot_owner_id?: string;
}

// ============================================
// TASK TYPES
// ============================================

export type HubSpotTaskStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "WAITING" | "DEFERRED";
export type HubSpotTaskPriority = "LOW" | "MEDIUM" | "HIGH";
export type HubSpotTaskType = "CALL" | "EMAIL" | "TODO";

export interface HubSpotTaskProperties {
  hs_task_subject?: string;
  hs_task_body?: string;
  hs_task_status?: HubSpotTaskStatus;
  hs_task_priority?: HubSpotTaskPriority;
  hs_task_type?: HubSpotTaskType;
  hs_timestamp?: string;
  hs_task_due_date?: string;
  hubspot_owner_id?: string;
  [key: string]: string | undefined;
}

export interface HubSpotTask {
  id: string;
  properties: HubSpotTaskProperties;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

export interface HubSpotTaskInput {
  hs_task_subject: string;
  hs_task_body?: string;
  hs_task_status?: HubSpotTaskStatus;
  hs_task_priority?: HubSpotTaskPriority;
  hs_task_type?: HubSpotTaskType;
  hs_timestamp?: string;
  hs_task_due_date?: string;
  hubspot_owner_id?: string;
}

// ============================================
// OWNER TYPES
// ============================================

export interface HubSpotOwner {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

// ============================================
// PIPELINE TYPES
// ============================================

export interface HubSpotPipelineStage {
  id: string;
  label: string;
  displayOrder: number;
  metadata: {
    isClosed?: string;
    probability?: string;
  };
}

export interface HubSpotPipeline {
  id: string;
  label: string;
  displayOrder: number;
  stages: HubSpotPipelineStage[];
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

// ============================================
// CLIENT CONFIGURATION
// ============================================

export interface HubSpotClientConfig {
  /**
   * Access token for API authentication
   */
  accessToken?: string;

  /**
   * Refresh token for automatic token refresh
   */
  refreshToken?: string;

  /**
   * Token expiration timestamp
   */
  tokenExpiresAt?: Date;

  /**
   * OAuth config for token refresh
   */
  oauthConfig?: HubSpotOAuthConfig;

  /**
   * Callback when tokens are refreshed
   */
  onTokenRefresh?: (tokens: HubSpotTokens) => Promise<void>;

  /**
   * Base URL for the API (defaults to https://api.hubapi.com)
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
}

export interface HubSpotRequestOptions {
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

// ============================================
// SYNC TYPES
// ============================================

export interface HubSpotSyncSettings {
  enabled: boolean;
  syncOnDocumentSent: boolean;
  syncOnDocumentViewed: boolean;
  syncOnDocumentSigned: boolean;
  syncOnDocumentCompleted: boolean;
  createDealsOnCompletion: boolean;
  createTasksOnCompletion: boolean;
  defaultPipeline?: string;
  defaultDealStage?: string;
}

export interface HubSpotSyncEvent {
  documentId: string;
  documentTitle: string;
  eventType: "sent" | "viewed" | "signed" | "completed" | "declined";
  recipientEmail: string;
  recipientName?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}
