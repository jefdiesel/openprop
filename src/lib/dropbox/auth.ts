/**
 * Dropbox OAuth2 Authentication Helpers
 *
 * Implements the OAuth2 authorization code flow for Dropbox API
 * https://developers.dropbox.com/oauth-guide
 */

import type {
  DropboxOAuthConfig,
  DropboxTokenResponse,
  DropboxTokens,
} from "./types";

// ============================================
// CONSTANTS
// ============================================

const DROPBOX_OAUTH_BASE_URL = "https://www.dropbox.com/oauth2";
const DROPBOX_API_BASE_URL = "https://api.dropboxapi.com/2";

/**
 * Available OAuth2 scopes for Dropbox API
 */
export const DROPBOX_SCOPES = {
  // Read access to files and folders
  FILES_CONTENT_READ: "files.content.read",
  // Write access to files and folders
  FILES_CONTENT_WRITE: "files.content.write",
  // Read access to file metadata
  FILES_METADATA_READ: "files.metadata.read",
  // Write access to file metadata
  FILES_METADATA_WRITE: "files.metadata.write",
  // Account info access
  ACCOUNT_INFO_READ: "account_info.read",
} as const;

export type DropboxScope = (typeof DROPBOX_SCOPES)[keyof typeof DROPBOX_SCOPES];

/**
 * Default scopes for file backup functionality
 */
export const DEFAULT_BACKUP_SCOPES: DropboxScope[] = [
  DROPBOX_SCOPES.FILES_CONTENT_READ,
  DROPBOX_SCOPES.FILES_CONTENT_WRITE,
  DROPBOX_SCOPES.FILES_METADATA_READ,
  DROPBOX_SCOPES.ACCOUNT_INFO_READ,
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get OAuth configuration from environment variables
 */
export function getOAuthConfigFromEnv(): DropboxOAuthConfig {
  const clientId = process.env.DROPBOX_CLIENT_ID;
  const clientSecret = process.env.DROPBOX_CLIENT_SECRET;
  const redirectUri = process.env.DROPBOX_REDIRECT_URI;

  if (!clientId) {
    throw new Error("DROPBOX_CLIENT_ID environment variable is not set");
  }
  if (!clientSecret) {
    throw new Error("DROPBOX_CLIENT_SECRET environment variable is not set");
  }
  if (!redirectUri) {
    throw new Error("DROPBOX_REDIRECT_URI environment variable is not set");
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
function encodeScopes(scopes: DropboxScope[]): string {
  return scopes.join(" ");
}

// ============================================
// OAUTH FLOW FUNCTIONS
// ============================================

/**
 * Generate the authorization URL for Dropbox OAuth2 flow
 *
 * @param config - OAuth configuration
 * @param scopes - Requested scopes (defaults to backup scopes)
 * @param state - Optional state parameter for CSRF protection
 * @returns The authorization URL to redirect the user to
 *
 * @example
 * ```typescript
 * const authUrl = generateAuthUrl(config, DEFAULT_BACKUP_SCOPES, crypto.randomUUID());
 * // Redirect user to authUrl
 * ```
 */
export function generateAuthUrl(
  config: DropboxOAuthConfig,
  scopes: DropboxScope[] = DEFAULT_BACKUP_SCOPES,
  state?: string
): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    token_access_type: "offline", // Request refresh token
  });

  if (scopes.length > 0) {
    params.set("scope", encodeScopes(scopes));
  }

  if (state) {
    params.set("state", state);
  }

  return `${DROPBOX_OAUTH_BASE_URL}/authorize?${params.toString()}`;
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
  config: DropboxOAuthConfig,
  code: string
): Promise<DropboxTokens> {
  const response = await fetch(`${DROPBOX_OAUTH_BASE_URL}/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
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
    throw new DropboxAuthError(
      `Failed to exchange code for tokens: ${errorDetail}`,
      response.status,
      errorDetail
    );
  }

  const data: DropboxTokenResponse = await response.json();

  // Dropbox tokens typically don't expire, but we set a far future date if not provided
  const expiresAt = data.expires_in
    ? new Date(Date.now() + data.expires_in * 1000)
    : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year if no expiry

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt,
    scope: data.scope,
    accountId: data.account_id,
    uid: data.uid,
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
  config: DropboxOAuthConfig,
  refreshToken: string
): Promise<DropboxTokens> {
  const response = await fetch(`${DROPBOX_OAUTH_BASE_URL}/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: config.clientId,
      client_secret: config.clientSecret,
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
      throw new DropboxAuthError(
        `Refresh token is invalid or expired: ${errorDetail}`,
        response.status,
        errorDetail,
        true
      );
    }

    throw new DropboxAuthError(
      `Failed to refresh access token: ${errorDetail}`,
      response.status,
      errorDetail
    );
  }

  const data: DropboxTokenResponse = await response.json();

  const expiresAt = data.expires_in
    ? new Date(Date.now() + data.expires_in * 1000)
    : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || refreshToken, // Keep old refresh token if not provided
    expiresAt,
    scope: data.scope,
    accountId: data.account_id,
    uid: data.uid,
  };
}

/**
 * Revoke an access token
 *
 * @param config - OAuth configuration
 * @param token - The token to revoke
 */
export async function revokeToken(
  config: DropboxOAuthConfig,
  token: string
): Promise<void> {
  const response = await fetch(`${DROPBOX_OAUTH_BASE_URL}/token/revoke`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok && response.status !== 200) {
    const errorText = await response.text();
    throw new DropboxAuthError(
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
  tokens: DropboxTokens,
  config: DropboxOAuthConfig
): Promise<DropboxTokens> {
  if (!isTokenExpired(tokens.expiresAt)) {
    return tokens;
  }

  if (!tokens.refreshToken) {
    throw new DropboxAuthError(
      "Token is expired and no refresh token available",
      401,
      "no_refresh_token",
      true
    );
  }

  return refreshAccessToken(config, tokens.refreshToken);
}

// ============================================
// ERROR HANDLING
// ============================================

/**
 * Custom error class for Dropbox authentication errors
 */
export class DropboxAuthError extends Error {
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
    this.name = "DropboxAuthError";
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
