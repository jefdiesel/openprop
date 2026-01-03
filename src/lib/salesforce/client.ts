/**
 * Salesforce API Client
 *
 * Production-ready client for Salesforce REST API with:
 * - OAuth2 authentication with automatic token refresh
 * - Rate limiting with exponential backoff
 * - Comprehensive error handling
 * - Full TypeScript support
 */

import type {
  SalesforceClientConfig,
  SalesforceRequestOptions,
  SalesforceTokens,
  SalesforceApiError,
  SalesforceQueryResult,
  SalesforceContact,
  SalesforceContactCreate,
  SalesforceAccount,
  SalesforceOpportunity,
  SalesforceOpportunityCreate,
  SalesforceOpportunityUpdate,
  SalesforceLead,
  SalesforceTask,
  SalesforceTaskCreate,
  SalesforceContentVersion,
  SalesforceContentVersionCreate,
  SalesforceContentDocumentLink,
  SalesforceContentDocumentLinkCreate,
  SalesforceUser,
  SalesforceOrganization,
  SalesforceCreateResponse,
} from "./types";
import { refreshAccessToken, isTokenExpired, SalesforceAuthError } from "./auth";

// ============================================
// CONSTANTS
// ============================================

const DEFAULT_API_VERSION = "v59.0";
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
 * Base error class for Salesforce API errors
 */
export class SalesforceError extends Error {
  public readonly statusCode: number;
  public readonly errorCode?: string;
  public readonly errors?: SalesforceApiError[];

  constructor(
    message: string,
    statusCode: number,
    errorCode?: string,
    errors?: SalesforceApiError[]
  ) {
    super(message);
    this.name = "SalesforceError";
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.errors = errors;
  }

  static fromApiErrors(errors: SalesforceApiError[], statusCode: number): SalesforceError {
    const message = errors.map((e) => e.message).join("; ");
    const errorCode = errors[0]?.errorCode;
    return new SalesforceError(message, statusCode, errorCode, errors);
  }
}

/**
 * Error thrown when rate limited
 */
export class SalesforceRateLimitError extends SalesforceError {
  public readonly retryAfter: number;

  constructor(message: string, retryAfter: number) {
    super(message, RATE_LIMIT_STATUS_CODE);
    this.name = "SalesforceRateLimitError";
    this.retryAfter = retryAfter;
  }
}

/**
 * Error thrown when a record is not found
 */
export class SalesforceNotFoundError extends SalesforceError {
  constructor(objectType: string, id: string) {
    super(`${objectType} with ID ${id} not found`, 404, "NOT_FOUND");
    this.name = "SalesforceNotFoundError";
  }
}

// ============================================
// CLIENT CLASS
// ============================================

/**
 * Salesforce API Client
 *
 * @example
 * ```typescript
 * const client = new SalesforceClient({
 *   accessToken: 'your-access-token',
 *   instanceUrl: 'https://na1.salesforce.com',
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
 * const contacts = await client.listContacts(25);
 * ```
 */
export class SalesforceClient {
  private accessToken: string;
  private refreshToken?: string;
  private instanceUrl: string;
  private tokenExpiresAt?: Date;
  private readonly config: Required<
    Pick<SalesforceClientConfig, "apiVersion" | "timeout" | "maxRetries">
  > &
    Pick<SalesforceClientConfig, "oauthConfig" | "onTokenRefresh" | "isSandbox">;

  constructor(config: SalesforceClientConfig) {
    if (!config.accessToken) {
      throw new Error("accessToken must be provided");
    }
    if (!config.instanceUrl) {
      throw new Error("instanceUrl must be provided");
    }

    this.accessToken = config.accessToken;
    this.instanceUrl = config.instanceUrl;
    this.refreshToken = config.refreshToken;
    this.tokenExpiresAt = config.tokenExpiresAt;
    this.config = {
      apiVersion: config.apiVersion ?? DEFAULT_API_VERSION,
      timeout: config.timeout ?? DEFAULT_TIMEOUT,
      maxRetries: config.maxRetries ?? DEFAULT_MAX_RETRIES,
      oauthConfig: config.oauthConfig,
      onTokenRefresh: config.onTokenRefresh,
      isSandbox: config.isSandbox,
    };
  }

  // ============================================
  // TOKEN MANAGEMENT
  // ============================================

  /**
   * Update tokens (useful after manual refresh)
   */
  public updateTokens(tokens: SalesforceTokens): void {
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
    this.instanceUrl = tokens.instanceUrl;
    this.tokenExpiresAt = tokens.expiresAt;
  }

  /**
   * Get current access token
   */
  public getAccessToken(): string {
    return this.accessToken;
  }

  /**
   * Get the instance URL
   */
  public getInstanceUrl(): string {
    return this.instanceUrl;
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
        this.instanceUrl,
        this.config.isSandbox ?? false
      );
      this.updateTokens(newTokens);

      if (this.config.onTokenRefresh) {
        await this.config.onTokenRefresh(newTokens);
      }
    } catch (error) {
      if (error instanceof SalesforceAuthError && error.requiresReauthorization) {
        throw error; // Re-throw auth errors that need user action
      }
      console.warn("Failed to refresh Salesforce token:", error);
    }
  }

  // ============================================
  // HTTP REQUEST HANDLING
  // ============================================

  /**
   * Get the base URL for API calls
   */
  private getBaseUrl(): string {
    return `${this.instanceUrl}/services/data/${this.config.apiVersion}`;
  }

  /**
   * Make an authenticated API request with retry logic
   */
  private async request<T>(
    method: string,
    path: string,
    options: SalesforceRequestOptions & {
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
        return await this.handleResponse<T>(response, path);
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
    options: SalesforceRequestOptions & { body?: unknown }
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
  private async handleResponse<T>(response: Response, path: string): Promise<T> {
    // Handle rate limiting
    if (response.status === RATE_LIMIT_STATUS_CODE) {
      const retryAfter = parseInt(response.headers.get("Retry-After") ?? "60", 10);
      throw new SalesforceRateLimitError(
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
      let errorData: SalesforceApiError[];
      try {
        const errorJson = await response.json();
        errorData = Array.isArray(errorJson) ? errorJson : [errorJson];
      } catch {
        errorData = [
          {
            message: `HTTP ${response.status}: ${response.statusText}`,
            errorCode: "UNKNOWN_ERROR",
          },
        ];
      }
      throw SalesforceError.fromApiErrors(errorData, response.status);
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
    if (error instanceof SalesforceRateLimitError) {
      return true;
    }

    // Retry on server errors
    if (error instanceof SalesforceError) {
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
    if (error instanceof SalesforceRateLimitError) {
      return error.retryAfter * 1000;
    }

    // Exponential backoff with jitter
    const baseDelay = DEFAULT_INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
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
  // QUERY ENDPOINT
  // ============================================

  /**
   * Execute a SOQL query
   *
   * @param soql - SOQL query string
   * @param options - Request options
   * @returns Query result with records
   *
   * @example
   * ```typescript
   * const result = await client.query<SalesforceContact>(
   *   "SELECT Id, Name, Email FROM Contact LIMIT 10"
   * );
   * for (const contact of result.records) {
   *   console.log(contact.Name);
   * }
   * ```
   */
  async query<T>(
    soql: string,
    options?: SalesforceRequestOptions
  ): Promise<SalesforceQueryResult<T>> {
    return this.request<SalesforceQueryResult<T>>("GET", "/query", {
      ...options,
      query: { q: soql },
    });
  }

  /**
   * Execute a SOQL query and return all records (handles pagination)
   */
  async queryAll<T>(
    soql: string,
    options?: SalesforceRequestOptions
  ): Promise<T[]> {
    const records: T[] = [];
    let result = await this.query<T>(soql, options);
    records.push(...result.records);

    while (!result.done && result.nextRecordsUrl) {
      result = await this.request<SalesforceQueryResult<T>>(
        "GET",
        result.nextRecordsUrl.replace(`/services/data/${this.config.apiVersion}`, ""),
        options
      );
      records.push(...result.records);
    }

    return records;
  }

  // ============================================
  // CONTACT ENDPOINTS
  // ============================================

  /**
   * Get a single contact by ID
   *
   * @param id - Contact ID
   * @param fields - Fields to retrieve (optional)
   * @param options - Request options
   * @returns Contact record
   */
  async getContact(
    id: string,
    fields?: string[],
    options?: SalesforceRequestOptions
  ): Promise<SalesforceContact> {
    const query = fields ? { fields: fields.join(",") } : undefined;
    return this.request<SalesforceContact>("GET", `/sobjects/Contact/${id}`, {
      ...options,
      query,
    });
  }

  /**
   * Create a new contact
   *
   * @param data - Contact data
   * @param options - Request options
   * @returns Created contact ID
   */
  async createContact(
    data: SalesforceContactCreate,
    options?: SalesforceRequestOptions
  ): Promise<SalesforceCreateResponse> {
    return this.request<SalesforceCreateResponse>("POST", "/sobjects/Contact", {
      ...options,
      body: data,
    });
  }

  /**
   * Update an existing contact
   *
   * @param id - Contact ID
   * @param data - Fields to update
   * @param options - Request options
   */
  async updateContact(
    id: string,
    data: Partial<SalesforceContactCreate>,
    options?: SalesforceRequestOptions
  ): Promise<void> {
    await this.request<void>("PATCH", `/sobjects/Contact/${id}`, {
      ...options,
      body: data,
    });
  }

  /**
   * List contacts
   *
   * @param limit - Maximum number of records to return
   * @param options - Request options
   * @returns List of contacts
   */
  async listContacts(
    limit: number = 25,
    options?: SalesforceRequestOptions
  ): Promise<SalesforceContact[]> {
    const result = await this.query<SalesforceContact>(
      `SELECT Id, FirstName, LastName, Name, Email, Phone, Title, AccountId, Account.Name, CreatedDate, LastModifiedDate FROM Contact ORDER BY LastModifiedDate DESC LIMIT ${limit}`,
      options
    );
    return result.records;
  }

  /**
   * Search contacts by name or email
   *
   * @param searchTerm - Search term
   * @param limit - Maximum results
   * @param options - Request options
   * @returns Matching contacts
   */
  async searchContacts(
    searchTerm: string,
    limit: number = 10,
    options?: SalesforceRequestOptions
  ): Promise<SalesforceContact[]> {
    const escapedTerm = searchTerm.replace(/'/g, "\\'");
    const result = await this.query<SalesforceContact>(
      `SELECT Id, FirstName, LastName, Name, Email, Phone, Title, AccountId, Account.Name FROM Contact WHERE Name LIKE '%${escapedTerm}%' OR Email LIKE '%${escapedTerm}%' ORDER BY Name LIMIT ${limit}`,
      options
    );
    return result.records;
  }

  // ============================================
  // ACCOUNT ENDPOINTS
  // ============================================

  /**
   * Get a single account by ID
   */
  async getAccount(
    id: string,
    fields?: string[],
    options?: SalesforceRequestOptions
  ): Promise<SalesforceAccount> {
    const query = fields ? { fields: fields.join(",") } : undefined;
    return this.request<SalesforceAccount>("GET", `/sobjects/Account/${id}`, {
      ...options,
      query,
    });
  }

  /**
   * List accounts
   */
  async listAccounts(
    limit: number = 25,
    options?: SalesforceRequestOptions
  ): Promise<SalesforceAccount[]> {
    const result = await this.query<SalesforceAccount>(
      `SELECT Id, Name, Type, Industry, Website, Phone, CreatedDate, LastModifiedDate FROM Account ORDER BY LastModifiedDate DESC LIMIT ${limit}`,
      options
    );
    return result.records;
  }

  // ============================================
  // OPPORTUNITY ENDPOINTS
  // ============================================

  /**
   * Get a single opportunity by ID
   *
   * @param id - Opportunity ID
   * @param fields - Fields to retrieve (optional)
   * @param options - Request options
   * @returns Opportunity record
   */
  async getOpportunity(
    id: string,
    fields?: string[],
    options?: SalesforceRequestOptions
  ): Promise<SalesforceOpportunity> {
    const query = fields ? { fields: fields.join(",") } : undefined;
    return this.request<SalesforceOpportunity>("GET", `/sobjects/Opportunity/${id}`, {
      ...options,
      query,
    });
  }

  /**
   * Create a new opportunity
   *
   * @param data - Opportunity data
   * @param options - Request options
   * @returns Created opportunity ID
   */
  async createOpportunity(
    data: SalesforceOpportunityCreate,
    options?: SalesforceRequestOptions
  ): Promise<SalesforceCreateResponse> {
    return this.request<SalesforceCreateResponse>("POST", "/sobjects/Opportunity", {
      ...options,
      body: data,
    });
  }

  /**
   * Update an existing opportunity
   *
   * @param id - Opportunity ID
   * @param data - Fields to update
   * @param options - Request options
   */
  async updateOpportunity(
    id: string,
    data: SalesforceOpportunityUpdate,
    options?: SalesforceRequestOptions
  ): Promise<void> {
    await this.request<void>("PATCH", `/sobjects/Opportunity/${id}`, {
      ...options,
      body: data,
    });
  }

  /**
   * List opportunities
   *
   * @param limit - Maximum number of records to return
   * @param options - Request options
   * @returns List of opportunities
   */
  async listOpportunities(
    limit: number = 25,
    options?: SalesforceRequestOptions
  ): Promise<SalesforceOpportunity[]> {
    const result = await this.query<SalesforceOpportunity>(
      `SELECT Id, Name, StageName, Amount, CloseDate, Probability, Type, AccountId, Account.Name, IsClosed, IsWon, CreatedDate, LastModifiedDate FROM Opportunity ORDER BY LastModifiedDate DESC LIMIT ${limit}`,
      options
    );
    return result.records;
  }

  /**
   * List open opportunities
   */
  async listOpenOpportunities(
    limit: number = 25,
    options?: SalesforceRequestOptions
  ): Promise<SalesforceOpportunity[]> {
    const result = await this.query<SalesforceOpportunity>(
      `SELECT Id, Name, StageName, Amount, CloseDate, Probability, Type, AccountId, Account.Name, CreatedDate FROM Opportunity WHERE IsClosed = false ORDER BY CloseDate ASC LIMIT ${limit}`,
      options
    );
    return result.records;
  }

  // ============================================
  // LEAD ENDPOINTS
  // ============================================

  /**
   * Get a single lead by ID
   */
  async getLead(
    id: string,
    fields?: string[],
    options?: SalesforceRequestOptions
  ): Promise<SalesforceLead> {
    const query = fields ? { fields: fields.join(",") } : undefined;
    return this.request<SalesforceLead>("GET", `/sobjects/Lead/${id}`, {
      ...options,
      query,
    });
  }

  /**
   * List leads
   */
  async listLeads(
    limit: number = 25,
    options?: SalesforceRequestOptions
  ): Promise<SalesforceLead[]> {
    const result = await this.query<SalesforceLead>(
      `SELECT Id, FirstName, LastName, Name, Company, Title, Email, Phone, Status, LeadSource, CreatedDate, LastModifiedDate FROM Lead WHERE IsConverted = false ORDER BY LastModifiedDate DESC LIMIT ${limit}`,
      options
    );
    return result.records;
  }

  // ============================================
  // TASK ENDPOINTS
  // ============================================

  /**
   * Get a single task by ID
   */
  async getTask(
    id: string,
    options?: SalesforceRequestOptions
  ): Promise<SalesforceTask> {
    return this.request<SalesforceTask>("GET", `/sobjects/Task/${id}`, options);
  }

  /**
   * Create a new task
   *
   * @param data - Task data
   * @param options - Request options
   * @returns Created task ID
   *
   * @example
   * ```typescript
   * const task = await client.createTask({
   *   Subject: 'Follow up on signed proposal',
   *   Status: 'Not Started',
   *   Priority: 'High',
   *   WhatId: opportunityId, // Link to opportunity
   *   ActivityDate: '2024-01-20',
   *   Description: 'Document was signed, schedule kickoff call',
   * });
   * ```
   */
  async createTask(
    data: SalesforceTaskCreate,
    options?: SalesforceRequestOptions
  ): Promise<SalesforceCreateResponse> {
    return this.request<SalesforceCreateResponse>("POST", "/sobjects/Task", {
      ...options,
      body: data,
    });
  }

  /**
   * Update an existing task
   */
  async updateTask(
    id: string,
    data: Partial<SalesforceTaskCreate>,
    options?: SalesforceRequestOptions
  ): Promise<void> {
    await this.request<void>("PATCH", `/sobjects/Task/${id}`, {
      ...options,
      body: data,
    });
  }

  // ============================================
  // FILE ATTACHMENT ENDPOINTS
  // ============================================

  /**
   * Create a ContentVersion (file attachment)
   *
   * @param data - ContentVersion data with base64 encoded file
   * @param options - Request options
   * @returns Created ContentVersion ID
   *
   * @example
   * ```typescript
   * // Attach a PDF to an opportunity
   * const fileContent = fs.readFileSync('document.pdf');
   * const base64Content = fileContent.toString('base64');
   *
   * const cv = await client.createContentVersion({
   *   Title: 'Signed Proposal',
   *   PathOnClient: 'signed-proposal.pdf',
   *   VersionData: base64Content,
   *   FirstPublishLocationId: opportunityId, // Links to the opportunity
   * });
   * ```
   */
  async createContentVersion(
    data: SalesforceContentVersionCreate,
    options?: SalesforceRequestOptions
  ): Promise<SalesforceCreateResponse> {
    return this.request<SalesforceCreateResponse>("POST", "/sobjects/ContentVersion", {
      ...options,
      body: data,
    });
  }

  /**
   * Get ContentVersion by ID
   */
  async getContentVersion(
    id: string,
    options?: SalesforceRequestOptions
  ): Promise<SalesforceContentVersion> {
    return this.request<SalesforceContentVersion>(
      "GET",
      `/sobjects/ContentVersion/${id}`,
      options
    );
  }

  /**
   * Create a ContentDocumentLink to share a file with a record
   *
   * @param data - Link data
   * @param options - Request options
   * @returns Created link ID
   */
  async createContentDocumentLink(
    data: SalesforceContentDocumentLinkCreate,
    options?: SalesforceRequestOptions
  ): Promise<SalesforceCreateResponse> {
    return this.request<SalesforceCreateResponse>(
      "POST",
      "/sobjects/ContentDocumentLink",
      {
        ...options,
        body: data,
      }
    );
  }

  /**
   * Add a file attachment to a record
   *
   * This is a convenience method that creates a ContentVersion and links it
   *
   * @param parentId - ID of the parent record (Account, Contact, Opportunity, etc.)
   * @param fileName - Name of the file with extension
   * @param fileContent - Base64 encoded file content
   * @param title - Document title (optional, defaults to fileName)
   * @param description - Document description (optional)
   */
  async addAttachment(
    parentId: string,
    fileName: string,
    fileContent: string,
    title?: string,
    description?: string,
    options?: SalesforceRequestOptions
  ): Promise<SalesforceCreateResponse> {
    return this.createContentVersion(
      {
        Title: title || fileName,
        PathOnClient: fileName,
        VersionData: fileContent,
        FirstPublishLocationId: parentId,
        Description: description,
      },
      options
    );
  }

  // ============================================
  // USER ENDPOINTS
  // ============================================

  /**
   * Get current user info
   */
  async getCurrentUser(options?: SalesforceRequestOptions): Promise<SalesforceUser> {
    // First get the user ID from the organization
    const org = await this.getOrganization(options);
    const result = await this.query<SalesforceUser>(
      `SELECT Id, Username, Email, FirstName, LastName, Name, IsActive, CompanyName, Title FROM User WHERE Id = '${this.config.oauthConfig ? "" : ""}' LIMIT 1`,
      options
    );

    if (result.records.length === 0) {
      throw new SalesforceNotFoundError("User", "current");
    }

    return result.records[0];
  }

  /**
   * Get user by ID
   */
  async getUser(
    id: string,
    options?: SalesforceRequestOptions
  ): Promise<SalesforceUser> {
    return this.request<SalesforceUser>("GET", `/sobjects/User/${id}`, options);
  }

  // ============================================
  // ORGANIZATION ENDPOINTS
  // ============================================

  /**
   * Get organization info
   */
  async getOrganization(
    options?: SalesforceRequestOptions
  ): Promise<SalesforceOrganization> {
    const result = await this.query<SalesforceOrganization>(
      "SELECT Id, Name, InstanceName, IsSandbox, OrganizationType FROM Organization LIMIT 1",
      options
    );

    if (result.records.length === 0) {
      throw new SalesforceError("Failed to retrieve organization info", 500);
    }

    return result.records[0];
  }

  // ============================================
  // DESCRIBE ENDPOINTS
  // ============================================

  /**
   * Get metadata about an object
   */
  async describeObject(
    objectName: string,
    options?: SalesforceRequestOptions
  ): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(
      "GET",
      `/sobjects/${objectName}/describe`,
      options
    );
  }

  /**
   * Get list of available objects
   */
  async describeGlobal(
    options?: SalesforceRequestOptions
  ): Promise<{ sobjects: Array<{ name: string; label: string; queryable: boolean }> }> {
    return this.request<{
      sobjects: Array<{ name: string; label: string; queryable: boolean }>;
    }>("GET", "/sobjects", options);
  }

  // ============================================
  // OPPORTUNITY STAGE HELPERS
  // ============================================

  /**
   * Get available opportunity stages
   */
  async getOpportunityStages(
    options?: SalesforceRequestOptions
  ): Promise<Array<{ value: string; label: string; isClosed: boolean; isWon: boolean }>> {
    const result = await this.query<{
      ApiName: string;
      MasterLabel: string;
      IsClosed: boolean;
      IsWon: boolean;
    }>(
      "SELECT ApiName, MasterLabel, IsClosed, IsWon FROM OpportunityStage ORDER BY SortOrder",
      options
    );

    return result.records.map((stage) => ({
      value: stage.ApiName,
      label: stage.MasterLabel,
      isClosed: stage.IsClosed,
      isWon: stage.IsWon,
    }));
  }
}

// ============================================
// FACTORY FUNCTION
// ============================================

/**
 * Create a Salesforce client from stored tokens
 *
 * @param tokens - Stored OAuth tokens
 * @param onTokenRefresh - Callback when tokens are refreshed
 * @param isSandbox - Whether this is a sandbox environment
 * @returns Configured Salesforce client
 *
 * @example
 * ```typescript
 * const tokens = await getStoredTokens(userId);
 * const client = createSalesforceClient(tokens, async (newTokens) => {
 *   await saveTokens(userId, newTokens);
 * });
 * ```
 */
export function createSalesforceClient(
  tokens: SalesforceTokens,
  onTokenRefresh?: (tokens: SalesforceTokens) => Promise<void>,
  isSandbox?: boolean
): SalesforceClient {
  const clientId = process.env.SALESFORCE_CLIENT_ID;
  const clientSecret = process.env.SALESFORCE_CLIENT_SECRET;
  const redirectUri = process.env.SALESFORCE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Salesforce OAuth environment variables are not configured");
  }

  return new SalesforceClient({
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    instanceUrl: tokens.instanceUrl,
    tokenExpiresAt: tokens.expiresAt,
    oauthConfig: {
      clientId,
      clientSecret,
      redirectUri,
    },
    onTokenRefresh,
    isSandbox,
  });
}

// ============================================
// EXPORTS
// ============================================

export type {
  SalesforceClientConfig,
  SalesforceRequestOptions,
  SalesforceQueryResult,
  SalesforceContact,
  SalesforceContactCreate,
  SalesforceAccount,
  SalesforceOpportunity,
  SalesforceOpportunityCreate,
  SalesforceOpportunityUpdate,
  SalesforceLead,
  SalesforceTask,
  SalesforceTaskCreate,
  SalesforceContentVersion,
  SalesforceContentVersionCreate,
  SalesforceUser,
  SalesforceOrganization,
} from "./types";
