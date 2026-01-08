/**
 * QuickBooks Online API Types
 * TypeScript definitions for QuickBooks Online API v3
 */

// ============================================
// OAUTH TYPES
// ============================================

export interface QuickBooksOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  environment?: 'sandbox' | 'production';
}

export interface QuickBooksTokenResponse {
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
  refresh_token: string;
  x_refresh_token_expires_in: number;
}

export interface QuickBooksTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  refreshTokenExpiresAt: Date;
  realmId: string; // Company ID
}

// ============================================
// COMMON TYPES
// ============================================

export interface QuickBooksResponse<T> {
  QueryResponse?: {
    [key: string]: T[] | number | undefined;
    startPosition?: number;
    maxResults?: number;
    totalCount?: number;
  };
  [key: string]: unknown;
}

export interface QuickBooksApiError {
  Fault: {
    Error: Array<{
      Message: string;
      Detail: string;
      code: string;
      element?: string;
    }>;
    type: string;
  };
}

export interface QuickBooksMetaData {
  CreateTime: string;
  LastUpdatedTime: string;
}

export interface QuickBooksRef {
  value: string;
  name?: string;
}

export interface QuickBooksAddress {
  Line1?: string;
  Line2?: string;
  Line3?: string;
  Line4?: string;
  Line5?: string;
  City?: string;
  Country?: string;
  CountrySubDivisionCode?: string;
  PostalCode?: string;
  Lat?: string;
  Long?: string;
}

export interface QuickBooksPhoneNumber {
  FreeFormNumber: string;
}

export interface QuickBooksEmailAddress {
  Address: string;
}

// ============================================
// CUSTOMER TYPES
// ============================================

export interface QuickBooksCustomer {
  Id: string;
  SyncToken: string;
  MetaData: QuickBooksMetaData;
  Title?: string;
  GivenName?: string;
  MiddleName?: string;
  FamilyName?: string;
  Suffix?: string;
  FullyQualifiedName?: string;
  CompanyName?: string;
  DisplayName: string;
  PrintOnCheckName?: string;
  Active?: boolean;
  PrimaryPhone?: QuickBooksPhoneNumber;
  AlternatePhone?: QuickBooksPhoneNumber;
  Mobile?: QuickBooksPhoneNumber;
  Fax?: QuickBooksPhoneNumber;
  PrimaryEmailAddr?: QuickBooksEmailAddress;
  WebAddr?: {
    URI: string;
  };
  DefaultTaxCodeRef?: QuickBooksRef;
  Taxable?: boolean;
  BillAddr?: QuickBooksAddress;
  ShipAddr?: QuickBooksAddress;
  Notes?: string;
  Job?: boolean;
  BillWithParent?: boolean;
  ParentRef?: QuickBooksRef;
  Level?: number;
  SalesTermRef?: QuickBooksRef;
  PaymentMethodRef?: QuickBooksRef;
  Balance?: number;
  OpenBalanceDate?: string;
  BalanceWithJobs?: number;
  CurrencyRef?: QuickBooksRef;
  PreferredDeliveryMethod?: string;
  ResaleNum?: string;
  sparse?: boolean;
}

export interface QuickBooksCreateCustomerRequest {
  DisplayName: string;
  GivenName?: string;
  FamilyName?: string;
  CompanyName?: string;
  PrimaryEmailAddr?: QuickBooksEmailAddress;
  PrimaryPhone?: QuickBooksPhoneNumber;
  BillAddr?: QuickBooksAddress;
  Notes?: string;
}

// ============================================
// INVOICE TYPES
// ============================================

export interface QuickBooksInvoice {
  Id: string;
  SyncToken: string;
  MetaData: QuickBooksMetaData;
  CustomField?: Array<{
    DefinitionId: string;
    Name: string;
    Type: string;
    StringValue?: string;
  }>;
  DocNumber?: string;
  TxnDate?: string;
  DueDate?: string;
  ShipDate?: string;
  TrackingNum?: string;
  TotalAmt?: number;
  CurrencyRef?: QuickBooksRef;
  ExchangeRate?: number;
  PrivateNote?: string;
  CustomerMemo?: {
    value: string;
  };
  BillEmail?: QuickBooksEmailAddress;
  TxnStatus?: string;
  LinkedTxn?: Array<{
    TxnId: string;
    TxnType: string;
    TxnLineId?: string;
  }>;
  Line: QuickBooksInvoiceLine[];
  TxnTaxDetail?: {
    TxnTaxCodeRef?: QuickBooksRef;
    TotalTax?: number;
    TaxLine?: Array<{
      Amount: number;
      DetailType: string;
      TaxLineDetail?: {
        TaxRateRef: QuickBooksRef;
        PercentBased?: boolean;
        TaxPercent?: number;
        NetAmountTaxable?: number;
      };
    }>;
  };
  CustomerRef: QuickBooksRef;
  BillAddr?: QuickBooksAddress;
  ShipAddr?: QuickBooksAddress;
  ClassRef?: QuickBooksRef;
  SalesTermRef?: QuickBooksRef;
  DepartmentRef?: QuickBooksRef;
  ShipMethodRef?: QuickBooksRef;
  Balance?: number;
  Deposit?: number;
  DepositToAccountRef?: QuickBooksRef;
  AllowIPNPayment?: boolean;
  AllowOnlinePayment?: boolean;
  AllowOnlineCreditCardPayment?: boolean;
  AllowOnlineACHPayment?: boolean;
  sparse?: boolean;
}

export interface QuickBooksInvoiceLine {
  Id?: string;
  LineNum?: number;
  Description?: string;
  Amount: number;
  DetailType: 'SalesItemLineDetail' | 'SubTotalLineDetail' | 'DiscountLineDetail';
  SalesItemLineDetail?: {
    ItemRef?: QuickBooksRef;
    ClassRef?: QuickBooksRef;
    UnitPrice?: number;
    Qty?: number;
    TaxCodeRef?: QuickBooksRef;
    ServiceDate?: string;
  };
  SubTotalLineDetail?: object;
  DiscountLineDetail?: {
    PercentBased?: boolean;
    DiscountPercent?: number;
    DiscountAccountRef?: QuickBooksRef;
  };
}

export interface QuickBooksCreateInvoiceRequest {
  CustomerRef: QuickBooksRef;
  Line: QuickBooksInvoiceLine[];
  TxnDate?: string;
  DueDate?: string;
  PrivateNote?: string;
  CustomerMemo?: {
    value: string;
  };
  BillEmail?: QuickBooksEmailAddress;
  DocNumber?: string;
}

// ============================================
// PAYMENT TYPES
// ============================================

export interface QuickBooksPayment {
  Id: string;
  SyncToken: string;
  MetaData: QuickBooksMetaData;
  TxnDate?: string;
  TotalAmt: number;
  CurrencyRef?: QuickBooksRef;
  ExchangeRate?: number;
  PrivateNote?: string;
  CustomerRef: QuickBooksRef;
  DepositToAccountRef?: QuickBooksRef;
  PaymentMethodRef?: QuickBooksRef;
  PaymentRefNum?: string;
  UnappliedAmt?: number;
  ProcessPayment?: boolean;
  CreditCardPayment?: {
    CreditChargeInfo?: {
      Type?: string;
      NameOnAcct?: string;
      CcExpiryMonth?: number;
      CcExpiryYear?: number;
      BillAddrStreet?: string;
      PostalCode?: string;
      Amount?: number;
      ProcessPayment?: boolean;
    };
    CreditChargeResponse?: {
      Status?: string;
      AuthCode?: string;
      TxnAuthorizationTime?: string;
      CCTransId?: string;
    };
  };
  Line?: Array<{
    Amount: number;
    LinkedTxn?: Array<{
      TxnId: string;
      TxnType: string;
    }>;
  }>;
  sparse?: boolean;
}

export interface QuickBooksCreatePaymentRequest {
  CustomerRef: QuickBooksRef;
  TotalAmt: number;
  Line?: Array<{
    Amount: number;
    LinkedTxn: Array<{
      TxnId: string;
      TxnType: 'Invoice';
    }>;
  }>;
  TxnDate?: string;
  PaymentMethodRef?: QuickBooksRef;
  DepositToAccountRef?: QuickBooksRef;
  PaymentRefNum?: string;
  PrivateNote?: string;
}

// ============================================
// ITEM TYPES (for invoice line items)
// ============================================

export interface QuickBooksItem {
  Id: string;
  SyncToken: string;
  MetaData: QuickBooksMetaData;
  Name: string;
  Description?: string;
  Active?: boolean;
  FullyQualifiedName?: string;
  Taxable?: boolean;
  UnitPrice?: number;
  Type: 'Service' | 'Inventory' | 'NonInventory' | 'Category';
  IncomeAccountRef?: QuickBooksRef;
  ExpenseAccountRef?: QuickBooksRef;
  AssetAccountRef?: QuickBooksRef;
  PurchaseCost?: number;
  TrackQtyOnHand?: boolean;
  QtyOnHand?: number;
  InvStartDate?: string;
  sparse?: boolean;
}

// ============================================
// ACCOUNT TYPES
// ============================================

export interface QuickBooksAccount {
  Id: string;
  SyncToken: string;
  MetaData: QuickBooksMetaData;
  Name: string;
  FullyQualifiedName?: string;
  Active?: boolean;
  Classification?: string;
  AccountType: string;
  AccountSubType?: string;
  CurrentBalance?: number;
  CurrentBalanceWithSubAccounts?: number;
  CurrencyRef?: QuickBooksRef;
  ParentRef?: QuickBooksRef;
  Description?: string;
  AcctNum?: string;
  TaxCodeRef?: QuickBooksRef;
  sparse?: boolean;
}

// ============================================
// COMPANY INFO TYPES
// ============================================

export interface QuickBooksCompanyInfo {
  Id: string;
  SyncToken: string;
  MetaData: QuickBooksMetaData;
  CompanyName: string;
  LegalName?: string;
  CompanyAddr?: QuickBooksAddress;
  CustomerCommunicationAddr?: QuickBooksAddress;
  LegalAddr?: QuickBooksAddress;
  PrimaryPhone?: QuickBooksPhoneNumber;
  CompanyStartDate?: string;
  FiscalYearStartMonth?: string;
  Country?: string;
  Email?: QuickBooksEmailAddress;
  WebAddr?: {
    URI: string;
  };
  SupportedLanguages?: string;
  NameValue?: Array<{
    Name: string;
    Value: string;
  }>;
}

// ============================================
// API CLIENT TYPES
// ============================================

export interface QuickBooksClientConfig {
  /**
   * Access token for API authentication (OAuth Bearer token)
   */
  accessToken: string;

  /**
   * Refresh token for automatic token refresh
   */
  refreshToken?: string;

  /**
   * Token expiration timestamp
   */
  tokenExpiresAt?: Date;

  /**
   * QuickBooks company/realm ID
   */
  realmId: string;

  /**
   * OAuth config for token refresh
   */
  oauthConfig?: QuickBooksOAuthConfig;

  /**
   * Callback when tokens are refreshed
   */
  onTokenRefresh?: (tokens: QuickBooksTokens) => Promise<void>;

  /**
   * Environment (sandbox or production)
   */
  environment?: 'sandbox' | 'production';

  /**
   * Request timeout in milliseconds (defaults to 30000)
   */
  timeout?: number;

  /**
   * Maximum number of retries for failed requests (defaults to 3)
   */
  maxRetries?: number;
}

export interface QuickBooksRequestOptions {
  /**
   * Override default timeout for this request
   */
  timeout?: number;

  /**
   * Skip retry logic for this request
   */
  skipRetry?: boolean;

  /**
   * Custom headers for this request
   */
  headers?: Record<string, string>;

  /**
   * Abort signal for request cancellation
   */
  signal?: AbortSignal;
}

// ============================================
// QUERY TYPES
// ============================================

export interface QuickBooksQueryOptions {
  /**
   * Maximum number of results to return (default: 100, max: 1000)
   */
  maxResults?: number;

  /**
   * Starting position for pagination (1-based)
   */
  startPosition?: number;

  /**
   * ORDER BY clause fields
   */
  orderBy?: string[];
}
