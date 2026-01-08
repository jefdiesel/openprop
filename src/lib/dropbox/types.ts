/**
 * Dropbox API Types
 * TypeScript definitions for Dropbox API v2 responses
 */

// ============================================
// OAUTH TYPES
// ============================================

export interface DropboxOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface DropboxTokenResponse {
  access_token: string;
  token_type: "bearer";
  expires_in: number;
  scope: string;
  refresh_token?: string;
  account_id: string;
  uid: string;
}

export interface DropboxTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
  scope: string;
  accountId: string;
  uid: string;
}

// ============================================
// COMMON TYPES
// ============================================

export interface DropboxApiError {
  error_summary: string;
  error: {
    ".tag": string;
    [key: string]: unknown;
  };
}

// ============================================
// FILE/FOLDER METADATA TYPES
// ============================================

export type DropboxMetadataTag = "file" | "folder" | "deleted";

export interface DropboxFileMetadata {
  ".tag": "file";
  name: string;
  id: string;
  client_modified: string;
  server_modified: string;
  rev: string;
  size: number;
  path_lower: string;
  path_display: string;
  is_downloadable: boolean;
  content_hash?: string;
}

export interface DropboxFolderMetadata {
  ".tag": "folder";
  name: string;
  id: string;
  path_lower: string;
  path_display: string;
}

export interface DropboxDeletedMetadata {
  ".tag": "deleted";
  name: string;
  path_lower: string;
  path_display: string;
}

export type DropboxMetadata =
  | DropboxFileMetadata
  | DropboxFolderMetadata
  | DropboxDeletedMetadata;

// ============================================
// LIST FOLDER TYPES
// ============================================

export interface DropboxListFolderRequest {
  path: string;
  recursive?: boolean;
  include_deleted?: boolean;
  include_has_explicit_shared_members?: boolean;
  include_mounted_folders?: boolean;
  limit?: number;
}

export interface DropboxListFolderResult {
  entries: DropboxMetadata[];
  cursor: string;
  has_more: boolean;
}

export interface DropboxListFolderContinueRequest {
  cursor: string;
}

// ============================================
// UPLOAD TYPES
// ============================================

export interface DropboxUploadRequest {
  path: string;
  mode?: DropboxWriteMode;
  autorename?: boolean;
  client_modified?: string;
  mute?: boolean;
  strict_conflict?: boolean;
}

export type DropboxWriteMode =
  | { ".tag": "add" }
  | { ".tag": "overwrite" }
  | { ".tag": "update"; update: string };

export interface DropboxUploadSessionStartRequest {
  close?: boolean;
}

export interface DropboxUploadSessionStartResult {
  session_id: string;
}

export interface DropboxUploadSessionAppendRequest {
  cursor: {
    session_id: string;
    offset: number;
  };
  close?: boolean;
}

export interface DropboxUploadSessionFinishRequest {
  cursor: {
    session_id: string;
    offset: number;
  };
  commit: DropboxUploadRequest;
}

// ============================================
// DOWNLOAD TYPES
// ============================================

export interface DropboxDownloadRequest {
  path: string;
}

export interface DropboxDownloadResult {
  metadata: DropboxFileMetadata;
  fileBinary: ArrayBuffer;
}

// ============================================
// CREATE FOLDER TYPES
// ============================================

export interface DropboxCreateFolderRequest {
  path: string;
  autorename?: boolean;
}

export interface DropboxCreateFolderResult {
  metadata: DropboxFolderMetadata;
}

// ============================================
// GET METADATA TYPES
// ============================================

export interface DropboxGetMetadataRequest {
  path: string;
  include_deleted?: boolean;
  include_has_explicit_shared_members?: boolean;
  include_media_info?: boolean;
}

// ============================================
// ACCOUNT TYPES
// ============================================

export interface DropboxAccountInfo {
  account_id: string;
  name: {
    given_name: string;
    surname: string;
    familiar_name: string;
    display_name: string;
    abbreviated_name: string;
  };
  email: string;
  email_verified: boolean;
  disabled: boolean;
  country?: string;
  locale: string;
  profile_photo_url?: string;
}

export interface DropboxSpaceUsage {
  used: number;
  allocation: {
    ".tag": "individual" | "team";
    allocated?: number;
  };
}

// ============================================
// CLIENT CONFIG TYPES
// ============================================

export interface DropboxClientConfig {
  /**
   * Access token for API authentication (OAuth Bearer token)
   */
  accessToken?: string;

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
  oauthConfig?: DropboxOAuthConfig;

  /**
   * Callback when tokens are refreshed (OAuth only)
   */
  onTokenRefresh?: (tokens: DropboxTokens) => Promise<void>;

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

export interface DropboxRequestOptions {
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
