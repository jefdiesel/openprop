/**
 * Dropbox Integration
 *
 * Comprehensive API client for file backup and attachments with Dropbox
 *
 * @example
 * ```typescript
 * import {
 *   DropboxClient,
 *   createDropboxClient,
 *   generateAuthUrl,
 *   exchangeCodeForTokens,
 *   DEFAULT_BACKUP_SCOPES,
 * } from '@/lib/dropbox';
 *
 * // 1. Start OAuth flow
 * const authUrl = generateAuthUrl(oauthConfig, DEFAULT_BACKUP_SCOPES, state);
 * // Redirect user to authUrl
 *
 * // 2. In callback, exchange code for tokens
 * const tokens = await exchangeCodeForTokens(oauthConfig, code);
 *
 * // 3. Create client and use API
 * const client = createDropboxClient(tokens, async (newTokens) => {
 *   await saveTokens(userId, newTokens);
 * });
 *
 * const files = await client.listFolder('/OpenProposal');
 * const uploadResult = await client.uploadFile('/OpenProposal/signed.pdf', pdfBuffer);
 * ```
 */

// Client
export {
  DropboxClient,
  createDropboxClient,
  DropboxError,
  DropboxRateLimitError,
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
  DropboxAuthError,
  DROPBOX_SCOPES,
  DEFAULT_BACKUP_SCOPES,
  type OAuthStateData,
  type DropboxScope,
} from "./auth";

// Types
export type {
  // OAuth types
  DropboxOAuthConfig,
  DropboxTokenResponse,
  DropboxTokens,

  // Client types
  DropboxClientConfig,
  DropboxRequestOptions,

  // File/Folder types
  DropboxMetadata,
  DropboxFileMetadata,
  DropboxFolderMetadata,
  DropboxDeletedMetadata,
  DropboxMetadataTag,

  // List folder types
  DropboxListFolderRequest,
  DropboxListFolderResult,

  // Upload types
  DropboxUploadRequest,
  DropboxWriteMode,

  // Download types
  DropboxDownloadRequest,
  DropboxDownloadResult,

  // Create folder types
  DropboxCreateFolderRequest,
  DropboxCreateFolderResult,

  // Get metadata types
  DropboxGetMetadataRequest,

  // Account types
  DropboxAccountInfo,
  DropboxSpaceUsage,
} from "./types";
