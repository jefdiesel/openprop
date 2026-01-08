/**
 * Google Drive OAuth2 Authentication Helpers
 *
 * Implements the OAuth2 authorization code flow for Google Drive API
 * https://developers.google.com/identity/protocols/oauth2/web-server
 */

import type {
  GoogleDriveOAuthConfig,
  GoogleDriveTokenResponse,
  GoogleDriveTokens,
} from "./types";

// ============================================
// CONSTANTS
// ============================================

const GOOGLE_OAUTH_BASE_URL = "https://accounts.google.com/o/oauth2/v2";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_REVOKE_URL = "https://oauth2.googleapis.com/revoke";

/**
 * Available OAuth2 scopes for Google Drive API
 */
export const GOOGLE_DRIVE_SCOPES = {
  // Per-file access to files created by the app
  FILE: "https://www.googleapis.com/auth/drive.file",
  // Read-only access to file metadata and file contents
  READONLY: "https://www.googleapis.com/auth/drive.readonly",
  // Full access to all files (use with caution)
  FULL: "https://www.googleapis.com/auth/drive",
  // Access to app data folder
  APPDATA: "https://www.googleapis.com/auth/drive.appdata",
  // Access to Drive metadata
  METADATA: "https://www.googleapis.com/auth/drive.metadata",
  // Read-only access to Drive metadata
  METADATA_READONLY: "https://www.googleapis.com/auth/drive.metadata.readonly",
} as const;

export type GoogleDriveScope = (typeof GOOGLE_DRIVE_SCOPES)[keyof typeof GOOGLE_DRIVE_SCOPES];

/**
 * Default scopes for document backup functionality
 */
export const DEFAULT_BACKUP_SCOPES: GoogleDriveScope[] = [
  GOOGLE_DRIVE_SCOPES.FILE,
  GOOGLE_DRIVE_SCOPES.READONLY,
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get OAuth configuration from environment variables
 */
export function getOAuthConfigFromEnv(): GoogleDriveOAuthConfig {
  const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri =
    process.env.GOOGLE_DRIVE_REDIRECT_URI ||
    `${process.env.NEXTAUTH_URL}/api/integrations/google-drive/callback`;

  if (!clientId) {
    throw new Error("GOOGLE_DRIVE_CLIENT_ID or GOOGLE_CLIENT_ID environment variable is not set");
  }
  if (!clientSecret) {
    throw new Error("GOOGLE_DRIVE_CLIENT_SECRET or GOOGLE_CLIENT_SECRET environment variable is not set");
  }
  if (!redirectUri) {
    throw new Error("GOOGLE_DRIVE_REDIRECT_URI or NEXTAUTH_URL environment variable is not set");
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
function encodeScopes(scopes: GoogleDriveScope[]): string {
  return scopes.join(" ");
}

// ============================================
// OAUTH FLOW FUNCTIONS
// ============================================

/**
 * Generate the authorization URL for Google Drive OAuth2 flow
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
  config: GoogleDriveOAuthConfig,
  scopes: GoogleDriveScope[] = DEFAULT_BACKUP_SCOPES,
  state?: string
): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: encodeScopes(scopes),
    response_type: "code",
    access_type: "offline", // Request refresh token
    prompt: "consent", // Force consent to get refresh token
  });

  if (state) {
    params.set("state", state);
  }

  return `${GOOGLE_OAUTH_BASE_URL}/auth?${params.toString()}`;
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
  config: GoogleDriveOAuthConfig,
  code: string
): Promise<GoogleDriveTokens> {
  const response = await fetch(GOOGLE_TOKEN_URL, {
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
    throw new GoogleDriveAuthError(
      `Failed to exchange code for tokens: ${errorDetail}`,
      response.status,
      errorDetail
    );
  }

  const data: GoogleDriveTokenResponse = await response.json();

  // Google may not always return a refresh token on re-authorization
  if (!data.refresh_token) {
    throw new GoogleDriveAuthError(
      "No refresh token received. User may need to re-authorize with prompt=consent",
      400,
      "missing_refresh_token"
    );
  }

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
  config: GoogleDriveOAuthConfig,
  refreshToken: string
): Promise<GoogleDriveTokens> {
  const response = await fetch(GOOGLE_TOKEN_URL, {
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
      throw new GoogleDriveAuthError(
        `Refresh token is invalid or expired: ${errorDetail}`,
        response.status,
        errorDetail,
        true
      );
    }

    throw new GoogleDriveAuthError(
      `Failed to refresh access token: ${errorDetail}`,
      response.status,
      errorDetail
    );
  }

  const data: GoogleDriveTokenResponse = await response.json();

  return {
    accessToken: data.access_token,
    refreshToken: refreshToken, // Keep existing refresh token
    expiresAt: new Date(Date.now() + data.expires_in * 1000),
    scope: data.scope,
  };
}

/**
 * Revoke an access or refresh token
 *
 * @param token - The token to revoke (access or refresh token)
 */
export async function revokeToken(token: string): Promise<void> {
  const response = await fetch(GOOGLE_REVOKE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      token,
    }).toString(),
  });

  // Google returns 200 even if token is invalid (per OAuth 2.0 spec)
  if (!response.ok && response.status !== 200) {
    const errorText = await response.text();
    throw new GoogleDriveAuthError(
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
  tokens: GoogleDriveTokens,
  config: GoogleDriveOAuthConfig
): Promise<GoogleDriveTokens> {
  if (!isTokenExpired(tokens.expiresAt)) {
    return tokens;
  }

  return refreshAccessToken(config, tokens.refreshToken);
}

// ============================================
// ERROR HANDLING
// ============================================

/**
 * Custom error class for Google Drive authentication errors
 */
export class GoogleDriveAuthError extends Error {
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
    this.name = "GoogleDriveAuthError";
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
