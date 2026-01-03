/**
 * Salesforce OAuth2 Authentication Helpers
 *
 * Implements the OAuth2 Web Server Flow for Salesforce API
 * Supports both production and sandbox environments
 * https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/intro_oauth_and_connected_apps.htm
 */

import type {
  SalesforceOAuthConfig,
  SalesforceTokenResponse,
  SalesforceTokens,
} from "./types";

// ============================================
// CONSTANTS
// ============================================

/**
 * Salesforce OAuth2 endpoints
 */
export const SALESFORCE_AUTH_URLS = {
  production: {
    authorize: "https://login.salesforce.com/services/oauth2/authorize",
    token: "https://login.salesforce.com/services/oauth2/token",
    revoke: "https://login.salesforce.com/services/oauth2/revoke",
  },
  sandbox: {
    authorize: "https://test.salesforce.com/services/oauth2/authorize",
    token: "https://test.salesforce.com/services/oauth2/token",
    revoke: "https://test.salesforce.com/services/oauth2/revoke",
  },
} as const;

/**
 * Available OAuth2 scopes for Salesforce API
 */
export const SALESFORCE_SCOPES = {
  // Access and manage data
  API: "api",
  // Perform requests at any time (refresh_token)
  REFRESH_TOKEN: "refresh_token",
  // Access the identity URL service
  ID: "id",
  // Access unique user identifiers
  OPENID: "openid",
  // Access the user's profile
  PROFILE: "profile",
  // Access the user's email
  EMAIL: "email",
  // Access custom permissions
  CUSTOM_PERMISSIONS: "custom_permissions",
  // Full access to all data
  FULL: "full",
  // Access to Chatter
  CHATTER_API: "chatter_api",
  // Web access
  WEB: "web",
  // Offline access (enables refresh_token)
  OFFLINE_ACCESS: "offline_access",
} as const;

export type SalesforceScope = (typeof SALESFORCE_SCOPES)[keyof typeof SALESFORCE_SCOPES];

/**
 * Default scopes for OpenProposal CRM integration
 */
export const DEFAULT_SALESFORCE_SCOPES: SalesforceScope[] = [
  SALESFORCE_SCOPES.API,
  SALESFORCE_SCOPES.REFRESH_TOKEN,
  SALESFORCE_SCOPES.OFFLINE_ACCESS,
  SALESFORCE_SCOPES.ID,
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get OAuth configuration from environment variables
 */
export function getOAuthConfigFromEnv(): SalesforceOAuthConfig {
  const clientId = process.env.SALESFORCE_CLIENT_ID;
  const clientSecret = process.env.SALESFORCE_CLIENT_SECRET;
  const redirectUri = process.env.SALESFORCE_REDIRECT_URI;

  if (!clientId) {
    throw new Error("SALESFORCE_CLIENT_ID environment variable is not set");
  }
  if (!clientSecret) {
    throw new Error("SALESFORCE_CLIENT_SECRET environment variable is not set");
  }
  if (!redirectUri) {
    throw new Error("SALESFORCE_REDIRECT_URI environment variable is not set");
  }

  return {
    clientId,
    clientSecret,
    redirectUri,
  };
}

/**
 * Get the OAuth base URLs based on environment type
 */
function getAuthUrls(isSandbox: boolean = false) {
  return isSandbox ? SALESFORCE_AUTH_URLS.sandbox : SALESFORCE_AUTH_URLS.production;
}

/**
 * Encode scopes for URL
 */
function encodeScopes(scopes: SalesforceScope[]): string {
  return scopes.join(" ");
}

// ============================================
// OAUTH FLOW FUNCTIONS
// ============================================

/**
 * Generate the authorization URL for Salesforce OAuth2 flow
 *
 * @param config - OAuth configuration
 * @param scopes - Requested scopes (defaults to API scopes)
 * @param state - Optional state parameter for CSRF protection
 * @param isSandbox - Whether to use sandbox environment
 * @returns The authorization URL to redirect the user to
 *
 * @example
 * ```typescript
 * const authUrl = generateAuthUrl(config, DEFAULT_SALESFORCE_SCOPES, crypto.randomUUID(), false);
 * // Redirect user to authUrl
 * ```
 */
export function generateAuthUrl(
  config: SalesforceOAuthConfig,
  scopes: SalesforceScope[] = DEFAULT_SALESFORCE_SCOPES,
  state?: string,
  isSandbox: boolean = false
): string {
  const urls = getAuthUrls(isSandbox);

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: encodeScopes(scopes),
    response_type: "code",
    // Prompt for login each time to ensure user chooses correct org
    prompt: "login consent",
  });

  if (state) {
    params.set("state", state);
  }

  return `${urls.authorize}?${params.toString()}`;
}

/**
 * Exchange an authorization code for access and refresh tokens
 *
 * @param config - OAuth configuration
 * @param code - The authorization code received from the callback
 * @param isSandbox - Whether to use sandbox environment
 * @returns The token response with access token, refresh token, and instance URL
 *
 * @example
 * ```typescript
 * const tokens = await exchangeCodeForTokens(config, code, false);
 * // Store tokens securely
 * ```
 */
export async function exchangeCodeForTokens(
  config: SalesforceOAuthConfig,
  code: string,
  isSandbox: boolean = false
): Promise<SalesforceTokens> {
  const urls = getAuthUrls(isSandbox);

  const response = await fetch(urls.token, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      code,
    }).toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorDetail: string;
    try {
      const errorJson = JSON.parse(errorText);
      errorDetail = errorJson.error_description || errorJson.error || errorText;
    } catch {
      errorDetail = errorText;
    }
    throw new SalesforceAuthError(
      `Failed to exchange code for tokens: ${errorDetail}`,
      response.status,
      errorDetail
    );
  }

  const data: SalesforceTokenResponse = await response.json();

  // Extract user ID from the identity URL
  // Format: https://login.salesforce.com/id/00D...../005.....
  let userId: string | undefined;
  if (data.id) {
    const idParts = data.id.split("/");
    userId = idParts[idParts.length - 1];
  }

  // Salesforce access tokens typically expire in 2 hours
  // We'll set a conservative 1.5 hours to refresh before expiration
  const expiresAt = new Date(Date.now() + 90 * 60 * 1000);

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    instanceUrl: data.instance_url,
    expiresAt,
    userId,
  };
}

/**
 * Refresh an access token using a refresh token
 *
 * @param config - OAuth configuration
 * @param refreshToken - The refresh token from the initial authorization
 * @param instanceUrl - The Salesforce instance URL
 * @param isSandbox - Whether to use sandbox environment
 * @returns New token response with fresh access token
 *
 * @example
 * ```typescript
 * const newTokens = await refreshAccessToken(config, storedRefreshToken, instanceUrl, false);
 * // Update stored tokens
 * ```
 */
export async function refreshAccessToken(
  config: SalesforceOAuthConfig,
  refreshToken: string,
  instanceUrl: string,
  isSandbox: boolean = false
): Promise<SalesforceTokens> {
  const urls = getAuthUrls(isSandbox);

  const response = await fetch(urls.token, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: refreshToken,
    }).toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorDetail: string;
    try {
      const errorJson = JSON.parse(errorText);
      errorDetail = errorJson.error_description || errorJson.error || errorText;
    } catch {
      errorDetail = errorText;
    }

    // Check if refresh token is expired/invalid
    if (response.status === 400 || response.status === 401) {
      throw new SalesforceAuthError(
        `Refresh token is invalid or expired: ${errorDetail}`,
        response.status,
        errorDetail,
        true
      );
    }

    throw new SalesforceAuthError(
      `Failed to refresh access token: ${errorDetail}`,
      response.status,
      errorDetail
    );
  }

  const data: Partial<SalesforceTokenResponse> = await response.json();

  // Note: Refresh token response may not include a new refresh token
  // We keep the existing one if not returned
  const expiresAt = new Date(Date.now() + 90 * 60 * 1000);

  return {
    accessToken: data.access_token!,
    refreshToken: data.refresh_token || refreshToken,
    instanceUrl: data.instance_url || instanceUrl,
    expiresAt,
  };
}

/**
 * Revoke an access or refresh token
 *
 * @param token - The token to revoke
 * @param isSandbox - Whether to use sandbox environment
 */
export async function revokeToken(
  token: string,
  isSandbox: boolean = false
): Promise<void> {
  const urls = getAuthUrls(isSandbox);

  const response = await fetch(urls.revoke, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      token,
    }).toString(),
  });

  // Salesforce revocation endpoint returns 200 even if token is invalid
  if (!response.ok && response.status !== 200) {
    const errorText = await response.text();
    throw new SalesforceAuthError(
      `Failed to revoke token: ${errorText}`,
      response.status,
      errorText
    );
  }
}

// ============================================
// TOKEN VALIDATION
// ============================================

/**
 * Check if a token is expired or about to expire
 *
 * @param expiresAt - Token expiration date
 * @param bufferSeconds - Buffer time before actual expiration (default: 60 seconds)
 * @returns True if token is expired or will expire within buffer time
 */
export function isTokenExpired(expiresAt: Date, bufferSeconds: number = 60): boolean {
  const bufferMs = bufferSeconds * 1000;
  return Date.now() >= expiresAt.getTime() - bufferMs;
}

/**
 * Validate stored tokens and refresh if necessary
 *
 * @param tokens - Current tokens
 * @param config - OAuth configuration
 * @param isSandbox - Whether to use sandbox environment
 * @returns Valid tokens (either original or refreshed)
 */
export async function ensureValidTokens(
  tokens: SalesforceTokens,
  config: SalesforceOAuthConfig,
  isSandbox: boolean = false
): Promise<SalesforceTokens> {
  if (!isTokenExpired(tokens.expiresAt)) {
    return tokens;
  }

  return refreshAccessToken(config, tokens.refreshToken, tokens.instanceUrl, isSandbox);
}

// ============================================
// ERROR HANDLING
// ============================================

/**
 * Custom error class for Salesforce authentication errors
 */
export class SalesforceAuthError extends Error {
  public readonly statusCode: number;
  public readonly errorDetail: string;
  public readonly requiresReauthorization: boolean;

  constructor(
    message: string,
    statusCode: number,
    errorDetail: string,
    requiresReauthorization: boolean = false
  ) {
    super(message);
    this.name = "SalesforceAuthError";
    this.statusCode = statusCode;
    this.errorDetail = errorDetail;
    this.requiresReauthorization = requiresReauthorization;
  }
}

// ============================================
// STATE MANAGEMENT HELPERS
// ============================================

/**
 * Generate a cryptographically secure state parameter
 * Use this to prevent CSRF attacks
 */
export function generateState(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older Node.js versions
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * State data structure for OAuth flow
 */
export interface OAuthStateData {
  nonce: string;
  userId?: string;
  redirectPath?: string;
  timestamp: number;
  isSandbox: boolean;
}

/**
 * Encode state data as a base64 string
 */
export function encodeStateData(data: OAuthStateData): string {
  return Buffer.from(JSON.stringify(data)).toString("base64url");
}

/**
 * Decode state data from a base64 string
 */
export function decodeStateData(state: string): OAuthStateData | null {
  try {
    const decoded = Buffer.from(state, "base64url").toString("utf-8");
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/**
 * Validate state parameter age (prevent replay attacks)
 *
 * @param timestamp - Timestamp from state data
 * @param maxAgeMs - Maximum age in milliseconds (default: 10 minutes)
 */
export function isStateValid(timestamp: number, maxAgeMs: number = 10 * 60 * 1000): boolean {
  return Date.now() - timestamp < maxAgeMs;
}

// ============================================
// IDENTITY HELPERS
// ============================================

/**
 * Salesforce identity response from /id endpoint
 */
export interface SalesforceIdentity {
  id: string;
  user_id: string;
  organization_id: string;
  username: string;
  display_name: string;
  email: string;
  first_name?: string;
  last_name?: string;
  photos?: {
    picture?: string;
    thumbnail?: string;
  };
  urls?: {
    enterprise?: string;
    metadata?: string;
    partner?: string;
    rest?: string;
    sobjects?: string;
    search?: string;
    query?: string;
    recent?: string;
    tooling_soap?: string;
    tooling_rest?: string;
    profile?: string;
  };
  active: boolean;
  user_type: string;
  language?: string;
  locale?: string;
  utcOffset?: number;
  last_modified_date?: string;
}

/**
 * Get user identity information from the identity URL
 *
 * @param accessToken - Valid access token
 * @param identityUrl - Identity URL from token response (the 'id' field)
 * @returns User identity information
 */
export async function getUserIdentity(
  accessToken: string,
  identityUrl: string
): Promise<SalesforceIdentity> {
  const response = await fetch(identityUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new SalesforceAuthError(
      `Failed to get user identity: ${errorText}`,
      response.status,
      errorText
    );
  }

  return response.json();
}
