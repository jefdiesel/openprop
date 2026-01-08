/**
 * QuickBooks Online Integration
 *
 * Comprehensive API client for syncing contacts and payments with QuickBooks
 *
 * @example
 * ```typescript
 * import {
 *   QuickBooksClient,
 *   createQuickBooksClient,
 *   generateAuthUrl,
 *   exchangeCodeForTokens,
 *   DEFAULT_ACCOUNTING_SCOPES,
 * } from '@/lib/quickbooks';
 *
 * // 1. Start OAuth flow
 * const authUrl = generateAuthUrl(oauthConfig, DEFAULT_ACCOUNTING_SCOPES, state);
 * // Redirect user to authUrl
 *
 * // 2. In callback, exchange code for tokens
 * const tokens = await exchangeCodeForTokens(oauthConfig, code, realmId);
 *
 * // 3. Create client and use API
 * const client = createQuickBooksClient(tokens, async (newTokens) => {
 *   await saveTokens(userId, newTokens);
 * });
 *
 * const customers = await client.listCustomers();
 * const invoice = await client.createInvoice(customerId, lineItems);
 * const payment = await client.createPayment(invoiceId, amount, customerId);
 * ```
 */

// Client
export {
  QuickBooksClient,
  createQuickBooksClient,
  QuickBooksError,
  QuickBooksRateLimitError,
} from "./client";

// Auth
export {
  generateAuthUrl,
  exchangeCodeForTokens,
  refreshAccessToken,
  revokeToken,
  isTokenExpired,
  ensureValidTokens,
  getOAuthConfigFromEnv,
  generateState,
  encodeStateData,
  decodeStateData,
  isStateValid,
  QuickBooksAuthError,
  QUICKBOOKS_SCOPES,
  DEFAULT_ACCOUNTING_SCOPES,
  type OAuthStateData,
  type QuickBooksScope,
} from "./auth";

// Types
export type {
  // OAuth types
  QuickBooksOAuthConfig,
  QuickBooksTokenResponse,
  QuickBooksTokens,

  // Client types
  QuickBooksClientConfig,
  QuickBooksRequestOptions,

  // Common types
  QuickBooksResponse,
  QuickBooksApiError,
  QuickBooksMetaData,
  QuickBooksRef,
  QuickBooksAddress,
  QuickBooksPhoneNumber,
  QuickBooksEmailAddress,

  // Customer types
  QuickBooksCustomer,
  QuickBooksCreateCustomerRequest,

  // Invoice types
  QuickBooksInvoice,
  QuickBooksInvoiceLine,
  QuickBooksCreateInvoiceRequest,

  // Payment types
  QuickBooksPayment,
  QuickBooksCreatePaymentRequest,

  // Company types
  QuickBooksCompanyInfo,

  // Query types
  QuickBooksQueryOptions,
} from "./types";
