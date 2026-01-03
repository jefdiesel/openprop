/**
 * HubSpot OAuth2 Authentication Helpers
 *
 * Implements the OAuth2 authorization code flow for HubSpot API
 * https://developers.hubspot.com/docs/api/oauth-quickstart-guide
 */

import type {
  HubSpotOAuthConfig,
  HubSpotTokenResponse,
  HubSpotTokens,
} from "./types";

// ============================================
// CONSTANTS
// ============================================

const HUBSPOT_OAUTH_BASE_URL = "https://app.hubspot.com/oauth/authorize";
const HUBSPOT_API_BASE_URL = "https://api.hubapi.com";

/**
 * Available OAuth2 scopes for HubSpot API
 */
export const HUBSPOT_SCOPES = {
  // Contact scopes
  CONTACTS_READ: "crm.objects.contacts.read",
  CONTACTS_WRITE: "crm.objects.contacts.write",

  // Company scopes
  COMPANIES_READ: "crm.objects.companies.read",
  COMPANIES_WRITE: "crm.objects.companies.write",

  // Deal scopes
  DEALS_READ: "crm.objects.deals.read",
  DEALS_WRITE: "crm.objects.deals.write",

  // Owner scopes
  OWNERS_READ: "crm.objects.owners.read",

  // Line items
  LINE_ITEMS_READ: "crm.objects.line_items.read",
  LINE_ITEMS_WRITE: "crm.objects.line_items.write",

  // Quotes
  QUOTES_READ: "crm.objects.quotes.read",
  QUOTES_WRITE: "crm.objects.quotes.write",

  // Schema (for custom objects)
  SCHEMAS_READ: "crm.schemas.read",

  // Timeline events
  TIMELINE: "timeline",

  // OAuth
  OAUTH: "oauth",
} as const;

export type HubSpotScope = (typeof HUBSPOT_SCOPES)[keyof typeof HUBSPOT_SCOPES];

/**
 * Default scopes for CRM integration
 */
export const DEFAULT_CRM_SCOPES: HubSpotScope[] = [
  HUBSPOT_SCOPES.CONTACTS_READ,
  HUBSPOT_SCOPES.CONTACTS_WRITE,
  HUBSPOT_SCOPES.COMPANIES_READ,
  HUBSPOT_SCOPES.DEALS_READ,
  HUBSPOT_SCOPES.DEALS_WRITE,
  HUBSPOT_SCOPES.OWNERS_READ,
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get OAuth configuration from environment variables
 */
export function getOAuthConfigFromEnv(): HubSpotOAuthConfig {
  const clientId = process.env.HUBSPOT_CLIENT_ID;
  const clientSecret = process.env.HUBSPOT_CLIENT_SECRET;
  const redirectUri = process.env.HUBSPOT_REDIRECT_URI;

  if (!clientId) {
    throw new Error("HUBSPOT_CLIENT_ID environment variable is not set");
  }
  if (!clientSecret) {
    throw new Error("HUBSPOT_CLIENT_SECRET environment variable is not set");
  }
  if (!redirectUri) {
    throw new Error("HUBSPOT_REDIRECT_URI environment variable is not set");
  }

  return {
    clientId,
    clientSecret,
    redirectUri,
  };
}

// ============================================
// OAUTH FLOW FUNCTIONS
// ============================================

/**
 * Generate the authorization URL for HubSpot OAuth2 flow
 *
 * @param config - OAuth configuration
 * @param scopes - Requested scopes (defaults to CRM scopes)
 * @param state - Optional state parameter for CSRF protection
 * @returns The authorization URL to redirect the user to
 *
 * @example
 * ```typescript
 * const authUrl = generateAuthUrl(config, DEFAULT_CRM_SCOPES, crypto.randomUUID());
 * // Redirect user to authUrl
 * ```
 */
export function generateAuthUrl(
  config: HubSpotOAuthConfig,
  scopes: HubSpotScope[] = DEFAULT_CRM_SCOPES,
  state?: string
): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: scopes.join(" "),
  });

  if (state) {
    params.set("state", state);
  }

  return `${HUBSPOT_OAUTH_BASE_URL}?${params.toString()}`;
}

/**
 * Exchange an authorization code for access and refresh tokens
 *
 * @param config - OAuth configuration
 * @param code - The authorization code received from the callback
 * @returns The token response with access token, refresh token, and expiration
 *
 * @example
 * ```typescript
 * // In your callback handler
 * const tokens = await exchangeCodeForTokens(config, code);
 * // Store tokens securely
 * ```
 */
export async function exchangeCodeForTokens(
  config: HubSpotOAuthConfig,
  code: string
): Promise<HubSpotTokens> {
  const response = await fetch(`${HUBSPOT_API_BASE_URL}/oauth/v1/token`, {
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
      errorDetail = errorJson.message || errorJson.error_description || errorJson.error || errorText;
    } catch {
      errorDetail = errorText;
    }
    throw new HubSpotAuthError(
      `Failed to exchange code for tokens: ${errorDetail}`,
      response.status,
      errorDetail
    );
  }

  const data: HubSpotTokenResponse = await response.json();

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: new Date(Date.now() + data.expires_in * 1000),
  };
}

/**
 * Refresh an access token using a refresh token
 *
 * @param config - OAuth configuration
 * @param refreshToken - The refresh token from the initial authorization
 * @returns New token response with fresh access token
 *
 * @example
 * ```typescript
 * // When access token is expired
 * const newTokens = await refreshAccessToken(config, storedRefreshToken);
 * // Update stored tokens
 * ```
 */
export async function refreshAccessToken(
  config: HubSpotOAuthConfig,
  refreshToken: string
): Promise<HubSpotTokens> {
  const response = await fetch(`${HUBSPOT_API_BASE_URL}/oauth/v1/token`, {
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
      errorDetail = errorJson.message || errorJson.error_description || errorJson.error || errorText;
    } catch {
      errorDetail = errorText;
    }

    // Check if refresh token is expired/invalid
    if (response.status === 400 || response.status === 401) {
      throw new HubSpotAuthError(
        `Refresh token is invalid or expired: ${errorDetail}`,
        response.status,
        errorDetail,
        true
      );
    }

    throw new HubSpotAuthError(
      `Failed to refresh access token: ${errorDetail}`,
      response.status,
      errorDetail
    );
  }

  const data: HubSpotTokenResponse = await response.json();

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: new Date(Date.now() + data.expires_in * 1000),
  };
}

/**
 * Get access token info (includes hub_id, user, scopes)
 *
 * @param accessToken - The access token to verify
 * @returns Token info including hub ID and user info
 */
export async function getAccessTokenInfo(accessToken: string): Promise<HubSpotTokenInfo> {
  const response = await fetch(`${HUBSPOT_API_BASE_URL}/oauth/v1/access-tokens/${accessToken}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new HubSpotAuthError(
      `Failed to get token info: ${errorText}`,
      response.status,
      errorText
    );
  }

  return response.json();
}

/**
 * Revoke a refresh token
 *
 * @param config - OAuth configuration
 * @param refreshToken - The refresh token to revoke
 */
export async function revokeRefreshToken(
  config: HubSpotOAuthConfig,
  refreshToken: string
): Promise<void> {
  const response = await fetch(`${HUBSPOT_API_BASE_URL}/oauth/v1/refresh-tokens/${refreshToken}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  // HubSpot returns 204 No Content on success, or 200
  if (!response.ok && response.status !== 204) {
    const errorText = await response.text();
    console.warn(`Failed to revoke HubSpot refresh token: ${errorText}`);
    // Don't throw - revocation failure shouldn't block disconnection
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
 * @returns Valid tokens (either original or refreshed)
 */
export async function ensureValidTokens(
  tokens: HubSpotTokens,
  config: HubSpotOAuthConfig
): Promise<HubSpotTokens> {
  if (!isTokenExpired(tokens.expiresAt)) {
    return tokens;
  }

  return refreshAccessToken(config, tokens.refreshToken);
}

// ============================================
// ERROR HANDLING
// ============================================

/**
 * Custom error class for HubSpot authentication errors
 */
export class HubSpotAuthError extends Error {
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
    this.name = "HubSpotAuthError";
    this.statusCode = statusCode;
    this.errorDetail = errorDetail;
    this.requiresReauthorization = requiresReauthorization;
  }
}

// ============================================
// TOKEN INFO TYPE
// ============================================

export interface HubSpotTokenInfo {
  token: string;
  user: string;
  hub_domain: string;
  scopes: string[];
  hub_id: number;
  app_id: number;
  expires_in: number;
  user_id: number;
  token_type: string;
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
 * Create a state object with additional metadata
 */
export interface OAuthStateData {
  nonce: string;
  userId?: string;
  redirectPath?: string;
  timestamp: number;
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
