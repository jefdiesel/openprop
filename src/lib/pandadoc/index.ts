/**
 * PandaDoc Integration
 *
 * Comprehensive API client for importing templates and documents from PandaDoc
 *
 * @example
 * ```typescript
 * import {
 *   PandaDocClient,
 *   createPandaDocClient,
 *   generateAuthUrl,
 *   exchangeCodeForTokens,
 *   DEFAULT_IMPORT_SCOPES,
 * } from '@/lib/pandadoc';
 *
 * // 1. Start OAuth flow
 * const authUrl = generateAuthUrl(oauthConfig, DEFAULT_IMPORT_SCOPES, state);
 * // Redirect user to authUrl
 *
 * // 2. In callback, exchange code for tokens
 * const tokens = await exchangeCodeForTokens(oauthConfig, code);
 *
 * // 3. Create client and use API
 * const client = createPandaDocClient(tokens, async (newTokens) => {
 *   await saveTokens(userId, newTokens);
 * });
 *
 * const templates = await client.listTemplates();
 * const document = await client.getDocument('doc-id');
 * const pdf = await client.downloadDocument('doc-id');
 * ```
 */

// Client
export {
  PandaDocClient,
  createPandaDocClient,
  PandaDocError,
  PandaDocRateLimitError,
  PandaDocDocumentNotReadyError,
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
  PandaDocAuthError,
  PANDADOC_SCOPES,
  DEFAULT_IMPORT_SCOPES,
  type OAuthStateData,
  type PandaDocScope,
} from "./auth";

// Types
export type {
  // OAuth types
  PandaDocOAuthConfig,
  PandaDocTokenResponse,
  PandaDocTokens,

  // Client types
  PandaDocClientConfig,
  PandaDocRequestOptions,

  // Common types
  PandaDocPagination,
  PandaDocListResponse,
  PandaDocApiError,

  // User types
  PandaDocUser,
  PandaDocMembership,

  // Folder types
  PandaDocFolder,
  PandaDocFolderListResponse,

  // Template types
  PandaDocTemplateListItem,
  PandaDocTemplate,
  PandaDocContentPlaceholder,
  PandaDocRole,
  PandaDocToken,
  PandaDocField,
  PandaDocFieldType,
  PandaDocFieldSummary,
  PandaDocPricingTable,
  PandaDocPricingRow,
  PandaDocPricingColumn,
  PandaDocPricingSummary,
  PandaDocPricingCellValue,
  PandaDocImage,

  // Document types
  PandaDocDocumentStatus,
  PandaDocDocumentListItem,
  PandaDocDocument,
  PandaDocDocumentDetails,
  PandaDocDocumentToken,
  PandaDocDocumentField,
  PandaDocDocumentContent,
  PandaDocPage,
  PandaDocBlock,
  PandaDocBlockType,
  PandaDocRecipient,
  PandaDocLinkedObject,
  PandaDocAuditTrailEntry,

  // Create document types
  PandaDocCreateDocumentFromTemplate,
  PandaDocCreateRecipient,
  PandaDocCreateDocumentResponse,
  PandaDocSendDocumentRequest,
  PandaDocSendDocumentResponse,

  // Download types
  PandaDocDownloadOptions,

  // Webhook types
  PandaDocWebhookEvent,
  PandaDocWebhookEventType,

  // Other types
  PandaDocContact,
  PandaDocContentLibraryItem,
} from "./types";
