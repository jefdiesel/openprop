/**
 * QuickBooks OAuth2 Authentication Helpers
 *
 * Implements the OAuth2 authorization code flow for QuickBooks Online API
 * https://developer.intuit.com/app/developer/qbo/docs/develop/authentication-and-authorization/oauth-2.0
 */

import type {
  QuickBooksOAuthConfig,
  QuickBooksTokenResponse,
  QuickBooksTokens,
} from "./types";

// ============================================
// CONSTANTS
// ============================================

const INTUIT_OAUTH_BASE_URL = "https://appcenter.intuit.com/connect/oauth2";
const INTUIT_TOKEN_URL = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer";
const INTUIT_REVOKE_URL = "https://developer.api.intuit.com/v2/oauth2/tokens/revoke";

/**
 * Available OAuth2 scopes for QuickBooks API
 */
export const QUICKBOOKS_SCOPES = {
  ACCOUNTING: "com.intuit.quickbooks.accounting",
  PAYMENT: "com.intuit.quickbooks.payment",
  PAYROLL: "com.intuit.quickbooks.payroll",
  PAYROLL_TIMETRACKING: "com.intuit.quickbooks.payroll.timetracking",
  PAYROLL_BENEFITS: "com.intuit.quickbooks.payroll.benefits",
  PROFILE_EMAIL: "profile email",
  OPENID: "openid",
} as const;

export type QuickBooksScope = (typeof QUICKBOOKS_SCOPES)[keyof typeof QUICKBOOKS_SCOPES];

/**
 * Default scopes for accounting integration
 */
export const DEFAULT_ACCOUNTING_SCOPES: QuickBooksScope[] = [
  QUICKBOOKS_SCOPES.ACCOUNTING,
  QUICKBOOKS_SCOPES.OPENID,
  QUICKBOOKS_SCOPES.PROFILE_EMAIL,
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get OAuth configuration from environment variables
 */
export function getOAuthConfigFromEnv(): QuickBooksOAuthConfig {
  const clientId = process.env.QUICKBOOKS_CLIENT_ID;
  const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET;
  const redirectUri = process.env.QUICKBOOKS_REDIRECT_URI;
  const environment = (process.env.QUICKBOOKS_ENVIRONMENT || 'production') as 'sandbox' | 'production';

  if (!clientId) {
    throw new Error("QUICKBOOKS_CLIENT_ID environment variable is not set");
  }
  if (!clientSecret) {
    throw new Error("QUICKBOOKS_CLIENT_SECRET environment variable is not set");
  }
  if (!redirectUri) {
    throw new Error("QUICKBOOKS_REDIRECT_URI environment variable is not set");
  }

  return {
    clientId,
    clientSecret,
    redirectUri,
    environment,
  };
}

/**
 * Encode scopes for URL
 */
function encodeScopes(scopes: QuickBooksScope[]): string {
  return scopes.join(" ");
}

// ============================================
// OAUTH FLOW FUNCTIONS
// ============================================

/**
 * Generate the authorization URL for QuickBooks OAuth2 flow
 *
 * @param config - OAuth configuration
 * @param scopes - Requested scopes (defaults to accounting scopes)
 * @param state - Optional state parameter for CSRF protection
 * @returns The authorization URL to redirect the user to
 *
 * @example
 * ```typescript
 * const authUrl = generateAuthUrl(config, DEFAULT_ACCOUNTING_SCOPES, crypto.randomUUID());
 * // Redirect user to authUrl
 * ```
 */
export function generateAuthUrl(
  config: QuickBooksOAuthConfig,
  scopes: QuickBooksScope[] = DEFAULT_ACCOUNTING_SCOPES,
  state?: string
): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: encodeScopes(scopes),
    response_type: "code",
  });

  if (state) {
    params.set("state", state);
  }

  return `${INTUIT_OAUTH_BASE_URL}?${params.toString()}`;
}

/**
 * Exchange an authorization code for access and refresh tokens
 *
 * @param config - OAuth configuration
 * @param code - The authorization code received from the callback
 * @param realmId - The QuickBooks company ID from the callback
 * @returns The token response with access token, refresh token, and expiration
 *
 * @example
 * ```typescript
 * // In your callback handler
 * const tokens = await exchangeCodeForTokens(config, code, realmId);
 * // Store tokens securely
 * ```
 */
export async function exchangeCodeForTokens(
  config: QuickBooksOAuthConfig,
  code: string,
  realmId: string
): Promise<QuickBooksTokens> {
  const authHeader = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');

  const response = await fetch(INTUIT_TOKEN_URL, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${authHeader}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: config.redirectUri,
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
    throw new QuickBooksAuthError(
      `Failed to exchange code for tokens: ${errorDetail}`,
      response.status,
      errorDetail
    );
  }

  const data: QuickBooksTokenResponse = await response.json();

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: new Date(Date.now() + data.expires_in * 1000),
    refreshTokenExpiresAt: new Date(Date.now() + data.x_refresh_token_expires_in * 1000),
    realmId,
  };
}

/**
 * Refresh an access token using a refresh token
 *
 * @param config - OAuth configuration
 * @param refreshToken - The refresh token from the initial authorization
 * @param realmId - The QuickBooks company ID
 * @returns New token response with fresh access token
 *
 * @example
 * ```typescript
 * // When access token is expired
 * const newTokens = await refreshAccessToken(config, storedRefreshToken, realmId);
 * // Update stored tokens
 * ```
 */
export async function refreshAccessToken(
  config: QuickBooksOAuthConfig,
  refreshToken: string,
  realmId: string
): Promise<QuickBooksTokens> {
  const authHeader = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');

  const response = await fetch(INTUIT_TOKEN_URL, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${authHeader}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
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
      throw new QuickBooksAuthError(
        `Refresh token is invalid or expired: ${errorDetail}`,
        response.status,
        errorDetail,
        true
      );
    }

    throw new QuickBooksAuthError(
      `Failed to refresh access token: ${errorDetail}`,
      response.status,
      errorDetail
    );
  }

  const data: QuickBooksTokenResponse = await response.json();

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: new Date(Date.now() + data.expires_in * 1000),
    refreshTokenExpiresAt: new Date(Date.now() + data.x_refresh_token_expires_in * 1000),
    realmId,
  };
}

/**
 * Revoke an access or refresh token
 *
 * @param config - OAuth configuration
 * @param token - The token to revoke
 */
export async function revokeToken(
  config: QuickBooksOAuthConfig,
  token: string
): Promise<void> {
  const authHeader = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');

  const response = await fetch(INTUIT_REVOKE_URL, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": `Basic ${authHeader}`,
    },
    body: JSON.stringify({
      token,
    }),
  });

  if (!response.ok && response.status !== 200) {
    const errorText = await response.text();
    throw new QuickBooksAuthError(
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
 * @returns Valid tokens (either original or refreshed)
 */
export async function ensureValidTokens(
  tokens: QuickBooksTokens,
  config: QuickBooksOAuthConfig
): Promise<QuickBooksTokens> {
  if (!isTokenExpired(tokens.expiresAt)) {
    return tokens;
  }

  return refreshAccessToken(config, tokens.refreshToken, tokens.realmId);
}

// ============================================
// ERROR HANDLING
// ============================================

/**
 * Custom error class for QuickBooks authentication errors
 */
export class QuickBooksAuthError extends Error {
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
    this.name = "QuickBooksAuthError";
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
