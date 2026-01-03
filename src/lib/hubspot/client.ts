/**
 * HubSpot API Client
 *
 * Production-ready client for HubSpot CRM API v3 with:
 * - OAuth2 authentication with automatic token refresh
 * - Rate limiting with exponential backoff
 * - Comprehensive error handling
 * - Full TypeScript support
 */

import type {
  HubSpotClientConfig,
  HubSpotRequestOptions,
  HubSpotTokens,
  HubSpotApiError,
  HubSpotListResponse,
  HubSpotContact,
  HubSpotContactInput,
  HubSpotSearchContactsRequest,
  HubSpotCompany,
  HubSpotCompanyInput,
  HubSpotDeal,
  HubSpotDealInput,
  HubSpotNote,
  HubSpotNoteInput,
  HubSpotTask,
  HubSpotTaskInput,
  HubSpotOwner,
  HubSpotPipeline,
  HubSpotAssociationInput,
} from "./types";
import { refreshAccessToken, isTokenExpired, HubSpotAuthError } from "./auth";

// ============================================
// CONSTANTS
// ============================================

const DEFAULT_BASE_URL = "https://api.hubapi.com";
const DEFAULT_TIMEOUT = 30000; // 30 seconds
const DEFAULT_MAX_RETRIES = 3;

// Rate limit constants
const RATE_LIMIT_STATUS_CODE = 429;
const SERVER_ERROR_MIN = 500;
const SERVER_ERROR_MAX = 599;

// Default properties to fetch
const DEFAULT_CONTACT_PROPERTIES = [
  "email",
  "firstname",
  "lastname",
  "phone",
  "company",
  "jobtitle",
  "website",
  "address",
  "city",
  "state",
  "zip",
  "country",
  "createdate",
  "lastmodifieddate",
];

const DEFAULT_COMPANY_PROPERTIES = [
  "name",
  "domain",
  "industry",
  "phone",
  "website",
  "city",
  "state",
  "zip",
  "country",
  "description",
  "numberofemployees",
  "annualrevenue",
  "createdate",
  "lastmodifieddate",
];

const DEFAULT_DEAL_PROPERTIES = [
  "dealname",
  "dealstage",
  "pipeline",
  "amount",
  "closedate",
  "hubspot_owner_id",
  "description",
  "createdate",
  "hs_lastmodifieddate",
];

// ============================================
// ERROR CLASSES
// ============================================

/**
 * Base error class for HubSpot API errors
 */
export class HubSpotError extends Error {
  public readonly statusCode: number;
  public readonly category?: string;
  public readonly correlationId?: string;
  public readonly errors?: Array<{ message: string; context?: Record<string, unknown> }>;

  constructor(
    message: string,
    statusCode: number,
    category?: string,
    correlationId?: string,
    errors?: Array<{ message: string; context?: Record<string, unknown> }>
  ) {
    super(message);
    this.name = "HubSpotError";
    this.statusCode = statusCode;
    this.category = category;
    this.correlationId = correlationId;
    this.errors = errors;
  }

  static fromApiError(error: HubSpotApiError, statusCode: number): HubSpotError {
    return new HubSpotError(
      error.message,
      statusCode,
      error.category,
      error.correlationId,
      error.errors
    );
  }
}

/**
 * Error thrown when rate limited
 */
export class HubSpotRateLimitError extends HubSpotError {
  public readonly retryAfter: number;

  constructor(message: string, retryAfter: number) {
    super(message, RATE_LIMIT_STATUS_CODE);
    this.name = "HubSpotRateLimitError";
    this.retryAfter = retryAfter;
  }
}

// ============================================
// CLIENT CLASS
// ============================================

/**
 * HubSpot API Client
 *
 * @example
 * ```typescript
 * const client = new HubSpotClient({
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
 * const contacts = await client.listContacts(100);
 * ```
 */
export class HubSpotClient {
  private accessToken?: string;
  private refreshToken?: string;
  private tokenExpiresAt?: Date;
  private readonly config: Required<
    Pick<HubSpotClientConfig, "baseUrl" | "timeout" | "maxRetries">
  > &
    Pick<HubSpotClientConfig, "oauthConfig" | "onTokenRefresh">;

  constructor(config: HubSpotClientConfig) {
    if (!config.accessToken) {
      throw new Error("accessToken must be provided");
    }
    this.accessToken = config.accessToken;
    this.refreshToken = config.refreshToken;
    this.tokenExpiresAt = config.tokenExpiresAt;
    this.config = {
      baseUrl: config.baseUrl ?? DEFAULT_BASE_URL,
      timeout: config.timeout ?? DEFAULT_TIMEOUT,
      maxRetries: config.maxRetries ?? DEFAULT_MAX_RETRIES,
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
  public updateTokens(tokens: HubSpotTokens): void {
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
      if (error instanceof HubSpotAuthError && error.requiresReauthorization) {
        throw error; // Re-throw auth errors that need user action
      }
      // Log but don't throw for other refresh errors - let the request proceed
      // and fail with proper API error if token is actually invalid
      console.warn("Failed to refresh HubSpot token:", error);
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
    options: HubSpotRequestOptions & {
      body?: unknown;
      query?: Record<string, string | number | boolean | undefined>;
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
    query?: Record<string, string | number | boolean | undefined>
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
   * Make the actual HTTP request
   */
  private async makeRequest(
    method: string,
    url: string,
    timeout: number,
    options: HubSpotRequestOptions & { body?: unknown }
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
      const retryAfter = parseInt(response.headers.get("Retry-After") ?? "10", 10);
      throw new HubSpotRateLimitError(
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
      let errorData: HubSpotApiError;
      try {
        errorData = await response.json();
      } catch {
        errorData = {
          status: "error",
          message: `HTTP ${response.status}: ${response.statusText}`,
          correlationId: "",
          category: "UNKNOWN",
        };
      }
      throw HubSpotError.fromApiError(errorData, response.status);
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
    if (error instanceof HubSpotRateLimitError) {
      return true;
    }

    // Retry on server errors
    if (error instanceof HubSpotError) {
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
    if (error instanceof HubSpotRateLimitError) {
      return error.retryAfter * 1000;
    }

    // Exponential backoff with jitter
    const baseDelay = 1000 * Math.pow(2, retryCount);
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
  // CONTACT ENDPOINTS
  // ============================================

  /**
   * List all contacts
   *
   * @param limit - Number of contacts to return (max 100)
   * @param after - Cursor for pagination
   * @param properties - Properties to include
   * @param options - Request options
   * @returns List of contacts with pagination info
   */
  async listContacts(
    limit: number = 100,
    after?: string,
    properties: string[] = DEFAULT_CONTACT_PROPERTIES,
    options?: HubSpotRequestOptions
  ): Promise<HubSpotListResponse<HubSpotContact>> {
    return this.request<HubSpotListResponse<HubSpotContact>>(
      "GET",
      "/crm/v3/objects/contacts",
      {
        ...options,
        query: {
          limit: Math.min(limit, 100),
          after,
          properties: properties.join(","),
        },
      }
    );
  }

  /**
   * Get a single contact by ID
   *
   * @param id - Contact ID
   * @param properties - Properties to include
   * @param options - Request options
   * @returns Contact details
   */
  async getContact(
    id: string,
    properties: string[] = DEFAULT_CONTACT_PROPERTIES,
    options?: HubSpotRequestOptions
  ): Promise<HubSpotContact> {
    return this.request<HubSpotContact>(
      "GET",
      `/crm/v3/objects/contacts/${id}`,
      {
        ...options,
        query: {
          properties: properties.join(","),
        },
      }
    );
  }

  /**
   * Get a contact by email
   *
   * @param email - Contact email
   * @param properties - Properties to include
   * @param options - Request options
   * @returns Contact details or null if not found
   */
  async getContactByEmail(
    email: string,
    properties: string[] = DEFAULT_CONTACT_PROPERTIES,
    options?: HubSpotRequestOptions
  ): Promise<HubSpotContact | null> {
    try {
      return await this.request<HubSpotContact>(
        "GET",
        `/crm/v3/objects/contacts/${email}`,
        {
          ...options,
          query: {
            idProperty: "email",
            properties: properties.join(","),
          },
        }
      );
    } catch (error) {
      if (error instanceof HubSpotError && error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Create a new contact
   *
   * @param data - Contact data
   * @param options - Request options
   * @returns Created contact
   */
  async createContact(
    data: HubSpotContactInput,
    options?: HubSpotRequestOptions
  ): Promise<HubSpotContact> {
    return this.request<HubSpotContact>(
      "POST",
      "/crm/v3/objects/contacts",
      {
        ...options,
        body: { properties: data },
      }
    );
  }

  /**
   * Update a contact
   *
   * @param id - Contact ID
   * @param data - Contact data to update
   * @param options - Request options
   * @returns Updated contact
   */
  async updateContact(
    id: string,
    data: Partial<HubSpotContactInput>,
    options?: HubSpotRequestOptions
  ): Promise<HubSpotContact> {
    return this.request<HubSpotContact>(
      "PATCH",
      `/crm/v3/objects/contacts/${id}`,
      {
        ...options,
        body: { properties: data },
      }
    );
  }

  /**
   * Search contacts
   *
   * @param searchRequest - Search criteria
   * @param options - Request options
   * @returns Search results
   */
  async searchContacts(
    searchRequest: HubSpotSearchContactsRequest,
    options?: HubSpotRequestOptions
  ): Promise<HubSpotListResponse<HubSpotContact>> {
    return this.request<HubSpotListResponse<HubSpotContact>>(
      "POST",
      "/crm/v3/objects/contacts/search",
      {
        ...options,
        body: {
          ...searchRequest,
          properties: searchRequest.properties ?? DEFAULT_CONTACT_PROPERTIES,
        },
      }
    );
  }

  // ============================================
  // COMPANY ENDPOINTS
  // ============================================

  /**
   * List all companies
   *
   * @param limit - Number of companies to return (max 100)
   * @param after - Cursor for pagination
   * @param properties - Properties to include
   * @param options - Request options
   * @returns List of companies with pagination info
   */
  async listCompanies(
    limit: number = 100,
    after?: string,
    properties: string[] = DEFAULT_COMPANY_PROPERTIES,
    options?: HubSpotRequestOptions
  ): Promise<HubSpotListResponse<HubSpotCompany>> {
    return this.request<HubSpotListResponse<HubSpotCompany>>(
      "GET",
      "/crm/v3/objects/companies",
      {
        ...options,
        query: {
          limit: Math.min(limit, 100),
          after,
          properties: properties.join(","),
        },
      }
    );
  }

  /**
   * Get a single company by ID
   *
   * @param id - Company ID
   * @param properties - Properties to include
   * @param options - Request options
   * @returns Company details
   */
  async getCompany(
    id: string,
    properties: string[] = DEFAULT_COMPANY_PROPERTIES,
    options?: HubSpotRequestOptions
  ): Promise<HubSpotCompany> {
    return this.request<HubSpotCompany>(
      "GET",
      `/crm/v3/objects/companies/${id}`,
      {
        ...options,
        query: {
          properties: properties.join(","),
        },
      }
    );
  }

  /**
   * Create a new company
   *
   * @param data - Company data
   * @param options - Request options
   * @returns Created company
   */
  async createCompany(
    data: HubSpotCompanyInput,
    options?: HubSpotRequestOptions
  ): Promise<HubSpotCompany> {
    return this.request<HubSpotCompany>(
      "POST",
      "/crm/v3/objects/companies",
      {
        ...options,
        body: { properties: data },
      }
    );
  }

  // ============================================
  // DEAL ENDPOINTS
  // ============================================

  /**
   * List all deals
   *
   * @param limit - Number of deals to return (max 100)
   * @param after - Cursor for pagination
   * @param properties - Properties to include
   * @param options - Request options
   * @returns List of deals with pagination info
   */
  async listDeals(
    limit: number = 100,
    after?: string,
    properties: string[] = DEFAULT_DEAL_PROPERTIES,
    options?: HubSpotRequestOptions
  ): Promise<HubSpotListResponse<HubSpotDeal>> {
    return this.request<HubSpotListResponse<HubSpotDeal>>(
      "GET",
      "/crm/v3/objects/deals",
      {
        ...options,
        query: {
          limit: Math.min(limit, 100),
          after,
          properties: properties.join(","),
        },
      }
    );
  }

  /**
   * Get a single deal by ID
   *
   * @param id - Deal ID
   * @param properties - Properties to include
   * @param options - Request options
   * @returns Deal details
   */
  async getDeal(
    id: string,
    properties: string[] = DEFAULT_DEAL_PROPERTIES,
    options?: HubSpotRequestOptions
  ): Promise<HubSpotDeal> {
    return this.request<HubSpotDeal>(
      "GET",
      `/crm/v3/objects/deals/${id}`,
      {
        ...options,
        query: {
          properties: properties.join(","),
        },
      }
    );
  }

  /**
   * Create a new deal
   *
   * @param data - Deal data
   * @param options - Request options
   * @returns Created deal
   */
  async createDeal(
    data: HubSpotDealInput,
    options?: HubSpotRequestOptions
  ): Promise<HubSpotDeal> {
    return this.request<HubSpotDeal>(
      "POST",
      "/crm/v3/objects/deals",
      {
        ...options,
        body: { properties: data },
      }
    );
  }

  /**
   * Update a deal
   *
   * @param id - Deal ID
   * @param data - Deal data to update
   * @param options - Request options
   * @returns Updated deal
   */
  async updateDeal(
    id: string,
    data: Partial<HubSpotDealInput>,
    options?: HubSpotRequestOptions
  ): Promise<HubSpotDeal> {
    return this.request<HubSpotDeal>(
      "PATCH",
      `/crm/v3/objects/deals/${id}`,
      {
        ...options,
        body: { properties: data },
      }
    );
  }

  // ============================================
  // NOTE ENDPOINTS
  // ============================================

  /**
   * Create a note and associate it with a contact
   *
   * @param contactId - Contact ID to associate the note with
   * @param noteBody - Note content
   * @param options - Request options
   * @returns Created note
   */
  async addNoteToContact(
    contactId: string,
    noteBody: string,
    options?: HubSpotRequestOptions
  ): Promise<HubSpotNote> {
    // Create the note
    const note = await this.request<HubSpotNote>(
      "POST",
      "/crm/v3/objects/notes",
      {
        ...options,
        body: {
          properties: {
            hs_note_body: noteBody,
            hs_timestamp: new Date().toISOString(),
          } as HubSpotNoteInput,
        },
      }
    );

    // Associate with contact
    await this.createAssociation("notes", note.id, "contacts", contactId, "note_to_contact");

    return note;
  }

  /**
   * Create a note and associate it with a deal
   *
   * @param dealId - Deal ID to associate the note with
   * @param noteBody - Note content
   * @param options - Request options
   * @returns Created note
   */
  async addNoteToDeal(
    dealId: string,
    noteBody: string,
    options?: HubSpotRequestOptions
  ): Promise<HubSpotNote> {
    // Create the note
    const note = await this.request<HubSpotNote>(
      "POST",
      "/crm/v3/objects/notes",
      {
        ...options,
        body: {
          properties: {
            hs_note_body: noteBody,
            hs_timestamp: new Date().toISOString(),
          } as HubSpotNoteInput,
        },
      }
    );

    // Associate with deal
    await this.createAssociation("notes", note.id, "deals", dealId, "note_to_deal");

    return note;
  }

  // ============================================
  // TASK ENDPOINTS
  // ============================================

  /**
   * Create a task and associate it with a contact
   *
   * @param contactId - Contact ID to associate the task with
   * @param taskData - Task data
   * @param options - Request options
   * @returns Created task
   */
  async createTaskForContact(
    contactId: string,
    taskData: HubSpotTaskInput,
    options?: HubSpotRequestOptions
  ): Promise<HubSpotTask> {
    // Create the task
    const task = await this.request<HubSpotTask>(
      "POST",
      "/crm/v3/objects/tasks",
      {
        ...options,
        body: {
          properties: {
            ...taskData,
            hs_timestamp: taskData.hs_timestamp ?? new Date().toISOString(),
          },
        },
      }
    );

    // Associate with contact
    await this.createAssociation("tasks", task.id, "contacts", contactId, "task_to_contact");

    return task;
  }

  /**
   * Create a task and associate it with a deal
   *
   * @param dealId - Deal ID to associate the task with
   * @param taskData - Task data
   * @param options - Request options
   * @returns Created task
   */
  async createTaskForDeal(
    dealId: string,
    taskData: HubSpotTaskInput,
    options?: HubSpotRequestOptions
  ): Promise<HubSpotTask> {
    // Create the task
    const task = await this.request<HubSpotTask>(
      "POST",
      "/crm/v3/objects/tasks",
      {
        ...options,
        body: {
          properties: {
            ...taskData,
            hs_timestamp: taskData.hs_timestamp ?? new Date().toISOString(),
          },
        },
      }
    );

    // Associate with deal
    await this.createAssociation("tasks", task.id, "deals", dealId, "task_to_deal");

    return task;
  }

  // ============================================
  // ASSOCIATION ENDPOINTS
  // ============================================

  /**
   * Create an association between two objects
   *
   * @param fromObjectType - Source object type
   * @param fromObjectId - Source object ID
   * @param toObjectType - Target object type
   * @param toObjectId - Target object ID
   * @param associationType - Type of association
   * @param options - Request options
   */
  async createAssociation(
    fromObjectType: string,
    fromObjectId: string,
    toObjectType: string,
    toObjectId: string,
    associationType: string,
    options?: HubSpotRequestOptions
  ): Promise<void> {
    await this.request<void>(
      "PUT",
      `/crm/v3/objects/${fromObjectType}/${fromObjectId}/associations/${toObjectType}/${toObjectId}/${associationType}`,
      options
    );
  }

  /**
   * Associate a contact with a deal
   *
   * @param contactId - Contact ID
   * @param dealId - Deal ID
   * @param options - Request options
   */
  async associateContactWithDeal(
    contactId: string,
    dealId: string,
    options?: HubSpotRequestOptions
  ): Promise<void> {
    await this.createAssociation("contacts", contactId, "deals", dealId, "contact_to_deal", options);
  }

  /**
   * Associate a company with a deal
   *
   * @param companyId - Company ID
   * @param dealId - Deal ID
   * @param options - Request options
   */
  async associateCompanyWithDeal(
    companyId: string,
    dealId: string,
    options?: HubSpotRequestOptions
  ): Promise<void> {
    await this.createAssociation("companies", companyId, "deals", dealId, "company_to_deal", options);
  }

  // ============================================
  // OWNER ENDPOINTS
  // ============================================

  /**
   * List all owners
   *
   * @param limit - Number of owners to return
   * @param after - Cursor for pagination
   * @param options - Request options
   * @returns List of owners
   */
  async listOwners(
    limit: number = 100,
    after?: string,
    options?: HubSpotRequestOptions
  ): Promise<HubSpotListResponse<HubSpotOwner>> {
    return this.request<HubSpotListResponse<HubSpotOwner>>(
      "GET",
      "/crm/v3/owners",
      {
        ...options,
        query: {
          limit: Math.min(limit, 100),
          after,
        },
      }
    );
  }

  /**
   * Get current owner (for the authenticated user)
   *
   * @param email - Email of the owner
   * @param options - Request options
   * @returns Owner details or null if not found
   */
  async getOwnerByEmail(
    email: string,
    options?: HubSpotRequestOptions
  ): Promise<HubSpotOwner | null> {
    const response = await this.listOwners(100, undefined, options);
    return response.results.find((owner) => owner.email === email) ?? null;
  }

  // ============================================
  // PIPELINE ENDPOINTS
  // ============================================

  /**
   * List all deal pipelines
   *
   * @param options - Request options
   * @returns List of pipelines
   */
  async listDealPipelines(
    options?: HubSpotRequestOptions
  ): Promise<HubSpotListResponse<HubSpotPipeline>> {
    return this.request<HubSpotListResponse<HubSpotPipeline>>(
      "GET",
      "/crm/v3/pipelines/deals",
      options
    );
  }

  /**
   * Get a deal pipeline by ID
   *
   * @param pipelineId - Pipeline ID
   * @param options - Request options
   * @returns Pipeline details
   */
  async getDealPipeline(
    pipelineId: string,
    options?: HubSpotRequestOptions
  ): Promise<HubSpotPipeline> {
    return this.request<HubSpotPipeline>(
      "GET",
      `/crm/v3/pipelines/deals/${pipelineId}`,
      options
    );
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Iterate over all contacts (handles pagination)
   *
   * @param pageSize - Number of contacts per page
   * @yields Contact objects
   */
  async *iterateContacts(
    pageSize: number = 100
  ): AsyncGenerator<HubSpotContact> {
    let after: string | undefined;

    while (true) {
      const response = await this.listContacts(pageSize, after);

      for (const contact of response.results) {
        yield contact;
      }

      if (!response.paging?.next?.after) {
        break;
      }

      after = response.paging.next.after;
    }
  }

  /**
   * Iterate over all companies (handles pagination)
   *
   * @param pageSize - Number of companies per page
   * @yields Company objects
   */
  async *iterateCompanies(
    pageSize: number = 100
  ): AsyncGenerator<HubSpotCompany> {
    let after: string | undefined;

    while (true) {
      const response = await this.listCompanies(pageSize, after);

      for (const company of response.results) {
        yield company;
      }

      if (!response.paging?.next?.after) {
        break;
      }

      after = response.paging.next.after;
    }
  }

  /**
   * Iterate over all deals (handles pagination)
   *
   * @param pageSize - Number of deals per page
   * @yields Deal objects
   */
  async *iterateDeals(
    pageSize: number = 100
  ): AsyncGenerator<HubSpotDeal> {
    let after: string | undefined;

    while (true) {
      const response = await this.listDeals(pageSize, after);

      for (const deal of response.results) {
        yield deal;
      }

      if (!response.paging?.next?.after) {
        break;
      }

      after = response.paging.next.after;
    }
  }

  /**
   * Find or create a contact by email
   *
   * @param email - Contact email
   * @param data - Contact data to use if creating
   * @param options - Request options
   * @returns Existing or newly created contact
   */
  async findOrCreateContact(
    email: string,
    data: Omit<HubSpotContactInput, "email">,
    options?: HubSpotRequestOptions
  ): Promise<{ contact: HubSpotContact; created: boolean }> {
    const existing = await this.getContactByEmail(email);

    if (existing) {
      return { contact: existing, created: false };
    }

    const created = await this.createContact({ email, ...data }, options);
    return { contact: created, created: true };
  }
}

// ============================================
// FACTORY FUNCTION
// ============================================

/**
 * Create a HubSpot client from stored tokens
 *
 * @param tokens - Stored OAuth tokens
 * @param onTokenRefresh - Callback when tokens are refreshed
 * @returns Configured HubSpot client
 */
export function createHubSpotClient(
  tokens: HubSpotTokens,
  onTokenRefresh?: (tokens: HubSpotTokens) => Promise<void>
): HubSpotClient {
  const clientId = process.env.HUBSPOT_CLIENT_ID;
  const clientSecret = process.env.HUBSPOT_CLIENT_SECRET;
  const redirectUri = process.env.HUBSPOT_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("HubSpot OAuth environment variables are not configured");
  }

  return new HubSpotClient({
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
