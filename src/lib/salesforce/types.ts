/**
 * Salesforce API Types
 * Full TypeScript definitions for Salesforce REST API responses
 */

// ============================================
// OAUTH TYPES
// ============================================

export interface SalesforceOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface SalesforceTokenResponse {
  access_token: string;
  refresh_token: string;
  instance_url: string;
  id: string;
  token_type: "Bearer";
  issued_at: string;
  signature: string;
  scope?: string;
}

export interface SalesforceTokens {
  accessToken: string;
  refreshToken: string;
  instanceUrl: string;
  expiresAt: Date;
  userId?: string;
}

// ============================================
// COMMON TYPES
// ============================================

export interface SalesforceQueryResult<T> {
  totalSize: number;
  done: boolean;
  nextRecordsUrl?: string;
  records: T[];
}

export interface SalesforceApiError {
  message: string;
  errorCode: string;
  fields?: string[];
}

export interface SalesforceCreateResponse {
  id: string;
  success: boolean;
  errors: SalesforceApiError[];
}

export interface SalesforceAttributes {
  type: string;
  url: string;
}

// ============================================
// CONTACT TYPES
// ============================================

export interface SalesforceContact {
  Id: string;
  attributes?: SalesforceAttributes;
  FirstName?: string | null;
  LastName: string;
  Name?: string;
  Email?: string | null;
  Phone?: string | null;
  MobilePhone?: string | null;
  Title?: string | null;
  Department?: string | null;
  AccountId?: string | null;
  Account?: {
    Id: string;
    Name: string;
  } | null;
  MailingStreet?: string | null;
  MailingCity?: string | null;
  MailingState?: string | null;
  MailingPostalCode?: string | null;
  MailingCountry?: string | null;
  Description?: string | null;
  OwnerId?: string | null;
  CreatedDate?: string;
  LastModifiedDate?: string;
}

export interface SalesforceContactCreate {
  FirstName?: string;
  LastName: string;
  Email?: string;
  Phone?: string;
  MobilePhone?: string;
  Title?: string;
  Department?: string;
  AccountId?: string;
  MailingStreet?: string;
  MailingCity?: string;
  MailingState?: string;
  MailingPostalCode?: string;
  MailingCountry?: string;
  Description?: string;
  OwnerId?: string;
}

// ============================================
// ACCOUNT TYPES
// ============================================

export interface SalesforceAccount {
  Id: string;
  attributes?: SalesforceAttributes;
  Name: string;
  Type?: string | null;
  Industry?: string | null;
  Website?: string | null;
  Phone?: string | null;
  BillingStreet?: string | null;
  BillingCity?: string | null;
  BillingState?: string | null;
  BillingPostalCode?: string | null;
  BillingCountry?: string | null;
  ShippingStreet?: string | null;
  ShippingCity?: string | null;
  ShippingState?: string | null;
  ShippingPostalCode?: string | null;
  ShippingCountry?: string | null;
  Description?: string | null;
  OwnerId?: string | null;
  CreatedDate?: string;
  LastModifiedDate?: string;
}

export interface SalesforceAccountCreate {
  Name: string;
  Type?: string;
  Industry?: string;
  Website?: string;
  Phone?: string;
  BillingStreet?: string;
  BillingCity?: string;
  BillingState?: string;
  BillingPostalCode?: string;
  BillingCountry?: string;
  Description?: string;
  OwnerId?: string;
}

// ============================================
// OPPORTUNITY TYPES
// ============================================

export type SalesforceOpportunityStage =
  | "Prospecting"
  | "Qualification"
  | "Needs Analysis"
  | "Value Proposition"
  | "Id. Decision Makers"
  | "Perception Analysis"
  | "Proposal/Price Quote"
  | "Negotiation/Review"
  | "Closed Won"
  | "Closed Lost"
  | string; // Allow custom stages

export interface SalesforceOpportunity {
  Id: string;
  attributes?: SalesforceAttributes;
  Name: string;
  StageName: SalesforceOpportunityStage;
  Amount?: number | null;
  Probability?: number | null;
  CloseDate: string; // YYYY-MM-DD format
  Type?: string | null;
  LeadSource?: string | null;
  NextStep?: string | null;
  Description?: string | null;
  AccountId?: string | null;
  Account?: {
    Id: string;
    Name: string;
  } | null;
  OwnerId?: string | null;
  IsClosed?: boolean;
  IsWon?: boolean;
  ForecastCategory?: string | null;
  ForecastCategoryName?: string | null;
  CampaignId?: string | null;
  ContactId?: string | null;
  CreatedDate?: string;
  LastModifiedDate?: string;
}

export interface SalesforceOpportunityCreate {
  Name: string;
  StageName: SalesforceOpportunityStage;
  CloseDate: string; // YYYY-MM-DD format
  Amount?: number;
  Probability?: number;
  Type?: string;
  LeadSource?: string;
  NextStep?: string;
  Description?: string;
  AccountId?: string;
  OwnerId?: string;
  CampaignId?: string;
  ContactId?: string;
}

export interface SalesforceOpportunityUpdate {
  Name?: string;
  StageName?: SalesforceOpportunityStage;
  CloseDate?: string;
  Amount?: number;
  Probability?: number;
  Type?: string;
  LeadSource?: string;
  NextStep?: string;
  Description?: string;
  AccountId?: string;
  OwnerId?: string;
}

// ============================================
// LEAD TYPES
// ============================================

export type SalesforceLeadStatus =
  | "Open - Not Contacted"
  | "Working - Contacted"
  | "Closed - Converted"
  | "Closed - Not Converted"
  | string; // Allow custom statuses

export interface SalesforceLead {
  Id: string;
  attributes?: SalesforceAttributes;
  FirstName?: string | null;
  LastName: string;
  Name?: string;
  Company: string;
  Title?: string | null;
  Email?: string | null;
  Phone?: string | null;
  MobilePhone?: string | null;
  Website?: string | null;
  LeadSource?: string | null;
  Status: SalesforceLeadStatus;
  Industry?: string | null;
  Rating?: string | null;
  AnnualRevenue?: number | null;
  NumberOfEmployees?: number | null;
  Street?: string | null;
  City?: string | null;
  State?: string | null;
  PostalCode?: string | null;
  Country?: string | null;
  Description?: string | null;
  OwnerId?: string | null;
  IsConverted?: boolean;
  ConvertedAccountId?: string | null;
  ConvertedContactId?: string | null;
  ConvertedOpportunityId?: string | null;
  CreatedDate?: string;
  LastModifiedDate?: string;
}

export interface SalesforceLeadCreate {
  FirstName?: string;
  LastName: string;
  Company: string;
  Title?: string;
  Email?: string;
  Phone?: string;
  MobilePhone?: string;
  Website?: string;
  LeadSource?: string;
  Status?: SalesforceLeadStatus;
  Industry?: string;
  Rating?: string;
  AnnualRevenue?: number;
  NumberOfEmployees?: number;
  Street?: string;
  City?: string;
  State?: string;
  PostalCode?: string;
  Country?: string;
  Description?: string;
  OwnerId?: string;
}

// ============================================
// TASK TYPES
// ============================================

export type SalesforceTaskStatus =
  | "Not Started"
  | "In Progress"
  | "Completed"
  | "Waiting on someone else"
  | "Deferred"
  | string; // Allow custom statuses

export type SalesforceTaskPriority = "High" | "Normal" | "Low" | string;

export interface SalesforceTask {
  Id: string;
  attributes?: SalesforceAttributes;
  Subject: string;
  Status: SalesforceTaskStatus;
  Priority: SalesforceTaskPriority;
  ActivityDate?: string | null; // Due date
  Description?: string | null;
  WhoId?: string | null; // Contact or Lead Id
  WhatId?: string | null; // Related object (Account, Opportunity, etc.)
  OwnerId?: string | null;
  IsReminderSet?: boolean;
  ReminderDateTime?: string | null;
  IsClosed?: boolean;
  TaskSubtype?: string | null;
  CallDurationInSeconds?: number | null;
  CallType?: string | null;
  CallDisposition?: string | null;
  CallObject?: string | null;
  CreatedDate?: string;
  LastModifiedDate?: string;
}

export interface SalesforceTaskCreate {
  Subject: string;
  Status?: SalesforceTaskStatus;
  Priority?: SalesforceTaskPriority;
  ActivityDate?: string; // Due date in YYYY-MM-DD format
  Description?: string;
  WhoId?: string; // Contact or Lead Id
  WhatId?: string; // Related object (Account, Opportunity, etc.)
  OwnerId?: string;
  IsReminderSet?: boolean;
  ReminderDateTime?: string;
  TaskSubtype?: string;
}

// ============================================
// CONTENT VERSION (FILE ATTACHMENT) TYPES
// ============================================

export interface SalesforceContentVersion {
  Id: string;
  attributes?: SalesforceAttributes;
  Title: string;
  Description?: string | null;
  PathOnClient: string;
  VersionData?: string; // Base64 encoded file content (only in request)
  ContentDocumentId?: string;
  FileType?: string;
  ContentSize?: number;
  FirstPublishLocationId?: string; // Links to parent record
  OwnerId?: string;
  IsLatest?: boolean;
  ContentModifiedDate?: string;
  CreatedDate?: string;
}

export interface SalesforceContentVersionCreate {
  Title: string;
  PathOnClient: string; // File name with extension
  VersionData: string; // Base64 encoded file content
  Description?: string;
  FirstPublishLocationId?: string; // Links to parent record (Account, Contact, Opportunity, etc.)
}

export interface SalesforceContentDocumentLink {
  Id: string;
  ContentDocumentId: string;
  LinkedEntityId: string;
  ShareType: "V" | "C" | "I"; // V = Viewer, C = Collaborator, I = Inferred
  Visibility: "AllUsers" | "InternalUsers" | "SharedUsers";
}

export interface SalesforceContentDocumentLinkCreate {
  ContentDocumentId: string;
  LinkedEntityId: string;
  ShareType?: "V" | "C" | "I";
  Visibility?: "AllUsers" | "InternalUsers" | "SharedUsers";
}

// ============================================
// USER TYPES
// ============================================

export interface SalesforceUser {
  Id: string;
  attributes?: SalesforceAttributes;
  Username: string;
  Email: string;
  FirstName?: string | null;
  LastName: string;
  Name: string;
  IsActive: boolean;
  UserType?: string;
  Profile?: {
    Id: string;
    Name: string;
  };
  UserRole?: {
    Id: string;
    Name: string;
  } | null;
  CompanyName?: string | null;
  Division?: string | null;
  Department?: string | null;
  Title?: string | null;
  Phone?: string | null;
  MobilePhone?: string | null;
  CreatedDate?: string;
  LastModifiedDate?: string;
}

// ============================================
// ORGANIZATION INFO TYPES
// ============================================

export interface SalesforceOrganization {
  Id: string;
  Name: string;
  InstanceName?: string;
  IsSandbox?: boolean;
  OrganizationType?: string;
  NamespacePrefix?: string | null;
  DefaultLocaleSidKey?: string;
  LanguageLocaleKey?: string;
  TimeZoneSidKey?: string;
  CreatedDate?: string;
}

// ============================================
// CLIENT TYPES
// ============================================

export interface SalesforceClientConfig {
  /**
   * Access token for API authentication
   */
  accessToken: string;

  /**
   * Refresh token for automatic token refresh
   */
  refreshToken?: string;

  /**
   * The Salesforce instance URL (e.g., https://na1.salesforce.com)
   */
  instanceUrl: string;

  /**
   * Token expiration timestamp
   */
  tokenExpiresAt?: Date;

  /**
   * OAuth config for token refresh
   */
  oauthConfig?: SalesforceOAuthConfig;

  /**
   * Callback when tokens are refreshed
   */
  onTokenRefresh?: (tokens: SalesforceTokens) => Promise<void>;

  /**
   * API version to use (defaults to v59.0)
   */
  apiVersion?: string;

  /**
   * Request timeout in milliseconds (defaults to 30000)
   */
  timeout?: number;

  /**
   * Maximum number of retries for failed requests (defaults to 3)
   */
  maxRetries?: number;

  /**
   * Whether this is a sandbox environment
   */
  isSandbox?: boolean;
}

export interface SalesforceRequestOptions {
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
// SYNC/INTEGRATION TYPES
// ============================================

export interface SalesforceSyncSettings {
  // When document is signed
  updateOpportunityOnSign: boolean;
  signedOpportunityStage: SalesforceOpportunityStage;

  // Task creation
  createTaskOnComplete: boolean;
  taskSubject: string;
  taskPriority: SalesforceTaskPriority;

  // File attachment
  attachDocumentToOpportunity: boolean;
  attachDocumentToAccount: boolean;

  // Field mapping
  fieldMappings: SalesforceFieldMapping[];
}

export interface SalesforceFieldMapping {
  id: string;
  openProposalField: string;
  salesforceObject: "Contact" | "Account" | "Opportunity" | "Lead";
  salesforceField: string;
  enabled: boolean;
}

export interface SalesforceIntegrationMetadata {
  orgName?: string;
  orgId?: string;
  isSandbox?: boolean;
  connectedAt: string;
  userName?: string;
  userEmail?: string;
  syncSettings?: SalesforceSyncSettings;
}
