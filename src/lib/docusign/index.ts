/**
 * DocuSign Integration
 *
 * Comprehensive API client for importing templates and envelopes from DocuSign
 *
 * @example
 * ```typescript
 * import {
 *   DocuSignClient,
 *   createDocuSignClient,
 *   generateAuthUrl,
 *   exchangeCodeForTokens,
 *   getUserInfo,
 *   DEFAULT_SCOPES,
 * } from '@/lib/docusign';
 *
 * // 1. Start OAuth flow
 * const authUrl = generateAuthUrl(oauthConfig, DEFAULT_SCOPES, state);
 * // Redirect user to authUrl
 *
 * // 2. In callback, exchange code for tokens
 * const tokens = await exchangeCodeForTokens(oauthConfig, code);
 *
 * // 3. Get user info to retrieve account ID and base URI
 * const userInfo = await getUserInfo(tokens.accessToken);
 * const defaultAccount = userInfo.accounts.find(a => a.is_default);
 *
 * // 4. Create client and use API
 * const client = createDocuSignClient(
 *   tokens,
 *   defaultAccount.account_id,
 *   defaultAccount.base_uri,
 *   async (newTokens) => {
 *     await saveTokens(userId, newTokens);
 *   }
 * );
 *
 * const templates = await client.listTemplates();
 * const envelope = await client.getEnvelope('envelope-id');
 * ```
 */

// Client
export {
  DocuSignClient,
  createDocuSignClient,
  DocuSignError,
  DocuSignRateLimitError,
} from "./client";

// Auth
export {
  generateAuthUrl,
  exchangeCodeForTokens,
  refreshAccessToken,
  revokeToken,
  getUserInfo,
  isTokenExpired,
  ensureValidTokens,
  getOAuthConfigFromEnv,
  generateState,
  encodeStateData,
  decodeStateData,
  isStateValid,
  DocuSignAuthError,
  DOCUSIGN_SCOPES,
  DEFAULT_SCOPES,
  type OAuthStateData,
  type DocuSignScope,
} from "./auth";

// Mapper
export {
  mapDocuSignTemplate,
  mapDocuSignEnvelope,
  mapDocuSignTemplateToBlocks,
  mapDocuSignEnvelopeToBlocks,
  type OpenProposalDocument,
} from "./mapper";

// Types
export type {
  // OAuth types
  DocuSignOAuthConfig,
  DocuSignTokenResponse,
  DocuSignTokens,

  // Client types
  DocuSignClientConfig,
  DocuSignRequestOptions,

  // User types
  DocuSignUserInfo,
  DocuSignAccount,

  // Template types
  DocuSignTemplateListItem,
  DocuSignTemplateListResponse,
  DocuSignTemplate,

  // Envelope types
  DocuSignEnvelopeStatus,
  DocuSignEnvelopeListItem,
  DocuSignEnvelopeListResponse,
  DocuSignEnvelope,

  // Recipient types
  DocuSignRecipients,
  DocuSignSigner,
  DocuSignCarbonCopy,
  DocuSignCertifiedDelivery,
  DocuSignAgent,
  DocuSignEditor,
  DocuSignIntermediary,

  // Tab types
  DocuSignTabs,
  DocuSignSignHereTab,
  DocuSignInitialHereTab,
  DocuSignDateSignedTab,
  DocuSignTextTab,
  DocuSignCheckboxTab,
  DocuSignNumberTab,
  DocuSignEmailTab,
  DocuSignDateTab,
  DocuSignRadioGroupTab,
  DocuSignListTab,
  DocuSignFullNameTab,
  DocuSignTitleTab,
  DocuSignCompanyTab,
  DocuSignFormulaTab,
  DocuSignApproveTab,
  DocuSignDeclineTab,

  // Document types
  DocuSignDocument,
  DocuSignCustomField,

  // Create envelope types
  DocuSignCreateEnvelopeRequest,
  DocuSignCreateEnvelopeResponse,

  // Error types
  DocuSignApiError,
} from "./types";
