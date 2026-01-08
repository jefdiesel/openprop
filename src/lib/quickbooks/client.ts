/**
 * QuickBooks Online API Client
 *
 * Production-ready client for QuickBooks Online API with:
 * - OAuth2 authentication with automatic token refresh
 * - Comprehensive error handling
 * - Full TypeScript support
 * - Customer, Invoice, and Payment management
 */

import type {
  QuickBooksClientConfig,
  QuickBooksRequestOptions,
  QuickBooksTokens,
  QuickBooksApiError,
  QuickBooksResponse,
  QuickBooksCustomer,
  QuickBooksCreateCustomerRequest,
  QuickBooksInvoice,
  QuickBooksCreateInvoiceRequest,
  QuickBooksPayment,
  QuickBooksCreatePaymentRequest,
  QuickBooksCompanyInfo,
  QuickBooksQueryOptions,
} from "./types";
import { refreshAccessToken, isTokenExpired, QuickBooksAuthError } from "./auth";

// ============================================
// CONSTANTS
// ============================================

const QUICKBOOKS_API_BASE_PRODUCTION = "https://quickbooks.api.intuit.com/v3/company";
const QUICKBOOKS_API_BASE_SANDBOX = "https://sandbox-quickbooks.api.intuit.com/v3/company";
const DEFAULT_TIMEOUT = 30000; // 30 seconds
const DEFAULT_MAX_RETRIES = 3;
const RATE_LIMIT_STATUS_CODE = 429;
const SERVER_ERROR_MIN = 500;
const SERVER_ERROR_MAX = 599;

// ============================================
// ERROR CLASSES
// ============================================

/**
 * Base error class for QuickBooks API errors
 */
export class QuickBooksError extends Error {
  public readonly statusCode: number;
  public readonly errorCode?: string;
  public readonly errorDetail?: string;

  constructor(
    message: string,
    statusCode: number,
    errorCode?: string,
    errorDetail?: string
  ) {
    super(message);
    this.name = "QuickBooksError";
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.errorDetail = errorDetail;
  }

  static fromApiError(error: QuickBooksApiError, statusCode: number): QuickBooksError {
    const firstError = error.Fault?.Error?.[0];
    return new QuickBooksError(
      firstError?.Message || "QuickBooks API error",
      statusCode,
      firstError?.code,
      firstError?.Detail
    );
  }
}

/**
 * Error thrown when rate limited
 */
export class QuickBooksRateLimitError extends QuickBooksError {
  public readonly retryAfter: number;

  constructor(message: string, retryAfter: number) {
    super(message, RATE_LIMIT_STATUS_CODE);
    this.name = "QuickBooksRateLimitError";
    this.retryAfter = retryAfter;
  }
}

// ============================================
// CLIENT CLASS
// ============================================

/**
 * QuickBooks Online API Client
 *
 * @example
 * ```typescript
 * const client = new QuickBooksClient({
 *   accessToken: 'your-access-token',
 *   refreshToken: 'your-refresh-token',
 *   tokenExpiresAt: new Date('2024-01-01'),
 *   realmId: 'your-company-id',
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
 * const customers = await client.listCustomers();
 * const invoice = await client.createInvoice(customerId, lineItems);
 * ```
 */
export class QuickBooksClient {
  private accessToken: string;
  private refreshToken?: string;
  private tokenExpiresAt?: Date;
  private readonly realmId: string;
  private readonly config: Required<
    Pick<QuickBooksClientConfig, "timeout" | "maxRetries" | "environment">
  > &
    Pick<QuickBooksClientConfig, "oauthConfig" | "onTokenRefresh">;

  constructor(config: QuickBooksClientConfig) {
    this.accessToken = config.accessToken;
    this.refreshToken = config.refreshToken;
    this.tokenExpiresAt = config.tokenExpiresAt;
    this.realmId = config.realmId;
    this.config = {
      timeout: config.timeout ?? DEFAULT_TIMEOUT,
      maxRetries: config.maxRetries ?? DEFAULT_MAX_RETRIES,
      environment: config.environment ?? 'production',
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
  public updateTokens(tokens: QuickBooksTokens): void {
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
   * Get base API URL based on environment
   */
  private getBaseUrl(): string {
    const base = this.config.environment === 'sandbox'
      ? QUICKBOOKS_API_BASE_SANDBOX
      : QUICKBOOKS_API_BASE_PRODUCTION;
    return `${base}/${this.realmId}`;
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
        this.refreshToken,
        this.realmId
      );
      this.updateTokens(newTokens);

      if (this.config.onTokenRefresh) {
        await this.config.onTokenRefresh(newTokens);
      }
    } catch (error) {
      if (error instanceof QuickBooksAuthError && error.requiresReauthorization) {
        throw error; // Re-throw auth errors that need user action
      }
      console.warn("Failed to refresh QuickBooks token:", error);
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
    options: QuickBooksRequestOptions & {
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
    const url = new URL(`${this.getBaseUrl()}${path}`);

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
    options: QuickBooksRequestOptions & { body?: unknown }
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${this.accessToken}`,
        Accept: "application/json",
        "Content-Type": "application/json",
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
      throw new QuickBooksRateLimitError(
        `Rate limited. Retry after ${retryAfter} seconds.`,
        retryAfter
      );
    }

    // Handle no content
    if (response.status === 204) {
      return undefined as T;
    }

    // Parse response body
    const data = await response.json();

    // Handle errors
    if (!response.ok) {
      throw QuickBooksError.fromApiError(data, response.status);
    }

    return data as T;
  }

  /**
   * Determine if request should be retried
   */
  private shouldRetry(error: Error, retryCount: number, maxRetries: number): boolean {
    if (retryCount >= maxRetries) {
      return false;
    }

    // Retry on rate limit
    if (error instanceof QuickBooksRateLimitError) {
      return true;
    }

    // Retry on server errors
    if (error instanceof QuickBooksError) {
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
    if (error instanceof QuickBooksRateLimitError) {
      return error.retryAfter * 1000;
    }

    // Exponential backoff with jitter
    const baseDelay = 1000 * Math.pow(2, retryCount);
    const jitter = Math.random() * 0.3 * baseDelay;
    return Math.min(baseDelay + jitter, 60000); // Cap at 60 seconds
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ============================================
  // COMPANY INFO ENDPOINTS
  // ============================================

  /**
   * Get company information
   *
   * @param options - Request options
   * @returns Company information
   */
  async getCompanyInfo(
    options?: QuickBooksRequestOptions
  ): Promise<QuickBooksCompanyInfo> {
    const response = await this.request<QuickBooksResponse<QuickBooksCompanyInfo>>(
      "GET",
      "/companyinfo/" + this.realmId,
      options
    );
    return (response.CompanyInfo || {}) as QuickBooksCompanyInfo;
  }

  // ============================================
  // CUSTOMER ENDPOINTS
  // ============================================

  /**
   * List/search customers
   *
   * @param query - SQL-like query string (optional)
   * @param queryOptions - Query options
   * @param options - Request options
   * @returns List of customers
   *
   * @example
   * ```typescript
   * const customers = await client.listCustomers();
   * const activeCustomers = await client.listCustomers("SELECT * FROM Customer WHERE Active = true");
   * ```
   */
  async listCustomers(
    query?: string,
    queryOptions?: QuickBooksQueryOptions,
    options?: QuickBooksRequestOptions
  ): Promise<QuickBooksCustomer[]> {
    const sqlQuery = query || "SELECT * FROM Customer";
    const fullQuery = this.buildQueryString(sqlQuery, queryOptions);

    const response = await this.request<QuickBooksResponse<QuickBooksCustomer>>(
      "GET",
      "/query",
      {
        ...options,
        query: { query: fullQuery },
      }
    );

    const customers = response.QueryResponse?.Customer;
    return Array.isArray(customers) ? customers : [];
  }

  /**
   * Get customer details by ID
   *
   * @param id - Customer ID
   * @param options - Request options
   * @returns Customer details
   */
  async getCustomer(
    id: string,
    options?: QuickBooksRequestOptions
  ): Promise<QuickBooksCustomer> {
    const response = await this.request<QuickBooksResponse<QuickBooksCustomer>>(
      "GET",
      `/customer/${id}`,
      options
    );
    return (response.Customer || {}) as QuickBooksCustomer;
  }

  /**
   * Create a new customer
   *
   * @param data - Customer data
   * @param options - Request options
   * @returns Created customer
   *
   * @example
   * ```typescript
   * const customer = await client.createCustomer({
   *   DisplayName: 'John Doe',
   *   GivenName: 'John',
   *   FamilyName: 'Doe',
   *   PrimaryEmailAddr: { Address: 'john@example.com' },
   * });
   * ```
   */
  async createCustomer(
    data: QuickBooksCreateCustomerRequest,
    options?: QuickBooksRequestOptions
  ): Promise<QuickBooksCustomer> {
    const response = await this.request<QuickBooksResponse<QuickBooksCustomer>>(
      "POST",
      "/customer",
      {
        ...options,
        body: data,
      }
    );
    return (response.Customer || {}) as QuickBooksCustomer;
  }

  /**
   * Find customer by email or create new one
   *
   * @param email - Customer email
   * @param name - Customer name (used if creating)
   * @param options - Request options
   * @returns Found or created customer
   *
   * @example
   * ```typescript
   * const customer = await client.findOrCreateCustomer('john@example.com', 'John Doe');
   * ```
   */
  async findOrCreateCustomer(
    email: string,
    name: string,
    options?: QuickBooksRequestOptions
  ): Promise<QuickBooksCustomer> {
    // Search for existing customer by email
    const existingCustomers = await this.listCustomers(
      `SELECT * FROM Customer WHERE PrimaryEmailAddr = '${email}'`,
      { maxResults: 1 },
      options
    );

    if (existingCustomers.length > 0) {
      return existingCustomers[0];
    }

    // Create new customer
    const nameParts = name.split(' ');
    const givenName = nameParts[0];
    const familyName = nameParts.slice(1).join(' ') || undefined;

    return this.createCustomer(
      {
        DisplayName: name,
        GivenName: givenName,
        FamilyName: familyName,
        PrimaryEmailAddr: { Address: email },
      },
      options
    );
  }

  // ============================================
  // INVOICE ENDPOINTS
  // ============================================

  /**
   * Create a new invoice
   *
   * @param customerId - Customer ID
   * @param lineItems - Invoice line items
   * @param additionalData - Additional invoice data
   * @param options - Request options
   * @returns Created invoice
   *
   * @example
   * ```typescript
   * const invoice = await client.createInvoice('123', [
   *   {
   *     Amount: 100,
   *     DetailType: 'SalesItemLineDetail',
   *     Description: 'Consulting services',
   *     SalesItemLineDetail: {
   *       Qty: 1,
   *       UnitPrice: 100,
   *     },
   *   },
   * ]);
   * ```
   */
  async createInvoice(
    customerId: string,
    lineItems: QuickBooksCreateInvoiceRequest['Line'],
    additionalData?: Partial<QuickBooksCreateInvoiceRequest>,
    options?: QuickBooksRequestOptions
  ): Promise<QuickBooksInvoice> {
    const invoiceData: QuickBooksCreateInvoiceRequest = {
      CustomerRef: { value: customerId },
      Line: lineItems,
      ...additionalData,
    };

    const response = await this.request<QuickBooksResponse<QuickBooksInvoice>>(
      "POST",
      "/invoice",
      {
        ...options,
        body: invoiceData,
      }
    );
    return (response.Invoice || {}) as QuickBooksInvoice;
  }

  /**
   * Get invoice by ID
   *
   * @param id - Invoice ID
   * @param options - Request options
   * @returns Invoice details
   */
  async getInvoice(
    id: string,
    options?: QuickBooksRequestOptions
  ): Promise<QuickBooksInvoice> {
    const response = await this.request<QuickBooksResponse<QuickBooksInvoice>>(
      "GET",
      `/invoice/${id}`,
      options
    );
    return (response.Invoice || {}) as QuickBooksInvoice;
  }

  // ============================================
  // PAYMENT ENDPOINTS
  // ============================================

  /**
   * Create a payment (record payment against an invoice)
   *
   * @param invoiceId - Invoice ID to apply payment to
   * @param amount - Payment amount
   * @param customerId - Customer ID
   * @param additionalData - Additional payment data
   * @param options - Request options
   * @returns Created payment
   *
   * @example
   * ```typescript
   * const payment = await client.createPayment('invoice-123', 100, 'customer-456');
   * ```
   */
  async createPayment(
    invoiceId: string,
    amount: number,
    customerId: string,
    additionalData?: Partial<QuickBooksCreatePaymentRequest>,
    options?: QuickBooksRequestOptions
  ): Promise<QuickBooksPayment> {
    const paymentData: QuickBooksCreatePaymentRequest = {
      CustomerRef: { value: customerId },
      TotalAmt: amount,
      Line: [
        {
          Amount: amount,
          LinkedTxn: [
            {
              TxnId: invoiceId,
              TxnType: 'Invoice',
            },
          ],
        },
      ],
      ...additionalData,
    };

    const response = await this.request<QuickBooksResponse<QuickBooksPayment>>(
      "POST",
      "/payment",
      {
        ...options,
        body: paymentData,
      }
    );
    return (response.Payment || {}) as QuickBooksPayment;
  }

  /**
   * Get payment by ID
   *
   * @param id - Payment ID
   * @param options - Request options
   * @returns Payment details
   */
  async getPayment(
    id: string,
    options?: QuickBooksRequestOptions
  ): Promise<QuickBooksPayment> {
    const response = await this.request<QuickBooksResponse<QuickBooksPayment>>(
      "GET",
      `/payment/${id}`,
      options
    );
    return (response.Payment || {}) as QuickBooksPayment;
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Build query string with options
   */
  private buildQueryString(
    baseQuery: string,
    options?: QuickBooksQueryOptions
  ): string {
    let query = baseQuery;

    if (options?.orderBy && options.orderBy.length > 0) {
      query += ` ORDERBY ${options.orderBy.join(', ')}`;
    }

    if (options?.maxResults) {
      query += ` MAXRESULTS ${options.maxResults}`;
    }

    if (options?.startPosition) {
      query += ` STARTPOSITION ${options.startPosition}`;
    }

    return query;
  }
}

// ============================================
// FACTORY FUNCTION
// ============================================

/**
 * Create a QuickBooks client from stored tokens
 *
 * @param tokens - Stored OAuth tokens
 * @param onTokenRefresh - Callback when tokens are refreshed
 * @param environment - Environment (sandbox or production)
 * @returns Configured QuickBooks client
 *
 * @example
 * ```typescript
 * const tokens = await getStoredTokens(userId);
 * const client = createQuickBooksClient(tokens, async (newTokens) => {
 *   await saveTokens(userId, newTokens);
 * });
 * ```
 */
export function createQuickBooksClient(
  tokens: QuickBooksTokens,
  onTokenRefresh?: (tokens: QuickBooksTokens) => Promise<void>,
  environment?: 'sandbox' | 'production'
): QuickBooksClient {
  const clientId = process.env.QUICKBOOKS_CLIENT_ID;
  const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET;
  const redirectUri = process.env.QUICKBOOKS_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("QuickBooks OAuth environment variables are not configured");
  }

  return new QuickBooksClient({
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    tokenExpiresAt: tokens.expiresAt,
    realmId: tokens.realmId,
    oauthConfig: {
      clientId,
      clientSecret,
      redirectUri,
      environment: environment || (process.env.QUICKBOOKS_ENVIRONMENT as 'sandbox' | 'production') || 'production',
    },
    onTokenRefresh,
    environment,
  });
}
