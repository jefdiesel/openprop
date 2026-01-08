/**
 * Google Drive Integration
 *
 * Comprehensive API client for uploading documents and managing files in Google Drive
 *
 * @example
 * ```typescript
 * import {
 *   GoogleDriveClient,
 *   createGoogleDriveClient,
 *   generateAuthUrl,
 *   exchangeCodeForTokens,
 *   DEFAULT_BACKUP_SCOPES,
 * } from '@/lib/google-drive';
 *
 * // 1. Start OAuth flow
 * const authUrl = generateAuthUrl(oauthConfig, DEFAULT_BACKUP_SCOPES, state);
 * // Redirect user to authUrl
 *
 * // 2. In callback, exchange code for tokens
 * const tokens = await exchangeCodeForTokens(oauthConfig, code);
 *
 * // 3. Create client and use API
 * const client = createGoogleDriveClient(tokens, async (newTokens) => {
 *   await saveTokens(userId, newTokens);
 * });
 *
 * const folder = await client.createFolder({ name: 'OpenProposal Backups' });
 * const file = await client.uploadFile({
 *   name: 'document.pdf',
 *   content: pdfBuffer,
 *   mimeType: 'application/pdf',
 *   parents: [folder.id],
 * });
 * ```
 */

// Client
export {
  GoogleDriveClient,
  createGoogleDriveClient,
  GoogleDriveError,
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
  GoogleDriveAuthError,
  GOOGLE_DRIVE_SCOPES,
  DEFAULT_BACKUP_SCOPES,
  type OAuthStateData,
  type GoogleDriveScope,
} from "./auth";

// Types
export type {
  // OAuth types
  GoogleDriveOAuthConfig,
  GoogleDriveTokenResponse,
  GoogleDriveTokens,

  // Client types
  GoogleDriveClientConfig,
  GoogleDriveRequestOptions,

  // File/Folder types
  DriveFile,
  DriveFolder,
  DriveUser,
  DriveCapabilities,
  DrivePermission,
  DriveFileListResponse,

  // Query types
  DriveListOptions,
  DriveSearchQuery,

  // Upload types
  DriveUploadOptions,
  DriveCreateFolderOptions,

  // Error types
  GoogleDriveApiError,

  // Integration metadata
  GoogleDriveIntegrationMetadata,
} from "./types";
