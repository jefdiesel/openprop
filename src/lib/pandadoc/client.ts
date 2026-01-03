/**
 * PandaDoc API Client
 *
 * Production-ready client for PandaDoc API with:
 * - OAuth2 authentication with automatic token refresh
 * - Rate limiting with exponential backoff
 * - Comprehensive error handling
 * - Full TypeScript support
 */

import type {
  PandaDocClientConfig,
  PandaDocRequestOptions,
  PandaDocTokens,
  PandaDocApiError,
  PandaDocListResponse,
  PandaDocTemplateListItem,
  PandaDocTemplate,
  PandaDocDocumentListItem,
  PandaDocDocument,
  PandaDocDocumentDetails,
  PandaDocDocumentContent,
  PandaDocDocumentStatus,
  PandaDocFolder,
  PandaDocFolderListResponse,
  PandaDocDownloadOptions,
  PandaDocCreateDocumentFromTemplate,
  PandaDocCreateDocumentResponse,
  PandaDocSendDocumentRequest,
  PandaDocSendDocumentResponse,
  PandaDocUser,
  PandaDocContact,
  PandaDocContentLibraryItem,
} from "./types";
import { refreshAccessToken, isTokenExpired, PandaDocAuthError } from "./auth";

// ============================================
// CONSTANTS
// ============================================

const DEFAULT_BASE_URL = "https://api.pandadoc.com/public/v1";
const DEFAULT_TIMEOUT = 30000; // 30 seconds
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_INITIAL_RETRY_DELAY = 1000; // 1 second

// Rate limit constants
const RATE_LIMIT_STATUS_CODE = 429;
const SERVER_ERROR_MIN = 500;
const SERVER_ERROR_MAX = 599;

// ============================================
// ERROR CLASSES
// ============================================

/**
 * Base error class for PandaDoc API errors
 */
export class PandaDocError extends Error {
  public readonly statusCode: number;
  public readonly errorType?: string;
  public readonly errors?: Array<{ field: string; message: string }>;

  constructor(
    message: string,
    statusCode: number,
    errorType?: string,
    errors?: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.name = "PandaDocError";
    this.statusCode = statusCode;
    this.errorType = errorType;
    this.errors = errors;
  }

  static fromApiError(error: PandaDocApiError, statusCode: number): PandaDocError {
    return new PandaDocError(error.detail, statusCode, error.type, error.errors);
  }
}

/**
 * Error thrown when rate limited
 */
export class PandaDocRateLimitError extends PandaDocError {
  public readonly retryAfter: number;

  constructor(message: string, retryAfter: number) {
    super(message, RATE_LIMIT_STATUS_CODE);
    this.name = "PandaDocRateLimitError";
    this.retryAfter = retryAfter;
  }
}

/**
 * Error thrown when document is not yet ready (e.g., still processing)
 */
export class PandaDocDocumentNotReadyError extends PandaDocError {
  constructor(documentId: string) {
    super(
      `Document ${documentId} is not ready yet. It may still be processing.`,
      202
    );
    this.name = "PandaDocDocumentNotReadyError";
  }
}

// ============================================
// CLIENT CLASS
// ============================================

/**
 * PandaDoc API Client
 *
 * @example
 * ```typescript
 * const client = new PandaDocClient({
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
 * const templates = await client.listTemplates(1, 25);
 * ```
 */
export class PandaDocClient {
  private accessToken?: string;
  private apiKey?: string;
  private refreshToken?: string;
  private tokenExpiresAt?: Date;
  private readonly config: Required<
    Pick<PandaDocClientConfig, "baseUrl" | "timeout" | "maxRetries" | "initialRetryDelay">
  > &
    Pick<PandaDocClientConfig, "oauthConfig" | "onTokenRefresh">;

  constructor(config: PandaDocClientConfig) {
    if (!config.accessToken && !config.apiKey) {
      throw new Error("Either accessToken or apiKey must be provided");
    }
    this.accessToken = config.accessToken;
    this.apiKey = config.apiKey;
    this.refreshToken = config.refreshToken;
    this.tokenExpiresAt = config.tokenExpiresAt;
    this.config = {
      baseUrl: config.baseUrl ?? DEFAULT_BASE_URL,
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
  public updateTokens(tokens: PandaDocTokens): void {
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
      if (error instanceof PandaDocAuthError && error.requiresReauthorization) {
        throw error; // Re-throw auth errors that need user action
      }
      // Log but don't throw for other refresh errors - let the request proceed
      // and fail with proper API error if token is actually invalid
      console.warn("Failed to refresh PandaDoc token:", error);
    }
  }

  // ============================================
  // HTTP REQUEST HANDLING
  // ============================================

  /**
   * Make an authenticated API request with retry logic
   */
  private async request<T>(
    method: string,
    path: string,
    options: PandaDocRequestOptions & {
      body?: unknown;
      query?: Record<string, string | number | undefined>;
    } = {}
  ): Promise<T> {
    await this.ensureValidToken();

    const url = this.buildUrl(path, options.query);
    const timeout = options.timeout ?? this.config.timeout;

    let lastError: Error | null = null;
    let retryCount = 0;
    const maxRetries = options.skipRetry ? 0 : this.config.maxRetries;

    while (retryCount <= maxRetries) {
      try {
        const response = await this.makeRequest(method, url, timeout, options);
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
   * Build URL with query parameters
   */
  private buildUrl(
    path: string,
    query?: Record<string, string | number | undefined>
  ): string {
    const url = new URL(`${this.config.baseUrl}${path}`);

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
   * Get the authorization header value
   */
  private getAuthorizationHeader(): string {
    if (this.apiKey) {
      return `API-Key ${this.apiKey}`;
    }
    return `Bearer ${this.accessToken}`;
  }

  /**
   * Make the actual HTTP request
   */
  private async makeRequest(
    method: string,
    url: string,
    timeout: number,
    options: PandaDocRequestOptions & { body?: unknown }
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const headers: Record<string, string> = {
        Authorization: this.getAuthorizationHeader(),
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options.headers,
      };

      const response = await fetch(url, {
        method,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
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
      throw new PandaDocRateLimitError(
        `Rate limited. Retry after ${retryAfter} seconds.`,
        retryAfter
      );
    }

    // Handle document not ready (202 Accepted)
    if (response.status === 202) {
      const data = await response.json();
      if (data.id) {
        throw new PandaDocDocumentNotReadyError(data.id);
      }
      return data as T;
    }

    // Handle no content
    if (response.status === 204) {
      return undefined as T;
    }

    // Handle errors
    if (!response.ok) {
      let errorData: PandaDocApiError;
      try {
        errorData = await response.json();
      } catch {
        errorData = {
          type: "unknown_error",
          detail: `HTTP ${response.status}: ${response.statusText}`,
        };
      }
      throw PandaDocError.fromApiError(errorData, response.status);
    }

    // Check content type for binary responses
    const contentType = response.headers.get("Content-Type") ?? "";
    if (contentType.includes("application/pdf") || contentType.includes("application/octet-stream")) {
      return response.arrayBuffer() as Promise<T>;
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
    if (error instanceof PandaDocRateLimitError) {
      return true;
    }

    // Retry on server errors
    if (error instanceof PandaDocError) {
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
    if (error instanceof PandaDocRateLimitError) {
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
  // TEMPLATE ENDPOINTS
  // ============================================

  /**
   * List all templates
   *
   * @param page - Page number (1-indexed)
   * @param count - Number of items per page (max 100)
   * @param options - Request options
   * @returns List of templates
   *
   * @example
   * ```typescript
   * const templates = await client.listTemplates(1, 25);
   * for (const template of templates.results) {
   *   console.log(template.name, template.id);
   * }
   * ```
   */
  async listTemplates(
    page: number = 1,
    count: number = 25,
    options?: PandaDocRequestOptions
  ): Promise<PandaDocListResponse<PandaDocTemplateListItem>> {
    return this.request<PandaDocListResponse<PandaDocTemplateListItem>>(
      "GET",
      "/templates",
      {
        ...options,
        query: { page, count },
      }
    );
  }

  /**
   * Get template details with content
   *
   * @param id - Template ID
   * @param options - Request options
   * @returns Template with full details
   *
   * @example
   * ```typescript
   * const template = await client.getTemplate('abc123');
   * console.log(template.fields);
   * console.log(template.roles);
   * ```
   */
  async getTemplate(
    id: string,
    options?: PandaDocRequestOptions
  ): Promise<PandaDocTemplate> {
    return this.request<PandaDocTemplate>("GET", `/templates/${id}/details`, options);
  }

  // ============================================
  // DOCUMENT ENDPOINTS
  // ============================================

  /**
   * List all documents
   *
   * @param page - Page number (1-indexed)
   * @param count - Number of items per page (max 100)
   * @param status - Filter by document status
   * @param options - Request options
   * @returns List of documents
   *
   * @example
   * ```typescript
   * // List all completed documents
   * const docs = await client.listDocuments(1, 25, 'document.completed');
   *
   * // List all documents
   * const allDocs = await client.listDocuments(1, 50);
   * ```
   */
  async listDocuments(
    page: number = 1,
    count: number = 25,
    status?: PandaDocDocumentStatus,
    options?: PandaDocRequestOptions
  ): Promise<PandaDocListResponse<PandaDocDocumentListItem>> {
    return this.request<PandaDocListResponse<PandaDocDocumentListItem>>(
      "GET",
      "/documents",
      {
        ...options,
        query: {
          page,
          count,
          status: status?.replace("document.", ""), // API expects status without prefix
        },
      }
    );
  }

  /**
   * Get document with full content
   *
   * @param id - Document ID
   * @param options - Request options
   * @returns Document with recipients, fields, tokens
   *
   * @example
   * ```typescript
   * const doc = await client.getDocument('abc123');
   * console.log(doc.recipients);
   * console.log(doc.status);
   * ```
   */
  async getDocument(
    id: string,
    options?: PandaDocRequestOptions
  ): Promise<PandaDocDocument> {
    return this.request<PandaDocDocument>("GET", `/documents/${id}`, options);
  }

  /**
   * Get document details (more comprehensive than getDocument)
   *
   * @param id - Document ID
   * @param options - Request options
   * @returns Document details including pricing tables
   */
  async getDocumentDetails(
    id: string,
    options?: PandaDocRequestOptions
  ): Promise<PandaDocDocumentDetails> {
    return this.request<PandaDocDocumentDetails>(
      "GET",
      `/documents/${id}/details`,
      options
    );
  }

  /**
   * Get document content/fields
   *
   * @param id - Document ID
   * @param options - Request options
   * @returns Document content with pages and blocks
   *
   * @example
   * ```typescript
   * const content = await client.getDocumentContent('abc123');
   * for (const page of content.pages) {
   *   console.log(`Page ${page.number}: ${page.blocks.length} blocks`);
   * }
   * ```
   */
  async getDocumentContent(
    id: string,
    options?: PandaDocRequestOptions
  ): Promise<PandaDocDocumentContent> {
    return this.request<PandaDocDocumentContent>(
      "GET",
      `/documents/${id}/content`,
      options
    );
  }

  /**
   * Download document as PDF
   *
   * @param id - Document ID
   * @param downloadOptions - Download options
   * @param options - Request options
   * @returns PDF as ArrayBuffer
   *
   * @example
   * ```typescript
   * const pdf = await client.downloadDocument('abc123');
   * // Save to file
   * fs.writeFileSync('document.pdf', Buffer.from(pdf));
   *
   * // Or with certificate
   * const pdfWithCert = await client.downloadDocument('abc123', {
   *   include_certificate: true,
   * });
   * ```
   */
  async downloadDocument(
    id: string,
    downloadOptions?: PandaDocDownloadOptions,
    options?: PandaDocRequestOptions
  ): Promise<ArrayBuffer> {
    const query: Record<string, string | number | undefined> = {};

    if (downloadOptions?.include_certificate) {
      query.include_certificate = 1;
    }
    if (downloadOptions?.watermark !== undefined) {
      query.watermark = downloadOptions.watermark ? 1 : 0;
    }
    if (downloadOptions?.separate_files) {
      query.separate_files = 1;
    }

    return this.request<ArrayBuffer>("GET", `/documents/${id}/download`, {
      ...options,
      query,
      headers: {
        ...options?.headers,
        Accept: "application/pdf",
      },
    });
  }

  /**
   * Get document download link (signed URL)
   *
   * @param id - Document ID
   * @param options - Request options
   * @returns Signed download URL
   */
  async getDocumentDownloadLink(
    id: string,
    options?: PandaDocRequestOptions
  ): Promise<{ link: string }> {
    return this.request<{ link: string }>(
      "GET",
      `/documents/${id}/download-link`,
      options
    );
  }

  // ============================================
  // FOLDER ENDPOINTS
  // ============================================

  /**
   * List all folders
   *
   * @param parentUuid - Parent folder UUID (optional, for nested folders)
   * @param page - Page number (1-indexed)
   * @param count - Number of items per page
   * @param options - Request options
   * @returns List of folders
   *
   * @example
   * ```typescript
   * // List root folders
   * const folders = await client.listFolders();
   *
   * // List subfolders
   * const subfolders = await client.listFolders('parent-uuid');
   * ```
   */
  async listFolders(
    parentUuid?: string,
    page: number = 1,
    count: number = 50,
    options?: PandaDocRequestOptions
  ): Promise<PandaDocFolderListResponse> {
    return this.request<PandaDocFolderListResponse>("GET", "/documents/folders", {
      ...options,
      query: {
        parent_uuid: parentUuid,
        page,
        count,
      },
    });
  }

  /**
   * Get folder tree (recursive helper)
   *
   * @param parentUuid - Parent folder UUID (optional)
   * @param options - Request options
   * @returns Nested folder structure
   */
  async getFolderTree(
    parentUuid?: string,
    options?: PandaDocRequestOptions
  ): Promise<Array<PandaDocFolder & { children: PandaDocFolder[] }>> {
    const response = await this.listFolders(parentUuid, 1, 100, options);
    const folders: Array<PandaDocFolder & { children: PandaDocFolder[] }> = [];

    for (const folder of response.results) {
      const children = await this.getFolderTree(folder.uuid, options);
      folders.push({ ...folder, children });
    }

    return folders;
  }

  // ============================================
  // DOCUMENT CREATION
  // ============================================

  /**
   * Create document from template
   *
   * @param data - Document creation data
   * @param options - Request options
   * @returns Created document
   *
   * @example
   * ```typescript
   * const doc = await client.createDocumentFromTemplate({
   *   name: 'Contract for John Doe',
   *   template_uuid: 'template-id',
   *   recipients: [
   *     { email: 'john@example.com', first_name: 'John', last_name: 'Doe', role: 'Client' }
   *   ],
   *   tokens: [
   *     { name: 'client_name', value: 'John Doe' }
   *   ],
   * });
   * ```
   */
  async createDocumentFromTemplate(
    data: PandaDocCreateDocumentFromTemplate,
    options?: PandaDocRequestOptions
  ): Promise<PandaDocCreateDocumentResponse> {
    return this.request<PandaDocCreateDocumentResponse>("POST", "/documents", {
      ...options,
      body: data,
    });
  }

  /**
   * Send document for signing
   *
   * @param id - Document ID
   * @param sendData - Send options
   * @param options - Request options
   * @returns Updated document
   *
   * @example
   * ```typescript
   * await client.sendDocument('doc-id', {
   *   message: 'Please review and sign this document.',
   *   subject: 'Document Ready for Signature',
   * });
   * ```
   */
  async sendDocument(
    id: string,
    sendData?: PandaDocSendDocumentRequest,
    options?: PandaDocRequestOptions
  ): Promise<PandaDocSendDocumentResponse> {
    return this.request<PandaDocSendDocumentResponse>(
      "POST",
      `/documents/${id}/send`,
      {
        ...options,
        body: sendData ?? {},
      }
    );
  }

  /**
   * Delete a document
   *
   * @param id - Document ID
   * @param options - Request options
   */
  async deleteDocument(id: string, options?: PandaDocRequestOptions): Promise<void> {
    await this.request<void>("DELETE", `/documents/${id}`, options);
  }

  // ============================================
  // USER ENDPOINTS
  // ============================================

  /**
   * Get current user info
   *
   * @param options - Request options
   * @returns Current user details
   */
  async getCurrentUser(options?: PandaDocRequestOptions): Promise<PandaDocUser> {
    return this.request<PandaDocUser>("GET", "/members/current", options);
  }

  // ============================================
  // CONTACT ENDPOINTS
  // ============================================

  /**
   * List all contacts
   *
   * @param page - Page number (1-indexed)
   * @param count - Number of items per page (max 100)
   * @param options - Request options
   * @returns List of contacts
   */
  async listContacts(
    page: number = 1,
    count: number = 50,
    options?: PandaDocRequestOptions
  ): Promise<PandaDocListResponse<PandaDocContact>> {
    return this.request<PandaDocListResponse<PandaDocContact>>(
      "GET",
      "/contacts",
      {
        ...options,
        query: { page, count },
      }
    );
  }

  /**
   * Get a single contact
   *
   * @param id - Contact ID
   * @param options - Request options
   * @returns Contact details
   */
  async getContact(
    id: string,
    options?: PandaDocRequestOptions
  ): Promise<PandaDocContact> {
    return this.request<PandaDocContact>("GET", `/contacts/${id}`, options);
  }

  /**
   * Iterate over all contacts (handles pagination)
   */
  async *iterateContacts(
    pageSize: number = 50
  ): AsyncGenerator<PandaDocContact> {
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await this.listContacts(page, pageSize);
      for (const contact of response.results) {
        yield contact;
      }

      hasMore = response.results.length === pageSize;
      page++;
    }
  }

  // ============================================
  // CONTENT LIBRARY ENDPOINTS
  // ============================================

  /**
   * List all content library items
   *
   * @param page - Page number (1-indexed)
   * @param count - Number of items per page
   * @param options - Request options
   * @returns List of content library items
   */
  async listContentLibraryItems(
    page: number = 1,
    count: number = 50,
    options?: PandaDocRequestOptions
  ): Promise<PandaDocListResponse<PandaDocContentLibraryItem>> {
    return this.request<PandaDocListResponse<PandaDocContentLibraryItem>>(
      "GET",
      "/content-library-items",
      {
        ...options,
        query: { page, count },
      }
    );
  }

  /**
   * Get a single content library item
   *
   * @param id - Content library item ID
   * @param options - Request options
   * @returns Content library item details
   */
  async getContentLibraryItem(
    id: string,
    options?: PandaDocRequestOptions
  ): Promise<PandaDocContentLibraryItem> {
    return this.request<PandaDocContentLibraryItem>(
      "GET",
      `/content-library-items/${id}`,
      options
    );
  }

  /**
   * Iterate over all content library items (handles pagination)
   */
  async *iterateContentLibraryItems(
    pageSize: number = 50
  ): AsyncGenerator<PandaDocContentLibraryItem> {
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await this.listContentLibraryItems(page, pageSize);
      for (const item of response.results) {
        yield item;
      }

      hasMore = response.results.length === pageSize;
      page++;
    }
  }

  /**
   * List template folders
   *
   * @param parentUuid - Parent folder UUID (optional)
   * @param page - Page number
   * @param count - Number of items per page
   * @param options - Request options
   * @returns List of template folders
   */
  async listTemplateFolders(
    parentUuid?: string,
    page: number = 1,
    count: number = 50,
    options?: PandaDocRequestOptions
  ): Promise<PandaDocFolderListResponse> {
    return this.request<PandaDocFolderListResponse>("GET", "/templates/folders", {
      ...options,
      query: {
        parent_uuid: parentUuid,
        page,
        count,
      },
    });
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Wait for document to be ready (not processing)
   *
   * @param id - Document ID
   * @param maxAttempts - Maximum polling attempts
   * @param delayMs - Delay between attempts in milliseconds
   * @returns Document when ready
   */
  async waitForDocument(
    id: string,
    maxAttempts: number = 30,
    delayMs: number = 2000
  ): Promise<PandaDocDocument> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const doc = await this.getDocument(id);
        if (doc.status !== "document.draft") {
          return doc;
        }
        // Document is still processing
        await this.sleep(delayMs);
      } catch (error) {
        if (error instanceof PandaDocDocumentNotReadyError) {
          await this.sleep(delayMs);
          continue;
        }
        throw error;
      }
    }

    throw new Error(`Document ${id} did not become ready after ${maxAttempts} attempts`);
  }

  /**
   * Iterate over all templates (handles pagination)
   *
   * @param pageSize - Number of items per page
   * @yields Template list items
   *
   * @example
   * ```typescript
   * for await (const template of client.iterateTemplates()) {
   *   console.log(template.name);
   * }
   * ```
   */
  async *iterateTemplates(
    pageSize: number = 50
  ): AsyncGenerator<PandaDocTemplateListItem> {
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await this.listTemplates(page, pageSize);
      for (const template of response.results) {
        yield template;
      }

      hasMore = response.results.length === pageSize;
      page++;
    }
  }

  /**
   * Iterate over all documents (handles pagination)
   *
   * @param status - Filter by status
   * @param pageSize - Number of items per page
   * @yields Document list items
   *
   * @example
   * ```typescript
   * for await (const doc of client.iterateDocuments('document.completed')) {
   *   console.log(doc.name, doc.date_completed);
   * }
   * ```
   */
  async *iterateDocuments(
    status?: PandaDocDocumentStatus,
    pageSize: number = 50
  ): AsyncGenerator<PandaDocDocumentListItem> {
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await this.listDocuments(page, pageSize, status);
      for (const doc of response.results) {
        yield doc;
      }

      hasMore = response.results.length === pageSize;
      page++;
    }
  }
}

// ============================================
// FACTORY FUNCTION
// ============================================

/**
 * Create a PandaDoc client from stored tokens
 *
 * @param tokens - Stored OAuth tokens
 * @param onTokenRefresh - Callback when tokens are refreshed
 * @returns Configured PandaDoc client
 *
 * @example
 * ```typescript
 * const tokens = await getStoredTokens(userId);
 * const client = createPandaDocClient(tokens, async (newTokens) => {
 *   await saveTokens(userId, newTokens);
 * });
 * ```
 */
export function createPandaDocClient(
  tokens: PandaDocTokens,
  onTokenRefresh?: (tokens: PandaDocTokens) => Promise<void>
): PandaDocClient {
  const clientId = process.env.PANDADOC_CLIENT_ID;
  const clientSecret = process.env.PANDADOC_CLIENT_SECRET;
  const redirectUri = process.env.PANDADOC_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("PandaDoc OAuth environment variables are not configured");
  }

  return new PandaDocClient({
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

/**
 * Create a PandaDoc client with an API key (simpler authentication)
 *
 * @param apiKey - PandaDoc API key
 * @returns Configured PandaDoc client
 *
 * @example
 * ```typescript
 * const client = createPandaDocClientWithApiKey('your-api-key');
 * const templates = await client.listTemplates();
 * ```
 */
export function createPandaDocClientWithApiKey(apiKey: string): PandaDocClient {
  return new PandaDocClient({
    apiKey,
  });
}

// ============================================
// EXPORTS
// ============================================

export type {
  PandaDocClientConfig,
  PandaDocRequestOptions,
  PandaDocListResponse,
  PandaDocTemplateListItem,
  PandaDocTemplate,
  PandaDocDocumentListItem,
  PandaDocDocument,
  PandaDocDocumentDetails,
  PandaDocDocumentContent,
  PandaDocDocumentStatus,
  PandaDocFolder,
  PandaDocDownloadOptions,
  PandaDocContact,
  PandaDocContentLibraryItem,
} from "./types";
