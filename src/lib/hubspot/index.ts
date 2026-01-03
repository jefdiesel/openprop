/**
 * HubSpot CRM Integration
 *
 * Comprehensive API client for HubSpot CRM with contacts, companies, and deals
 *
 * @example
 * ```typescript
 * import {
 *   HubSpotClient,
 *   createHubSpotClient,
 *   generateAuthUrl,
 *   exchangeCodeForTokens,
 *   DEFAULT_CRM_SCOPES,
 * } from '@/lib/hubspot';
 *
 * // 1. Start OAuth flow
 * const authUrl = generateAuthUrl(oauthConfig, DEFAULT_CRM_SCOPES, state);
 * // Redirect user to authUrl
 *
 * // 2. In callback, exchange code for tokens
 * const tokens = await exchangeCodeForTokens(oauthConfig, code);
 *
 * // 3. Create client and use API
 * const client = createHubSpotClient(tokens, async (newTokens) => {
 *   await saveTokens(userId, newTokens);
 * });
 *
 * const contacts = await client.listContacts();
 * const deal = await client.createDeal({ dealname: 'New Deal' });
 * await client.addNoteToContact(contactId, 'Document signed!');
 * ```
 */

// Client
export {
  HubSpotClient,
  createHubSpotClient,
  HubSpotError,
  HubSpotRateLimitError,
} from "./client";

// Auth
export {
  generateAuthUrl,
  exchangeCodeForTokens,
  refreshAccessToken,
  revokeRefreshToken,
  getAccessTokenInfo,
  isTokenExpired,
  ensureValidTokens,
  getOAuthConfigFromEnv,
  generateState,
  encodeStateData,
  decodeStateData,
  isStateValid,
  HubSpotAuthError,
  HUBSPOT_SCOPES,
  DEFAULT_CRM_SCOPES,
  type OAuthStateData,
  type HubSpotScope,
  type HubSpotTokenInfo,
} from "./auth";

// Types
export type {
  // OAuth types
  HubSpotOAuthConfig,
  HubSpotTokenResponse,
  HubSpotTokens,

  // Client types
  HubSpotClientConfig,
  HubSpotRequestOptions,

  // Common types
  HubSpotPaging,
  HubSpotListResponse,
  HubSpotApiError,

  // Contact types
  HubSpotContact,
  HubSpotContactProperties,
  HubSpotContactInput,
  HubSpotSearchContactsRequest,

  // Company types
  HubSpotCompany,
  HubSpotCompanyProperties,
  HubSpotCompanyInput,

  // Deal types
  HubSpotDeal,
  HubSpotDealProperties,
  HubSpotDealInput,
  HubSpotDealStage,

  // Note types
  HubSpotNote,
  HubSpotNoteProperties,
  HubSpotNoteInput,

  // Task types
  HubSpotTask,
  HubSpotTaskProperties,
  HubSpotTaskInput,
  HubSpotTaskStatus,
  HubSpotTaskPriority,
  HubSpotTaskType,

  // Owner types
  HubSpotOwner,

  // Pipeline types
  HubSpotPipeline,
  HubSpotPipelineStage,

  // Association types
  HubSpotAssociation,
  HubSpotAssociationType,
  HubSpotAssociationInput,

  // Sync types
  HubSpotSyncSettings,
  HubSpotSyncEvent,
} from "./types";
