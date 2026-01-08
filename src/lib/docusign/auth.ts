/**
 * DocuSign OAuth2 Authentication Helpers
 *
 * Implements the OAuth2 authorization code flow for DocuSign API
 * https://developers.docusign.com/platform/auth/authcode/
 */

import type {
  DocuSignOAuthConfig,
  DocuSignTokenResponse,
  DocuSignTokens,
  DocuSignUserInfo,
} from "./types";

// ============================================
// CONSTANTS
// ============================================

// Use demo environment by default, override with env var
const DOCUSIGN_ENV = process.env.DOCUSIGN_ENV || "demo";
const DOCUSIGN_OAUTH_BASE_URL =
  DOCUSIGN_ENV === "production"
    ? "https://account.docusign.com"
    : "https://account-d.docusign.com";

const DOCUSIGN_API_BASE_URL =
  DOCUSIGN_ENV === "production"
    ? "https://docusign.net/restapi"
    : "https://demo.docusign.net/restapi";

/**
 * Available OAuth2 scopes for DocuSign API
 */
export const DOCUSIGN_SCOPES = {
  // Full signature access (read and write)
  SIGNATURE: "signature",
  // Extended signature access (includes impersonation)
  SIGNATURE_EXTENDED: "extended",
  // Impersonation scope (allows acting on behalf of user)
  IMPERSONATION: "impersonation",
} as const;

export type DocuSignScope = (typeof DOCUSIGN_SCOPES)[keyof typeof DOCUSIGN_SCOPES];

/**
 * Default scopes for document import and send functionality
 */
export const DEFAULT_SCOPES: DocuSignScope[] = [
  DOCUSIGN_SCOPES.SIGNATURE,
  DOCUSIGN_SCOPES.SIGNATURE_EXTENDED,
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get OAuth configuration from environment variables
 */
export function getOAuthConfigFromEnv(): DocuSignOAuthConfig {
  const clientId = process.env.DOCUSIGN_CLIENT_ID;
  const clientSecret = process.env.DOCUSIGN_CLIENT_SECRET;
  const redirectUri = process.env.DOCUSIGN_REDIRECT_URI;

  if (!clientId) {
    throw new Error("DOCUSIGN_CLIENT_ID environment variable is not set");
  }
  if (!clientSecret) {
    throw new Error("DOCUSIGN_CLIENT_SECRET environment variable is not set");
  }
  if (!redirectUri) {
    throw new Error("DOCUSIGN_REDIRECT_URI environment variable is not set");
  }

  return {
    clientId,
    clientSecret,
    redirectUri,
  };
}

/**
 * Encode scopes for URL
 */
function encodeScopes(scopes: DocuSignScope[]): string {
  return scopes.join(" ");
}

// ============================================
// OAUTH FLOW FUNCTIONS
// ============================================

/**
 * Generate the authorization URL for DocuSign OAuth2 flow
 *
 * @param config - OAuth configuration
 * @param scopes - Requested scopes (defaults to signature scopes)
 * @param state - Optional state parameter for CSRF protection
 * @returns The authorization URL to redirect the user to
 *
 * @example
 * ```typescript
 * const authUrl = generateAuthUrl(config, DEFAULT_SCOPES, crypto.randomUUID());
 * // Redirect user to authUrl
 * ```
 */
export function generateAuthUrl(
  config: DocuSignOAuthConfig,
  scopes: DocuSignScope[] = DEFAULT_SCOPES,
  state?: string
): string {
  const params = new URLSearchParams({
    response_type: "code",
    scope: encodeScopes(scopes),
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
  });

  if (state) {
    params.set("state", state);
  }

  return `${DOCUSIGN_OAUTH_BASE_URL}/oauth/auth?${params.toString()}`;
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
  config: DocuSignOAuthConfig,
  code: string
): Promise<DocuSignTokens> {
  const response = await fetch(`${DOCUSIGN_OAUTH_BASE_URL}/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
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
    throw new DocuSignAuthError(
      `Failed to exchange code for tokens: ${errorDetail}`,
      response.status,
      errorDetail
    );
  }

  const data: DocuSignTokenResponse = await response.json();

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
  config: DocuSignOAuthConfig,
  refreshToken: string
): Promise<DocuSignTokens> {
  const response = await fetch(`${DOCUSIGN_OAUTH_BASE_URL}/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64")}`,
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
      throw new DocuSignAuthError(
        `Refresh token is invalid or expired: ${errorDetail}`,
        response.status,
        errorDetail,
        true
      );
    }

    throw new DocuSignAuthError(
      `Failed to refresh access token: ${errorDetail}`,
      response.status,
      errorDetail
    );
  }

  const data: DocuSignTokenResponse = await response.json();

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: new Date(Date.now() + data.expires_in * 1000),
  };
}

/**
 * Revoke an access or refresh token
 *
 * @param config - OAuth configuration
 * @param token - The token to revoke
 */
export async function revokeToken(
  config: DocuSignOAuthConfig,
  token: string
): Promise<void> {
  const response = await fetch(`${DOCUSIGN_OAUTH_BASE_URL}/oauth/revoke`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      token,
    }).toString(),
  });

  // Revocation endpoint returns 200 even if token is invalid
  // This is per OAuth 2.0 spec
  if (!response.ok && response.status !== 200) {
    const errorText = await response.text();
    throw new DocuSignAuthError(
      `Failed to revoke token: ${errorText}`,
      response.status,
      errorText
    );
  }
}

/**
 * Get user info including account details
 *
 * @param accessToken - Access token
 * @returns User info with account details including base URIs
 *
 * @example
 * ```typescript
 * const userInfo = await getUserInfo(tokens.accessToken);
 * const defaultAccount = userInfo.accounts.find(a => a.is_default);
 * const accountId = defaultAccount.account_id;
 * const baseUri = defaultAccount.base_uri;
 * ```
 */
export async function getUserInfo(accessToken: string): Promise<DocuSignUserInfo> {
  const response = await fetch(`${DOCUSIGN_OAUTH_BASE_URL}/oauth/userinfo`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new DocuSignAuthError(
      `Failed to get user info: ${errorText}`,
      response.status,
      errorText
    );
  }

  return response.json();
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
  tokens: DocuSignTokens,
  config: DocuSignOAuthConfig
): Promise<DocuSignTokens> {
  if (!isTokenExpired(tokens.expiresAt)) {
    return tokens;
  }

  return refreshAccessToken(config, tokens.refreshToken);
}

// ============================================
// ERROR HANDLING
// ============================================

/**
 * Custom error class for DocuSign authentication errors
 */
export class DocuSignAuthError extends Error {
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
    this.name = "DocuSignAuthError";
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
