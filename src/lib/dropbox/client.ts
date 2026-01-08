/**
 * Dropbox API Client
 *
 * Production-ready client for Dropbox API v2 with:
 * - OAuth2 authentication with automatic token refresh
 * - Rate limiting with exponential backoff
 * - Comprehensive error handling
 * - Full TypeScript support
 */

import type {
  DropboxClientConfig,
  DropboxRequestOptions,
  DropboxTokens,
  DropboxApiError,
  DropboxMetadata,
  DropboxFileMetadata,
  DropboxFolderMetadata,
  DropboxListFolderRequest,
  DropboxListFolderResult,
  DropboxUploadRequest,
  DropboxDownloadRequest,
  DropboxDownloadResult,
  DropboxCreateFolderRequest,
  DropboxCreateFolderResult,
  DropboxGetMetadataRequest,
  DropboxAccountInfo,
  DropboxSpaceUsage,
} from "./types";
import { refreshAccessToken, isTokenExpired, DropboxAuthError } from "./auth";

// ============================================
// CONSTANTS
// ============================================

const DROPBOX_API_BASE_URL = "https://api.dropboxapi.com/2";
const DROPBOX_CONTENT_BASE_URL = "https://content.dropboxapi.com/2";
const DEFAULT_TIMEOUT = 30000; // 30 seconds
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_INITIAL_RETRY_DELAY = 1000; // 1 second
const UPLOAD_CHUNK_SIZE = 150 * 1024 * 1024; // 150MB chunks for large files

// Rate limit constants
const RATE_LIMIT_STATUS_CODE = 429;
const SERVER_ERROR_MIN = 500;
const SERVER_ERROR_MAX = 599;

// ============================================
// ERROR CLASSES
// ============================================

/**
 * Base error class for Dropbox API errors
 */
export class DropboxError extends Error {
  public readonly statusCode: number;
  public readonly errorTag?: string;
  public readonly errorSummary?: string;

  constructor(
    message: string,
    statusCode: number,
    errorTag?: string,
    errorSummary?: string
  ) {
    super(message);
    this.name = "DropboxError";
    this.statusCode = statusCode;
    this.errorTag = errorTag;
    this.errorSummary = errorSummary;
  }

  static fromApiError(error: DropboxApiError, statusCode: number): DropboxError {
    return new DropboxError(
      error.error_summary,
      statusCode,
      error.error[".tag"],
      error.error_summary
    );
  }
}

/**
 * Error thrown when rate limited
 */
export class DropboxRateLimitError extends DropboxError {
  public readonly retryAfter: number;

  constructor(message: string, retryAfter: number) {
    super(message, RATE_LIMIT_STATUS_CODE);
    this.name = "DropboxRateLimitError";
    this.retryAfter = retryAfter;
  }
}

// ============================================
// CLIENT CLASS
// ============================================

/**
 * Dropbox API Client
 *
 * @example
 * ```typescript
 * const client = new DropboxClient({
 *   accessToken: 'your-access-token',
 *   refreshToken: 'your-refresh-token',
 *   tokenExpiresAt: new Date('2026-01-01'),
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
 * const files = await client.listFolder('/OpenProposal');
 * ```
 */
export class DropboxClient {
  private accessToken?: string;
  private refreshToken?: string;
  private tokenExpiresAt?: Date;
  private readonly config: Required<
    Pick<DropboxClientConfig, "timeout" | "maxRetries" | "initialRetryDelay">
  > &
    Pick<DropboxClientConfig, "oauthConfig" | "onTokenRefresh">;

  constructor(config: DropboxClientConfig) {
    if (!config.accessToken) {
      throw new Error("accessToken must be provided");
    }
    this.accessToken = config.accessToken;
    this.refreshToken = config.refreshToken;
    this.tokenExpiresAt = config.tokenExpiresAt;
    this.config = {
      timeout: config.timeout ?? DEFAULT_TIMEOUT,
      maxRetries: config.maxRetries ?? DEFAULT_MAX_RETRIES,
      initialRetryDelay: config.initialRetryDelay ?? DEFAULT_INITIAL_RETRY_DELAY,
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
  public updateTokens(tokens: DropboxTokens): void {
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
    this.tokenExpiresAt = tokens.expiresAt;
  }

  /**
   * Get current access token
   */
  public getAccessToken(): string | undefined {
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
      if (error instanceof DropboxAuthError && error.requiresReauthorization) {
        throw error; // Re-throw auth errors that need user action
      }
      // Log but don't throw for other refresh errors
      console.warn("Failed to refresh Dropbox token:", error);
    }
  }

  // ============================================
  // HTTP REQUEST HANDLING
  // ============================================

  /**
   * Make an authenticated API request with retry logic
   */
  private async request<T>(
    endpoint: string,
    options: DropboxRequestOptions & {
      body?: unknown;
      contentType?: "json" | "octet-stream";
      apiArg?: unknown;
      useContentApi?: boolean;
    } = {}
  ): Promise<T> {
    await this.ensureValidToken();

    const baseUrl = options.useContentApi ? DROPBOX_CONTENT_BASE_URL : DROPBOX_API_BASE_URL;
    const url = `${baseUrl}${endpoint}`;
    const timeout = options.timeout ?? this.config.timeout;

    let lastError: Error | null = null;
    let retryCount = 0;
    const maxRetries = options.skipRetry ? 0 : this.config.maxRetries;

    while (retryCount <= maxRetries) {
      try {
        const response = await this.makeRequest(url, timeout, options);
        return await this.handleResponse<T>(response);
      } catch (error) {
        lastError = error as Error;

        if (!this.shouldRetry(error as Error, retryCount, maxRetries)) {
          throw error;
        }

        const delay = this.calculateRetryDelay(error as Error, retryCount);
        await this.sleep(delay);
        retryCount++;
      }
    }

    throw lastError;
  }

  /**
   * Make the actual HTTP request
   */
  private async makeRequest(
    url: string,
    timeout: number,
    options: DropboxRequestOptions & {
      body?: unknown;
      contentType?: "json" | "octet-stream";
      apiArg?: unknown;
    }
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${this.accessToken}`,
        ...options.headers,
      };

      // For RPC-style endpoints
      if (options.contentType === "json" || !options.contentType) {
        headers["Content-Type"] = "application/json";
      }

      // For content endpoints with Dropbox-API-Arg header
      if (options.apiArg) {
        headers["Dropbox-API-Arg"] = JSON.stringify(options.apiArg);
      }

      // For file uploads
      if (options.contentType === "octet-stream") {
        headers["Content-Type"] = "application/octet-stream";
      }

      let body: BodyInit | undefined;
      if (options.body) {
        if (options.contentType === "octet-stream") {
          body = options.body as BodyInit;
        } else {
          body = JSON.stringify(options.body);
        }
      }

      const response = await fetch(url, {
        method: "POST",
        headers,
        body,
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
    // Handle rate limiting
    if (response.status === RATE_LIMIT_STATUS_CODE) {
      const retryAfter = parseInt(response.headers.get("Retry-After") ?? "60", 10);
      throw new DropboxRateLimitError(
        `Rate limited. Retry after ${retryAfter} seconds.`,
        retryAfter
      );
    }

    // Handle errors
    if (!response.ok) {
      let errorData: DropboxApiError;
      try {
        errorData = await response.json();
      } catch {
        errorData = {
          error_summary: `HTTP ${response.status}: ${response.statusText}`,
          error: { ".tag": "unknown_error" },
        };
      }
      throw DropboxError.fromApiError(errorData, response.status);
    }

    // Check content type for binary responses
    const contentType = response.headers.get("Content-Type") ?? "";
    if (contentType.includes("application/octet-stream")) {
      // For download endpoints, parse the metadata from header
      const metadataHeader = response.headers.get("Dropbox-API-Result");
      const metadata = metadataHeader ? JSON.parse(metadataHeader) : null;
      const fileBinary = await response.arrayBuffer();
      return { metadata, fileBinary } as T;
    }

    return response.json();
  }

  /**
   * Determine if request should be retried
   */
  private shouldRetry(error: Error, retryCount: number, maxRetries: number): boolean {
    if (retryCount >= maxRetries) {
      return false;
    }

    // Retry on rate limit
    if (error instanceof DropboxRateLimitError) {
      return true;
    }

    // Retry on server errors
    if (error instanceof DropboxError) {
      return error.statusCode >= SERVER_ERROR_MIN && error.statusCode <= SERVER_ERROR_MAX;
    }

    // Retry on network errors
    if (error.name === "TypeError" || error.name === "AbortError") {
      return true;
    }

    return false;
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  private calculateRetryDelay(error: Error, retryCount: number): number {
    // Use Retry-After header if available
    if (error instanceof DropboxRateLimitError) {
      return error.retryAfter * 1000;
    }

    // Exponential backoff with jitter
    const baseDelay = this.config.initialRetryDelay * Math.pow(2, retryCount);
    const jitter = Math.random() * 0.3 * baseDelay; // 0-30% jitter
    return Math.min(baseDelay + jitter, 60000); // Cap at 60 seconds
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ============================================
  // FILE/FOLDER OPERATIONS
  // ============================================

  /**
   * List folder contents
   *
   * @param path - Path to the folder (use "" for root)
   * @param recursive - Whether to list subfolders recursively
   * @param options - Request options
   * @returns List of files and folders
   *
   * @example
   * ```typescript
   * const result = await client.listFolder('/OpenProposal');
   * for (const entry of result.entries) {
   *   console.log(entry.name, entry['.tag']);
   * }
   * ```
   */
  async listFolder(
    path: string,
    recursive: boolean = false,
    options?: DropboxRequestOptions
  ): Promise<DropboxListFolderResult> {
    const request: DropboxListFolderRequest = {
      path: path === "/" ? "" : path,
      recursive,
      include_deleted: false,
      include_mounted_folders: true,
    };

    return this.request<DropboxListFolderResult>(
      "/files/list_folder",
      {
        ...options,
        body: request,
      }
    );
  }

  /**
   * Get file or folder metadata
   *
   * @param path - Path to the file or folder
   * @param options - Request options
   * @returns File or folder metadata
   *
   * @example
   * ```typescript
   * const metadata = await client.getMetadata('/OpenProposal/invoice.pdf');
   * if (metadata['.tag'] === 'file') {
   *   console.log('File size:', metadata.size);
   * }
   * ```
   */
  async getMetadata(
    path: string,
    options?: DropboxRequestOptions
  ): Promise<DropboxMetadata> {
    const request: DropboxGetMetadataRequest = {
      path,
      include_deleted: false,
    };

    return this.request<DropboxMetadata>(
      "/files/get_metadata",
      {
        ...options,
        body: request,
      }
    );
  }

  /**
   * Upload a file to Dropbox
   *
   * @param path - Destination path (e.g., '/OpenProposal/file.pdf')
   * @param content - File content as Buffer or ArrayBuffer
   * @param mode - Write mode (add, overwrite, or update)
   * @param options - Request options
   * @returns Uploaded file metadata
   *
   * @example
   * ```typescript
   * const metadata = await client.uploadFile(
   *   '/OpenProposal/signed.pdf',
   *   pdfBuffer,
   *   { '.tag': 'overwrite' }
   * );
   * ```
   */
  async uploadFile(
    path: string,
    content: Buffer | ArrayBuffer,
    mode: DropboxUploadRequest["mode"] = { ".tag": "add" },
    options?: DropboxRequestOptions
  ): Promise<DropboxFileMetadata> {
    const request: DropboxUploadRequest = {
      path,
      mode,
      autorename: false,
      mute: false,
    };

    return this.request<DropboxFileMetadata>(
      "/files/upload",
      {
        ...options,
        apiArg: request,
        body: content,
        contentType: "octet-stream",
        useContentApi: true,
      }
    );
  }

  /**
   * Download a file from Dropbox
   *
   * @param path - Path to the file
   * @param options - Request options
   * @returns File metadata and binary content
   *
   * @example
   * ```typescript
   * const { metadata, fileBinary } = await client.downloadFile('/OpenProposal/file.pdf');
   * fs.writeFileSync('local-file.pdf', Buffer.from(fileBinary));
   * ```
   */
  async downloadFile(
    path: string,
    options?: DropboxRequestOptions
  ): Promise<DropboxDownloadResult> {
    const request: DropboxDownloadRequest = {
      path,
    };

    return this.request<DropboxDownloadResult>(
      "/files/download",
      {
        ...options,
        apiArg: request,
        useContentApi: true,
      }
    );
  }

  /**
   * Create a folder
   *
   * @param path - Path to the new folder
   * @param autorename - Whether to auto-rename if folder exists
   * @param options - Request options
   * @returns Created folder metadata
   *
   * @example
   * ```typescript
   * const folder = await client.createFolder('/OpenProposal/2026');
   * console.log('Created folder:', folder.metadata.path_display);
   * ```
   */
  async createFolder(
    path: string,
    autorename: boolean = false,
    options?: DropboxRequestOptions
  ): Promise<DropboxCreateFolderResult> {
    const request: DropboxCreateFolderRequest = {
      path,
      autorename,
    };

    return this.request<DropboxCreateFolderResult>(
      "/files/create_folder_v2",
      {
        ...options,
        body: request,
      }
    );
  }

  /**
   * Delete a file or folder
   *
   * @param path - Path to delete
   * @param options - Request options
   * @returns Deleted item metadata
   */
  async delete(
    path: string,
    options?: DropboxRequestOptions
  ): Promise<DropboxMetadata> {
    return this.request<DropboxMetadata>(
      "/files/delete_v2",
      {
        ...options,
        body: { path },
      }
    );
  }

  // ============================================
  // ACCOUNT OPERATIONS
  // ============================================

  /**
   * Get current account information
   *
   * @param options - Request options
   * @returns Account info
   *
   * @example
   * ```typescript
   * const account = await client.getCurrentAccount();
   * console.log('Email:', account.email);
   * console.log('Name:', account.name.display_name);
   * ```
   */
  async getCurrentAccount(options?: DropboxRequestOptions): Promise<DropboxAccountInfo> {
    return this.request<DropboxAccountInfo>(
      "/users/get_current_account",
      {
        ...options,
        body: null,
      }
    );
  }

  /**
   * Get space usage information
   *
   * @param options - Request options
   * @returns Space usage info
   */
  async getSpaceUsage(options?: DropboxRequestOptions): Promise<DropboxSpaceUsage> {
    return this.request<DropboxSpaceUsage>(
      "/users/get_space_usage",
      {
        ...options,
        body: null,
      }
    );
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Check if a path exists
   *
   * @param path - Path to check
   * @returns True if path exists
   */
  async pathExists(path: string): Promise<boolean> {
    try {
      await this.getMetadata(path);
      return true;
    } catch (error) {
      if (error instanceof DropboxError && error.errorTag === "path") {
        return false;
      }
      throw error;
    }
  }

  /**
   * Ensure a folder exists (create if it doesn't)
   *
   * @param path - Folder path
   * @returns Folder metadata
   */
  async ensureFolderExists(path: string): Promise<DropboxFolderMetadata> {
    try {
      const metadata = await this.getMetadata(path);
      if (metadata[".tag"] === "folder") {
        return metadata;
      }
      throw new Error(`Path ${path} exists but is not a folder`);
    } catch (error) {
      if (error instanceof DropboxError && error.errorTag === "path") {
        const result = await this.createFolder(path);
        return result.metadata;
      }
      throw error;
    }
  }
}

// ============================================
// FACTORY FUNCTION
// ============================================

/**
 * Create a Dropbox client from stored tokens
 *
 * @param tokens - Stored OAuth tokens
 * @param onTokenRefresh - Callback when tokens are refreshed
 * @returns Configured Dropbox client
 *
 * @example
 * ```typescript
 * const tokens = await getStoredTokens(userId);
 * const client = createDropboxClient(tokens, async (newTokens) => {
 *   await saveTokens(userId, newTokens);
 * });
 * ```
 */
export function createDropboxClient(
  tokens: DropboxTokens,
  onTokenRefresh?: (tokens: DropboxTokens) => Promise<void>
): DropboxClient {
  const clientId = process.env.DROPBOX_CLIENT_ID;
  const clientSecret = process.env.DROPBOX_CLIENT_SECRET;
  const redirectUri = process.env.DROPBOX_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Dropbox OAuth environment variables are not configured");
  }

  return new DropboxClient({
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
  DropboxClientConfig,
  DropboxRequestOptions,
  DropboxMetadata,
  DropboxFileMetadata,
  DropboxFolderMetadata,
  DropboxListFolderResult,
  DropboxAccountInfo,
  DropboxSpaceUsage,
} from "./types";
