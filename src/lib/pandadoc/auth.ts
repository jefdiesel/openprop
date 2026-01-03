/**
 * PandaDoc OAuth2 Authentication Helpers
 *
 * Implements the OAuth2 authorization code flow for PandaDoc API
 * https://developers.pandadoc.com/reference/authentication
 */

import type {
  PandaDocOAuthConfig,
  PandaDocTokenResponse,
  PandaDocTokens,
} from "./types";

// ============================================
// CONSTANTS
// ============================================

const PANDADOC_OAUTH_BASE_URL = "https://app.pandadoc.com/oauth2";
const PANDADOC_API_BASE_URL = "https://api.pandadoc.com";

/**
 * Available OAuth2 scopes for PandaDoc API
 */
export const PANDADOC_SCOPES = {
  // Read access to documents
  READ_DOCUMENTS: "read+documents",
  // Create and edit documents
  WRITE_DOCUMENTS: "write+documents",
  // Read access to templates
  READ_TEMPLATES: "read+templates",
  // Read access to contacts
  READ_CONTACTS: "read+contacts",
  // Write access to contacts
  WRITE_CONTACTS: "write+contacts",
  // Read access to content library
  READ_CONTENT: "read+content",
  // Write access to content library
  WRITE_CONTENT: "write+content",
  // Read access to user info
  READ_USER: "read+user",
  // Read access to workspace info
  READ_WORKSPACE: "read+workspace",
  // Webhook management
  READ_WEBHOOKS: "read+webhooks",
  WRITE_WEBHOOKS: "write+webhooks",
  // Forms
  READ_FORMS: "read+forms",
  WRITE_FORMS: "write+forms",
} as const;

export type PandaDocScope = (typeof PANDADOC_SCOPES)[keyof typeof PANDADOC_SCOPES];

/**
 * Default scopes for document import functionality
 */
export const DEFAULT_IMPORT_SCOPES: PandaDocScope[] = [
  PANDADOC_SCOPES.READ_DOCUMENTS,
  PANDADOC_SCOPES.READ_TEMPLATES,
  PANDADOC_SCOPES.READ_CONTACTS,
  PANDADOC_SCOPES.READ_CONTENT,
  PANDADOC_SCOPES.READ_USER,
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get OAuth configuration from environment variables
 */
export function getOAuthConfigFromEnv(): PandaDocOAuthConfig {
  const clientId = process.env.PANDADOC_CLIENT_ID;
  const clientSecret = process.env.PANDADOC_CLIENT_SECRET;
  const redirectUri = process.env.PANDADOC_REDIRECT_URI;

  if (!clientId) {
    throw new Error("PANDADOC_CLIENT_ID environment variable is not set");
  }
  if (!clientSecret) {
    throw new Error("PANDADOC_CLIENT_SECRET environment variable is not set");
  }
  if (!redirectUri) {
    throw new Error("PANDADOC_REDIRECT_URI environment variable is not set");
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
function encodeScopes(scopes: PandaDocScope[]): string {
  return scopes.join(" ");
}

// ============================================
// OAUTH FLOW FUNCTIONS
// ============================================

/**
 * Generate the authorization URL for PandaDoc OAuth2 flow
 *
 * @param config - OAuth configuration
 * @param scopes - Requested scopes (defaults to import scopes)
 * @param state - Optional state parameter for CSRF protection
 * @returns The authorization URL to redirect the user to
 *
 * @example
 * ```typescript
 * const authUrl = generateAuthUrl(config, DEFAULT_IMPORT_SCOPES, crypto.randomUUID());
 * // Redirect user to authUrl
 * ```
 */
export function generateAuthUrl(
  config: PandaDocOAuthConfig,
  scopes: PandaDocScope[] = DEFAULT_IMPORT_SCOPES,
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

  return `${PANDADOC_OAUTH_BASE_URL}/authorize?${params.toString()}`;
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
  config: PandaDocOAuthConfig,
  code: string
): Promise<PandaDocTokens> {
  const response = await fetch(`${PANDADOC_API_BASE_URL}/oauth2/access_token`, {
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
    throw new PandaDocAuthError(
      `Failed to exchange code for tokens: ${errorDetail}`,
      response.status,
      errorDetail
    );
  }

  const data: PandaDocTokenResponse = await response.json();

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: new Date(Date.now() + data.expires_in * 1000),
    scope: data.scope,
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
  config: PandaDocOAuthConfig,
  refreshToken: string
): Promise<PandaDocTokens> {
  const response = await fetch(`${PANDADOC_API_BASE_URL}/oauth2/access_token`, {
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
      throw new PandaDocAuthError(
        `Refresh token is invalid or expired: ${errorDetail}`,
        response.status,
        errorDetail,
        true
      );
    }

    throw new PandaDocAuthError(
      `Failed to refresh access token: ${errorDetail}`,
      response.status,
      errorDetail
    );
  }

  const data: PandaDocTokenResponse = await response.json();

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: new Date(Date.now() + data.expires_in * 1000),
    scope: data.scope,
  };
}

/**
 * Revoke an access or refresh token
 *
 * @param config - OAuth configuration
 * @param token - The token to revoke
 * @param tokenTypeHint - Type of token being revoked
 */
export async function revokeToken(
  config: PandaDocOAuthConfig,
  token: string,
  tokenTypeHint: "access_token" | "refresh_token" = "access_token"
): Promise<void> {
  const response = await fetch(`${PANDADOC_API_BASE_URL}/oauth2/revoke`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      token,
      token_type_hint: tokenTypeHint,
    }).toString(),
  });

  // Revocation endpoint returns 200 even if token is invalid
  // This is per OAuth 2.0 spec
  if (!response.ok && response.status !== 200) {
    const errorText = await response.text();
    throw new PandaDocAuthError(
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
  tokens: PandaDocTokens,
  config: PandaDocOAuthConfig
): Promise<PandaDocTokens> {
  if (!isTokenExpired(tokens.expiresAt)) {
    return tokens;
  }

  return refreshAccessToken(config, tokens.refreshToken);
}

// ============================================
// ERROR HANDLING
// ============================================

/**
 * Custom error class for PandaDoc authentication errors
 */
export class PandaDocAuthError extends Error {
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
    this.name = "PandaDocAuthError";
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
