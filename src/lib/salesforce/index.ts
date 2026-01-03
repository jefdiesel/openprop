/**
 * Salesforce CRM Integration
 *
 * Comprehensive API client for Salesforce CRM integration with OpenProposal
 *
 * @example
 * ```typescript
 * import {
 *   SalesforceClient,
 *   createSalesforceClient,
 *   generateAuthUrl,
 *   exchangeCodeForTokens,
 *   DEFAULT_SALESFORCE_SCOPES,
 * } from '@/lib/salesforce';
 *
 * // 1. Start OAuth flow
 * const authUrl = generateAuthUrl(oauthConfig, DEFAULT_SALESFORCE_SCOPES, state, isSandbox);
 * // Redirect user to authUrl
 *
 * // 2. In callback, exchange code for tokens
 * const tokens = await exchangeCodeForTokens(oauthConfig, code, isSandbox);
 *
 * // 3. Create client and use API
 * const client = createSalesforceClient(tokens, async (newTokens) => {
 *   await saveTokens(userId, newTokens);
 * });
 *
 * // Query contacts
 * const contacts = await client.listContacts(25);
 *
 * // Query opportunities
 * const opportunities = await client.listOpportunities(25);
 *
 * // Update opportunity stage when document is signed
 * await client.updateOpportunity(opportunityId, {
 *   StageName: 'Closed Won',
 * });
 *
 * // Attach signed document to opportunity
 * await client.addAttachment(
 *   opportunityId,
 *   'signed-proposal.pdf',
 *   base64PdfContent,
 *   'Signed Proposal'
 * );
 *
 * // Create follow-up task
 * await client.createTask({
 *   Subject: 'Follow up on signed proposal',
 *   WhatId: opportunityId,
 *   Status: 'Not Started',
 *   Priority: 'High',
 *   ActivityDate: '2024-01-20',
 * });
 * ```
 */

// Client
export {
  SalesforceClient,
  createSalesforceClient,
  SalesforceError,
  SalesforceRateLimitError,
  SalesforceNotFoundError,
} from "./client";

// Auth
export {
  generateAuthUrl,
  exchangeCodeForTokens,
  refreshAccessToken,
  revokeToken,
  isTokenExpired,
  ensureValidTokens,
  getOAuthConfigFromEnv,
  generateState,
  encodeStateData,
  decodeStateData,
  isStateValid,
  getUserIdentity,
  SalesforceAuthError,
  SALESFORCE_AUTH_URLS,
  SALESFORCE_SCOPES,
  DEFAULT_SALESFORCE_SCOPES,
  type OAuthStateData,
  type SalesforceScope,
  type SalesforceIdentity,
} from "./auth";

// Sync helpers
export {
  syncDocumentToSalesforce,
  hasSalesforceIntegration,
  getSalesforceSyncSettings,
  type DocumentSyncData,
  type SyncResult,
} from "./sync";

// Types
export type {
  // OAuth types
  SalesforceOAuthConfig,
  SalesforceTokenResponse,
  SalesforceTokens,

  // Client types
  SalesforceClientConfig,
  SalesforceRequestOptions,

  // Common types
  SalesforceQueryResult,
  SalesforceApiError,
  SalesforceCreateResponse,
  SalesforceAttributes,

  // Contact types
  SalesforceContact,
  SalesforceContactCreate,

  // Account types
  SalesforceAccount,
  SalesforceAccountCreate,

  // Opportunity types
  SalesforceOpportunity,
  SalesforceOpportunityCreate,
  SalesforceOpportunityUpdate,
  SalesforceOpportunityStage,

  // Lead types
  SalesforceLead,
  SalesforceLeadCreate,
  SalesforceLeadStatus,

  // Task types
  SalesforceTask,
  SalesforceTaskCreate,
  SalesforceTaskStatus,
  SalesforceTaskPriority,

  // Content/File types
  SalesforceContentVersion,
  SalesforceContentVersionCreate,
  SalesforceContentDocumentLink,
  SalesforceContentDocumentLinkCreate,

  // User types
  SalesforceUser,

  // Organization types
  SalesforceOrganization,

  // Integration/Sync types
  SalesforceSyncSettings,
  SalesforceFieldMapping,
  SalesforceIntegrationMetadata,
} from "./types";
