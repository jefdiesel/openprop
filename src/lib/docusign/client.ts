/**
 * DocuSign API Client
 *
 * Production-ready client for DocuSign eSignature REST API with:
 * - OAuth2 authentication with automatic token refresh
 * - Rate limiting with exponential backoff
 * - Comprehensive error handling
 * - Full TypeScript support
 */

import type {
  DocuSignClientConfig,
  DocuSignRequestOptions,
  DocuSignTokens,
  DocuSignApiError,
  DocuSignTemplateListResponse,
  DocuSignTemplate,
  DocuSignEnvelopeListResponse,
  DocuSignEnvelope,
  DocuSignCreateEnvelopeRequest,
  DocuSignCreateEnvelopeResponse,
  DocuSignEnvelopeStatus,
} from "./types";
import { refreshAccessToken, isTokenExpired, DocuSignAuthError } from "./auth";

// ============================================
// CONSTANTS
// ============================================

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
 * Base error class for DocuSign API errors
 */
export class DocuSignError extends Error {
  public readonly statusCode: number;
  public readonly errorCode?: string;

  constructor(message: string, statusCode: number, errorCode?: string) {
    super(message);
    this.name = "DocuSignError";
    this.statusCode = statusCode;
    this.errorCode = errorCode;
  }

  static fromApiError(error: DocuSignApiError, statusCode: number): DocuSignError {
    return new DocuSignError(error.message, statusCode, error.errorCode);
  }
}

/**
 * Error thrown when rate limited
 */
export class DocuSignRateLimitError extends DocuSignError {
  public readonly retryAfter: number;

  constructor(message: string, retryAfter: number) {
    super(message, RATE_LIMIT_STATUS_CODE);
    this.name = "DocuSignRateLimitError";
    this.retryAfter = retryAfter;
  }
}

// ============================================
// CLIENT CLASS
// ============================================

/**
 * DocuSign API Client
 *
 * @example
 * ```typescript
 * const client = new DocuSignClient({
 *   accessToken: 'your-access-token',
 *   refreshToken: 'your-refresh-token',
 *   tokenExpiresAt: new Date('2024-01-01'),
 *   accountId: 'account-id',
 *   baseUri: 'https://demo.docusign.net/restapi',
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
 * const templates = await client.listTemplates();
 * ```
 */
export class DocuSignClient {
  private accessToken?: string;
  private refreshToken?: string;
  private tokenExpiresAt?: Date;
  private readonly accountId: string;
  private readonly baseUri: string;
  private readonly config: Required<
    Pick<DocuSignClientConfig, "timeout" | "maxRetries" | "initialRetryDelay">
  > &
    Pick<DocuSignClientConfig, "oauthConfig" | "onTokenRefresh">;

  constructor(config: DocuSignClientConfig) {
    if (!config.accessToken) {
      throw new Error("accessToken must be provided");
    }
    if (!config.accountId) {
      throw new Error("accountId must be provided");
    }
    if (!config.baseUri) {
      throw new Error("baseUri must be provided");
    }

    this.accessToken = config.accessToken;
    this.refreshToken = config.refreshToken;
    this.tokenExpiresAt = config.tokenExpiresAt;
    this.accountId = config.accountId;
    this.baseUri = config.baseUri.replace(/\/$/, ""); // Remove trailing slash
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
  public updateTokens(tokens: DocuSignTokens): void {
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
      if (error instanceof DocuSignAuthError && error.requiresReauthorization) {
        throw error; // Re-throw auth errors that need user action
      }
      // Log but don't throw for other refresh errors - let the request proceed
      // and fail with proper API error if token is actually invalid
      console.warn("Failed to refresh DocuSign token:", error);
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
    options: DocuSignRequestOptions & {
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
    // Build full path including account ID
    const fullPath = path.startsWith("/")
      ? `/v2.1/accounts/${this.accountId}${path}`
      : `/v2.1/accounts/${this.accountId}/${path}`;

    const url = new URL(`${this.baseUri}${fullPath}`);

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
    options: DocuSignRequestOptions & { body?: unknown }
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${this.accessToken}`,
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
      throw new DocuSignRateLimitError(
        `Rate limited. Retry after ${retryAfter} seconds.`,
        retryAfter
      );
    }

    // Handle no content
    if (response.status === 204) {
      return undefined as T;
    }

    // Handle errors
    if (!response.ok) {
      let errorData: DocuSignApiError;
      try {
        errorData = await response.json();
      } catch {
        errorData = {
          errorCode: "UNKNOWN_ERROR",
          message: `HTTP ${response.status}: ${response.statusText}`,
        };
      }
      throw DocuSignError.fromApiError(errorData, response.status);
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
    if (error instanceof DocuSignRateLimitError) {
      return true;
    }

    // Retry on server errors
    if (error instanceof DocuSignError) {
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
    if (error instanceof DocuSignRateLimitError) {
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
   * @param startPosition - Starting position (0-indexed)
   * @param count - Number of items to return (max 100)
   * @param options - Request options
   * @returns List of templates
   *
   * @example
   * ```typescript
   * const response = await client.listTemplates(0, 25);
   * for (const template of response.envelopeTemplates) {
   *   console.log(template.name, template.templateId);
   * }
   * ```
   */
  async listTemplates(
    startPosition: number = 0,
    count: number = 25,
    options?: DocuSignRequestOptions
  ): Promise<DocuSignTemplateListResponse> {
    return this.request<DocuSignTemplateListResponse>(
      "GET",
      "/templates",
      {
        ...options,
        query: {
          start_position: startPosition,
          count,
        },
      }
    );
  }

  /**
   * Get template details
   *
   * @param templateId - Template ID
   * @param options - Request options
   * @returns Template with full details
   *
   * @example
   * ```typescript
   * const template = await client.getTemplate('abc123');
   * console.log(template.recipients);
   * console.log(template.documents);
   * ```
   */
  async getTemplate(
    templateId: string,
    options?: DocuSignRequestOptions
  ): Promise<DocuSignTemplate> {
    return this.request<DocuSignTemplate>("GET", `/templates/${templateId}`, options);
  }

  // ============================================
  // ENVELOPE ENDPOINTS
  // ============================================

  /**
   * List all envelopes
   *
   * @param fromDate - Filter by created date (ISO 8601 format)
   * @param startPosition - Starting position (0-indexed)
   * @param count - Number of items to return (max 100)
   * @param status - Filter by envelope status
   * @param options - Request options
   * @returns List of envelopes
   *
   * @example
   * ```typescript
   * // List all sent envelopes from the last 30 days
   * const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
   * const response = await client.listEnvelopes(thirtyDaysAgo.toISOString(), 0, 25, 'sent');
   * ```
   */
  async listEnvelopes(
    fromDate?: string,
    startPosition: number = 0,
    count: number = 25,
    status?: DocuSignEnvelopeStatus,
    options?: DocuSignRequestOptions
  ): Promise<DocuSignEnvelopeListResponse> {
    const query: Record<string, string | number | undefined> = {
      start_position: startPosition,
      count,
    };

    if (fromDate) {
      query.from_date = fromDate;
    }

    if (status) {
      query.status = status;
    }

    return this.request<DocuSignEnvelopeListResponse>(
      "GET",
      "/envelopes",
      {
        ...options,
        query,
      }
    );
  }

  /**
   * Get envelope details
   *
   * @param envelopeId - Envelope ID
   * @param options - Request options
   * @returns Envelope with full details
   *
   * @example
   * ```typescript
   * const envelope = await client.getEnvelope('abc123');
   * console.log(envelope.recipients);
   * console.log(envelope.status);
   * ```
   */
  async getEnvelope(
    envelopeId: string,
    options?: DocuSignRequestOptions
  ): Promise<DocuSignEnvelope> {
    return this.request<DocuSignEnvelope>("GET", `/envelopes/${envelopeId}`, options);
  }

  /**
   * Create and send an envelope
   *
   * @param request - Envelope creation request
   * @param options - Request options
   * @returns Created envelope
   *
   * @example
   * ```typescript
   * const envelope = await client.createEnvelope({
   *   emailSubject: 'Please sign this document',
   *   templateId: 'template-id',
   *   templateRoles: [
   *     {
   *       email: 'signer@example.com',
   *       name: 'John Doe',
   *       roleName: 'Signer',
   *     }
   *   ],
   *   status: 'sent',
   * });
   * ```
   */
  async createEnvelope(
    request: DocuSignCreateEnvelopeRequest,
    options?: DocuSignRequestOptions
  ): Promise<DocuSignCreateEnvelopeResponse> {
    return this.request<DocuSignCreateEnvelopeResponse>("POST", "/envelopes", {
      ...options,
      body: request,
    });
  }

  /**
   * Delete an envelope
   *
   * @param envelopeId - Envelope ID
   * @param options - Request options
   */
  async deleteEnvelope(envelopeId: string, options?: DocuSignRequestOptions): Promise<void> {
    await this.request<void>("DELETE", `/envelopes/${envelopeId}`, options);
  }

  /**
   * Download envelope documents as PDF
   *
   * @param envelopeId - Envelope ID
   * @param options - Request options
   * @returns PDF as ArrayBuffer
   *
   * @example
   * ```typescript
   * const pdf = await client.downloadEnvelopeDocuments('abc123');
   * // Save to file
   * fs.writeFileSync('envelope.pdf', Buffer.from(pdf));
   * ```
   */
  async downloadEnvelopeDocuments(
    envelopeId: string,
    options?: DocuSignRequestOptions
  ): Promise<ArrayBuffer> {
    return this.request<ArrayBuffer>("GET", `/envelopes/${envelopeId}/documents/combined`, {
      ...options,
      headers: {
        ...options?.headers,
        Accept: "application/pdf",
      },
    });
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

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
  ): AsyncGenerator<DocuSignTemplateListResponse["envelopeTemplates"][0]> {
    let startPosition = 0;
    let hasMore = true;

    while (hasMore) {
      const response = await this.listTemplates(startPosition, pageSize);
      for (const template of response.envelopeTemplates) {
        yield template;
      }

      hasMore = response.envelopeTemplates.length === pageSize;
      startPosition += pageSize;
    }
  }

  /**
   * Iterate over all envelopes (handles pagination)
   *
   * @param fromDate - Filter by created date
   * @param status - Filter by status
   * @param pageSize - Number of items per page
   * @yields Envelope list items
   *
   * @example
   * ```typescript
   * for await (const envelope of client.iterateEnvelopes()) {
   *   console.log(envelope.emailSubject, envelope.status);
   * }
   * ```
   */
  async *iterateEnvelopes(
    fromDate?: string,
    status?: DocuSignEnvelopeStatus,
    pageSize: number = 50
  ): AsyncGenerator<DocuSignEnvelopeListResponse["envelopes"][0]> {
    let startPosition = 0;
    let hasMore = true;

    while (hasMore) {
      const response = await this.listEnvelopes(fromDate, startPosition, pageSize, status);
      for (const envelope of response.envelopes) {
        yield envelope;
      }

      hasMore = response.envelopes.length === pageSize;
      startPosition += pageSize;
    }
  }
}

// ============================================
// FACTORY FUNCTION
// ============================================

/**
 * Create a DocuSign client from stored tokens
 *
 * @param tokens - Stored OAuth tokens
 * @param accountId - DocuSign account ID
 * @param baseUri - Account base URI
 * @param onTokenRefresh - Callback when tokens are refreshed
 * @returns Configured DocuSign client
 *
 * @example
 * ```typescript
 * const tokens = await getStoredTokens(userId);
 * const client = createDocuSignClient(
 *   tokens,
 *   'account-id',
 *   'https://demo.docusign.net/restapi',
 *   async (newTokens) => {
 *     await saveTokens(userId, newTokens);
 *   }
 * );
 * ```
 */
export function createDocuSignClient(
  tokens: DocuSignTokens,
  accountId: string,
  baseUri: string,
  onTokenRefresh?: (tokens: DocuSignTokens) => Promise<void>
): DocuSignClient {
  const clientId = process.env.DOCUSIGN_CLIENT_ID;
  const clientSecret = process.env.DOCUSIGN_CLIENT_SECRET;
  const redirectUri = process.env.DOCUSIGN_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("DocuSign OAuth environment variables are not configured");
  }

  return new DocuSignClient({
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    tokenExpiresAt: tokens.expiresAt,
    accountId,
    baseUri,
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
  DocuSignClientConfig,
  DocuSignRequestOptions,
  DocuSignTemplateListResponse,
  DocuSignTemplate,
  DocuSignEnvelopeListResponse,
  DocuSignEnvelope,
  DocuSignCreateEnvelopeRequest,
  DocuSignCreateEnvelopeResponse,
  DocuSignEnvelopeStatus,
} from "./types";
