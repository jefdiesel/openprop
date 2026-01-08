/**
 * Google Drive API Client
 *
 * Production-ready client for Google Drive API v3 with:
 * - OAuth2 authentication with automatic token refresh
 * - File upload, download, and management
 * - Folder creation and navigation
 * - Comprehensive error handling
 * - Full TypeScript support
 */

import type {
  GoogleDriveClientConfig,
  GoogleDriveRequestOptions,
  GoogleDriveTokens,
  GoogleDriveApiError,
  DriveFile,
  DriveFolder,
  DriveFileListResponse,
  DriveListOptions,
  DriveUploadOptions,
  DriveCreateFolderOptions,
  DriveSearchQuery,
} from "./types";
import { refreshAccessToken, isTokenExpired, GoogleDriveAuthError } from "./auth";

// ============================================
// CONSTANTS
// ============================================

const DEFAULT_BASE_URL = "https://www.googleapis.com/drive/v3";
const DEFAULT_UPLOAD_URL = "https://www.googleapis.com/upload/drive/v3";
const DEFAULT_TIMEOUT = 30000; // 30 seconds

// ============================================
// ERROR CLASSES
// ============================================

/**
 * Base error class for Google Drive API errors
 */
export class GoogleDriveError extends Error {
  public readonly statusCode: number;
  public readonly errorType?: string;
  public readonly errors?: Array<{
    domain: string;
    reason: string;
    message: string;
  }>;

  constructor(
    message: string,
    statusCode: number,
    errorType?: string,
    errors?: Array<{
      domain: string;
      reason: string;
      message: string;
    }>
  ) {
    super(message);
    this.name = "GoogleDriveError";
    this.statusCode = statusCode;
    this.errorType = errorType;
    this.errors = errors;
  }

  static fromApiError(error: GoogleDriveApiError, statusCode: number): GoogleDriveError {
    return new GoogleDriveError(
      error.error.message,
      statusCode,
      error.error.status,
      error.error.errors
    );
  }
}

// ============================================
// CLIENT CLASS
// ============================================

/**
 * Google Drive API Client
 *
 * @example
 * ```typescript
 * const client = new GoogleDriveClient({
 *   accessToken: 'your-access-token',
 *   refreshToken: 'your-refresh-token',
 *   tokenExpiresAt: new Date('2024-01-01'),
 *   oauthConfig: {
 *     clientId: 'your-client-id',
 *     clientSecret: 'your-client-secret',
 *     redirectUri: 'your-redirect-uri',
 *   },
 *   onTokenRefresh: async (tokens) => {
 *     // Save new tokens to database
 *     await saveTokens(tokens);
 *   },
 * });
 *
 * const files = await client.listFiles();
 * const folder = await client.createFolder({ name: 'My Folder' });
 * ```
 */
export class GoogleDriveClient {
  private accessToken: string;
  private refreshToken?: string;
  private tokenExpiresAt?: Date;
  private readonly config: Required<
    Pick<GoogleDriveClientConfig, "baseUrl" | "uploadUrl" | "timeout">
  > &
    Pick<GoogleDriveClientConfig, "oauthConfig" | "onTokenRefresh">;

  constructor(config: GoogleDriveClientConfig) {
    if (!config.accessToken) {
      throw new Error("accessToken must be provided");
    }
    this.accessToken = config.accessToken;
    this.refreshToken = config.refreshToken;
    this.tokenExpiresAt = config.tokenExpiresAt;
    this.config = {
      baseUrl: config.baseUrl ?? DEFAULT_BASE_URL,
      uploadUrl: config.uploadUrl ?? DEFAULT_UPLOAD_URL,
      timeout: config.timeout ?? DEFAULT_TIMEOUT,
      oauthConfig: config.oauthConfig,
      onTokenRefresh: config.onTokenRefresh,
    };
  }

  // ============================================
  // TOKEN MANAGEMENT
  // ============================================

  /**
   * Update tokens (useful after manual refresh)
   */
  public updateTokens(tokens: GoogleDriveTokens): void {
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
    this.tokenExpiresAt = tokens.expiresAt;
  }

  /**
   * Get current access token
   */
  public getAccessToken(): string {
    return this.accessToken;
  }

  /**
   * Check if token refresh is needed and perform refresh
   */
  private async ensureValidToken(): Promise<void> {
    if (!this.tokenExpiresAt || !this.refreshToken || !this.config.oauthConfig) {
      return; // Cannot refresh without these
    }

    if (!isTokenExpired(this.tokenExpiresAt)) {
      return; // Token is still valid
    }

    try {
      const newTokens = await refreshAccessToken(
        this.config.oauthConfig,
        this.refreshToken
      );
      this.updateTokens(newTokens);

      if (this.config.onTokenRefresh) {
        await this.config.onTokenRefresh(newTokens);
      }
    } catch (error) {
      if (error instanceof GoogleDriveAuthError && error.requiresReauthorization) {
        throw error; // Re-throw auth errors that need user action
      }
      // Log but don't throw for other refresh errors
      console.warn("Failed to refresh Google Drive token:", error);
    }
  }

  // ============================================
  // HTTP REQUEST HANDLING
  // ============================================

  /**
   * Make an authenticated API request
   */
  private async request<T>(
    method: string,
    path: string,
    options: GoogleDriveRequestOptions & {
      body?: unknown;
      query?: Record<string, string | number | boolean | undefined>;
      isUpload?: boolean;
    } = {}
  ): Promise<T> {
    await this.ensureValidToken();

    const baseUrl = options.isUpload ? this.config.uploadUrl : this.config.baseUrl;
    const url = this.buildUrl(baseUrl, path, options.query);
    const timeout = options.timeout ?? this.config.timeout;

    const response = await this.makeRequest(method, url, timeout, options);
    return this.handleResponse<T>(response);
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(
    baseUrl: string,
    path: string,
    query?: Record<string, string | number | boolean | undefined>
  ): string {
    const url = new URL(`${baseUrl}${path}`);

    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    return url.toString();
  }

  /**
   * Make the actual HTTP request
   */
  private async makeRequest(
    method: string,
    url: string,
    timeout: number,
    options: GoogleDriveRequestOptions & { body?: unknown }
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${this.accessToken}`,
        ...options.headers,
      };

      // Only set Content-Type if not already set (for multipart uploads)
      if (options.body && !headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
      }

      const response = await fetch(url, {
        method,
        headers,
        body:
          options.body instanceof FormData || typeof options.body === "string"
            ? options.body
            : options.body
            ? JSON.stringify(options.body)
            : undefined,
        signal: options.signal ?? controller.signal,
      });

      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Handle API response
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    // Handle no content
    if (response.status === 204) {
      return undefined as T;
    }

    // Handle errors
    if (!response.ok) {
      let errorData: GoogleDriveApiError;
      try {
        errorData = await response.json();
      } catch {
        errorData = {
          error: {
            code: response.status,
            message: `HTTP ${response.status}: ${response.statusText}`,
          },
        };
      }
      throw GoogleDriveError.fromApiError(errorData, response.status);
    }

    // Check content type for binary responses
    const contentType = response.headers.get("Content-Type") ?? "";
    if (
      contentType.includes("application/pdf") ||
      contentType.includes("application/octet-stream") ||
      contentType.startsWith("image/") ||
      contentType.startsWith("video/")
    ) {
      return response.arrayBuffer() as Promise<T>;
    }

    return response.json();
  }

  // ============================================
  // FILE LISTING & SEARCH
  // ============================================

  /**
   * List files in Drive
   *
   * @param options - List options including query, pageSize, etc.
   * @returns List of files
   *
   * @example
   * ```typescript
   * // List all files
   * const files = await client.listFiles();
   *
   * // List files in a specific folder
   * const files = await client.listFiles({ q: `'${folderId}' in parents` });
   *
   * // Search for PDF files
   * const pdfs = await client.listFiles({ q: "mimeType='application/pdf'" });
   * ```
   */
  async listFiles(options: DriveListOptions = {}): Promise<DriveFileListResponse> {
    const query: Record<string, string | number | undefined> = {
      pageSize: options.pageSize ?? 100,
      pageToken: options.pageToken,
      q: options.q,
      orderBy: options.orderBy,
      fields: options.fields ?? "nextPageToken, files(id, name, mimeType, parents, createdTime, modifiedTime, size, webViewLink, iconLink, trashed)",
      spaces: options.spaces,
      includeItemsFromAllDrives: options.includeItemsFromAllDrives?.toString(),
      supportsAllDrives: options.supportsAllDrives?.toString(),
    };

    return this.request<DriveFileListResponse>("GET", "/files", { query });
  }

  /**
   * Search files using a structured query
   *
   * @param searchQuery - Structured search parameters
   * @param options - Additional list options
   * @returns List of matching files
   */
  async searchFiles(
    searchQuery: DriveSearchQuery,
    options: Omit<DriveListOptions, "q"> = {}
  ): Promise<DriveFileListResponse> {
    const queryParts: string[] = [];

    if (searchQuery.name) {
      queryParts.push(`name = '${searchQuery.name.replace(/'/g, "\\'")}'`);
    }
    if (searchQuery.nameContains) {
      queryParts.push(`name contains '${searchQuery.nameContains.replace(/'/g, "\\'")}'`);
    }
    if (searchQuery.mimeType) {
      queryParts.push(`mimeType = '${searchQuery.mimeType}'`);
    }
    if (searchQuery.parents && searchQuery.parents.length > 0) {
      const parentQueries = searchQuery.parents.map((p) => `'${p}' in parents`);
      queryParts.push(`(${parentQueries.join(" or ")})`);
    }
    if (searchQuery.trashed !== undefined) {
      queryParts.push(`trashed = ${searchQuery.trashed}`);
    }
    if (searchQuery.starred !== undefined) {
      queryParts.push(`starred = ${searchQuery.starred}`);
    }
    if (searchQuery.fullText) {
      queryParts.push(`fullText contains '${searchQuery.fullText.replace(/'/g, "\\'")}'`);
    }
    if (searchQuery.modifiedTimeAfter) {
      queryParts.push(`modifiedTime > '${searchQuery.modifiedTimeAfter.toISOString()}'`);
    }
    if (searchQuery.modifiedTimeBefore) {
      queryParts.push(`modifiedTime < '${searchQuery.modifiedTimeBefore.toISOString()}'`);
    }
    if (searchQuery.createdTimeAfter) {
      queryParts.push(`createdTime > '${searchQuery.createdTimeAfter.toISOString()}'`);
    }
    if (searchQuery.createdTimeBefore) {
      queryParts.push(`createdTime < '${searchQuery.createdTimeBefore.toISOString()}'`);
    }

    const q = queryParts.join(" and ");

    return this.listFiles({ ...options, q });
  }

  /**
   * Get file metadata
   *
   * @param fileId - The file ID
   * @param fields - Fields to return (defaults to common fields)
   * @returns File metadata
   */
  async getFile(fileId: string, fields?: string): Promise<DriveFile> {
    const query: Record<string, string | undefined> = {
      fields: fields ?? "id, name, mimeType, parents, createdTime, modifiedTime, size, webViewLink, webContentLink, iconLink, thumbnailLink, trashed, starred, shared, owners, lastModifyingUser, capabilities",
    };

    return this.request<DriveFile>("GET", `/files/${fileId}`, { query });
  }

  // ============================================
  // FILE UPLOAD
  // ============================================

  /**
   * Upload a file to Google Drive
   *
   * @param options - Upload options
   * @returns Created file metadata
   *
   * @example
   * ```typescript
   * const file = await client.uploadFile({
   *   name: 'document.pdf',
   *   content: pdfBuffer,
   *   mimeType: 'application/pdf',
   *   parents: [folderId],
   * });
   * ```
   */
  async uploadFile(options: DriveUploadOptions): Promise<DriveFile> {
    const metadata = {
      name: options.name,
      mimeType: options.mimeType,
      parents: options.parents,
      description: options.description,
      properties: options.properties,
      appProperties: options.appProperties,
    };

    // Use multipart upload for files with metadata
    const boundary = "-------314159265358979323846";
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    // Convert content to base64 if it's a Buffer or Blob
    let contentData: string;
    if (Buffer.isBuffer(options.content)) {
      contentData = options.content.toString("base64");
    } else if (options.content instanceof Blob) {
      const arrayBuffer = await options.content.arrayBuffer();
      contentData = Buffer.from(arrayBuffer).toString("base64");
    } else {
      contentData = Buffer.from(options.content).toString("base64");
    }

    const multipartRequestBody =
      delimiter +
      "Content-Type: application/json\r\n\r\n" +
      JSON.stringify(metadata) +
      delimiter +
      `Content-Type: ${options.mimeType}\r\n` +
      "Content-Transfer-Encoding: base64\r\n\r\n" +
      contentData +
      closeDelimiter;

    return this.request<DriveFile>("POST", "/files?uploadType=multipart", {
      isUpload: true,
      body: multipartRequestBody,
      headers: {
        "Content-Type": `multipart/related; boundary="${boundary}"`,
      },
    });
  }

  /**
   * Download file content
   *
   * @param fileId - The file ID
   * @returns File content as ArrayBuffer
   *
   * @example
   * ```typescript
   * const content = await client.downloadFile(fileId);
   * const buffer = Buffer.from(content);
   * ```
   */
  async downloadFile(fileId: string): Promise<ArrayBuffer> {
    return this.request<ArrayBuffer>("GET", `/files/${fileId}`, {
      query: { alt: "media" },
    });
  }

  // ============================================
  // FOLDER OPERATIONS
  // ============================================

  /**
   * Create a folder in Google Drive
   *
   * @param options - Folder creation options
   * @returns Created folder metadata
   *
   * @example
   * ```typescript
   * const folder = await client.createFolder({
   *   name: 'My Documents',
   *   parents: [parentFolderId],
   * });
   * ```
   */
  async createFolder(options: DriveCreateFolderOptions): Promise<DriveFolder> {
    const metadata = {
      name: options.name,
      mimeType: "application/vnd.google-apps.folder",
      parents: options.parents,
      description: options.description,
      properties: options.properties,
    };

    return this.request<DriveFolder>("POST", "/files", {
      body: metadata,
    });
  }

  /**
   * List files in a folder
   *
   * @param folderId - The folder ID
   * @param options - Additional list options
   * @returns List of files in the folder
   */
  async listFilesInFolder(
    folderId: string,
    options: Omit<DriveListOptions, "q"> = {}
  ): Promise<DriveFileListResponse> {
    return this.listFiles({
      ...options,
      q: `'${folderId}' in parents and trashed = false`,
    });
  }

  /**
   * Find or create a folder by name in a parent folder
   *
   * @param name - Folder name
   * @param parentId - Parent folder ID (optional, defaults to root)
   * @returns Existing or newly created folder
   */
  async findOrCreateFolder(name: string, parentId?: string): Promise<DriveFolder> {
    // Search for existing folder
    const searchQuery: DriveSearchQuery = {
      name,
      mimeType: "application/vnd.google-apps.folder",
      trashed: false,
    };

    if (parentId) {
      searchQuery.parents = [parentId];
    }

    const results = await this.searchFiles(searchQuery, { pageSize: 1 });

    if (results.files.length > 0) {
      return results.files[0] as DriveFolder;
    }

    // Create new folder
    return this.createFolder({
      name,
      parents: parentId ? [parentId] : undefined,
    });
  }

  // ============================================
  // FILE OPERATIONS
  // ============================================

  /**
   * Delete a file (move to trash)
   *
   * @param fileId - The file ID
   */
  async deleteFile(fileId: string): Promise<void> {
    await this.request<void>("DELETE", `/files/${fileId}`);
  }

  /**
   * Update file metadata
   *
   * @param fileId - The file ID
   * @param metadata - Metadata to update
   * @returns Updated file metadata
   */
  async updateFile(
    fileId: string,
    metadata: Partial<Pick<DriveFile, "name" | "properties" | "appProperties">>
  ): Promise<DriveFile> {
    return this.request<DriveFile>("PATCH", `/files/${fileId}`, {
      body: metadata,
    });
  }

  /**
   * Copy a file
   *
   * @param fileId - The file ID to copy
   * @param name - Name for the copy
   * @param parents - Parent folder IDs for the copy
   * @returns Copied file metadata
   */
  async copyFile(fileId: string, name: string, parents?: string[]): Promise<DriveFile> {
    return this.request<DriveFile>("POST", `/files/${fileId}/copy`, {
      body: {
        name,
        parents,
      },
    });
  }
}

// ============================================
// FACTORY FUNCTION
// ============================================

/**
 * Create a Google Drive client from stored tokens
 *
 * @param tokens - Stored OAuth tokens
 * @param onTokenRefresh - Callback when tokens are refreshed
 * @returns Configured Google Drive client
 *
 * @example
 * ```typescript
 * const tokens = await getStoredTokens(userId);
 * const client = createGoogleDriveClient(tokens, async (newTokens) => {
 *   await saveTokens(userId, newTokens);
 * });
 * ```
 */
export function createGoogleDriveClient(
  tokens: GoogleDriveTokens,
  onTokenRefresh?: (tokens: GoogleDriveTokens) => Promise<void>
): GoogleDriveClient {
  const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri =
    process.env.GOOGLE_DRIVE_REDIRECT_URI ||
    `${process.env.NEXTAUTH_URL}/api/integrations/google-drive/callback`;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Google Drive OAuth environment variables are not configured");
  }

  return new GoogleDriveClient({
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    tokenExpiresAt: tokens.expiresAt,
    oauthConfig: {
      clientId,
      clientSecret,
      redirectUri,
    },
    onTokenRefresh,
  });
}

// ============================================
// EXPORTS
// ============================================

export type {
  GoogleDriveClientConfig,
  GoogleDriveRequestOptions,
  DriveFile,
  DriveFolder,
  DriveFileListResponse,
  DriveListOptions,
  DriveUploadOptions,
  DriveCreateFolderOptions,
  DriveSearchQuery,
} from "./types";
