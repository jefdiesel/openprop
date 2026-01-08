/**
 * Google Drive API Types
 * TypeScript definitions for Google Drive API v3 responses
 */

// ============================================
// OAUTH TYPES
// ============================================

export interface GoogleDriveOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface GoogleDriveTokenResponse {
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
  scope: string;
  refresh_token?: string; // Only on first authorization
}

export interface GoogleDriveTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  scope: string;
}

// ============================================
// FILE/FOLDER TYPES
// ============================================

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  parents?: string[];
  createdTime: string;
  modifiedTime: string;
  size?: string;
  webViewLink?: string;
  webContentLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
  trashed?: boolean;
  starred?: boolean;
  shared?: boolean;
  owners?: DriveUser[];
  lastModifyingUser?: DriveUser;
  capabilities?: DriveCapabilities;
  properties?: Record<string, string>;
  appProperties?: Record<string, string>;
}

export interface DriveFolder extends DriveFile {
  mimeType: "application/vnd.google-apps.folder";
}

export interface DriveUser {
  displayName: string;
  emailAddress: string;
  photoLink?: string;
  me?: boolean;
}

export interface DriveCapabilities {
  canEdit?: boolean;
  canDelete?: boolean;
  canShare?: boolean;
  canCopy?: boolean;
  canDownload?: boolean;
  canRename?: boolean;
  canAddChildren?: boolean;
  canListChildren?: boolean;
  canRemoveChildren?: boolean;
}

// ============================================
// PERMISSION TYPES
// ============================================

export interface DrivePermission {
  id: string;
  type: "user" | "group" | "domain" | "anyone";
  role: "owner" | "organizer" | "fileOrganizer" | "writer" | "commenter" | "reader";
  emailAddress?: string;
  domain?: string;
  displayName?: string;
  photoLink?: string;
  deleted?: boolean;
}

// ============================================
// LIST RESPONSE TYPES
// ============================================

export interface DriveFileListResponse {
  kind: "drive#fileList";
  nextPageToken?: string;
  incompleteSearch?: boolean;
  files: DriveFile[];
}

// ============================================
// QUERY/FILTER TYPES
// ============================================

export interface DriveListOptions {
  pageSize?: number;
  pageToken?: string;
  q?: string; // Query string for filtering
  orderBy?: string;
  fields?: string;
  spaces?: "drive" | "appDataFolder" | "photos";
  includeItemsFromAllDrives?: boolean;
  supportsAllDrives?: boolean;
}

export interface DriveSearchQuery {
  name?: string;
  nameContains?: string;
  mimeType?: string;
  parents?: string[];
  trashed?: boolean;
  starred?: boolean;
  fullText?: string;
  modifiedTimeAfter?: Date;
  modifiedTimeBefore?: Date;
  createdTimeAfter?: Date;
  createdTimeBefore?: Date;
}

// ============================================
// UPLOAD TYPES
// ============================================

export interface DriveUploadOptions {
  name: string;
  content: Buffer | Blob | string;
  mimeType: string;
  parents?: string[]; // Parent folder IDs
  description?: string;
  properties?: Record<string, string>;
  appProperties?: Record<string, string>;
}

export interface DriveCreateFolderOptions {
  name: string;
  parents?: string[];
  description?: string;
  properties?: Record<string, string>;
}

// ============================================
// API CLIENT TYPES
// ============================================

export interface GoogleDriveClientConfig {
  /**
   * Access token for API authentication (OAuth Bearer token)
   */
  accessToken: string;

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
  oauthConfig?: GoogleDriveOAuthConfig;

  /**
   * Callback when tokens are refreshed (OAuth only)
   */
  onTokenRefresh?: (tokens: GoogleDriveTokens) => Promise<void>;

  /**
   * Base URL for the API (defaults to https://www.googleapis.com/drive/v3)
   */
  baseUrl?: string;

  /**
   * Upload URL for the API (defaults to https://www.googleapis.com/upload/drive/v3)
   */
  uploadUrl?: string;

  /**
   * Request timeout in milliseconds (defaults to 30000)
   */
  timeout?: number;
}

export interface GoogleDriveRequestOptions {
  /**
   * Override default timeout for this request
   */
  timeout?: number;

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
// ERROR TYPES
// ============================================

export interface GoogleDriveApiError {
  error: {
    code: number;
    message: string;
    errors?: Array<{
      domain: string;
      reason: string;
      message: string;
      locationType?: string;
      location?: string;
    }>;
    status?: string;
  };
}

// ============================================
// INTEGRATION METADATA TYPES
// ============================================

export interface GoogleDriveIntegrationMetadata {
  folderId?: string;
  folderName?: string;
  autoBackup?: boolean;
  subfolderPattern?: "none" | "monthly" | "yearly";
  connectedAt?: string;
}
