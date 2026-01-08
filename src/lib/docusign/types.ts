/**
 * DocuSign API Types
 * Full TypeScript definitions for DocuSign eSignature REST API
 */

// ============================================
// OAUTH TYPES
// ============================================

export interface DocuSignOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface DocuSignTokenResponse {
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
  refresh_token: string;
}

export interface DocuSignTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

// ============================================
// USER/ACCOUNT TYPES
// ============================================

export interface DocuSignUserInfo {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  email: string;
  accounts: DocuSignAccount[];
}

export interface DocuSignAccount {
  account_id: string;
  is_default: boolean;
  account_name: string;
  base_uri: string;
  organization?: {
    organization_id: string;
    links: Array<{
      rel: string;
      href: string;
    }>;
  };
}

// ============================================
// COMMON TYPES
// ============================================

export interface DocuSignApiError {
  errorCode: string;
  message: string;
}

// ============================================
// TEMPLATE TYPES
// ============================================

export interface DocuSignTemplateListItem {
  templateId: string;
  name: string;
  description?: string;
  shared: string;
  password?: string;
  created: string;
  lastModified?: string;
  pageCount?: number;
  uri?: string;
  folderName?: string;
  folderId?: string;
  owner?: {
    userName: string;
    userId: string;
    email: string;
  };
}

export interface DocuSignTemplateListResponse {
  envelopeTemplates: DocuSignTemplateListItem[];
  resultSetSize: string;
  totalSetSize: string;
  startPosition: string;
  endPosition: string;
  nextUri?: string;
  previousUri?: string;
}

export interface DocuSignTemplate {
  templateId: string;
  name: string;
  description?: string;
  shared: string;
  created: string;
  lastModified?: string;
  pageCount?: number;
  password?: string;
  folderName?: string;
  folderId?: string;
  uri?: string;
  emailSubject?: string;
  emailBlurb?: string;
  recipients?: DocuSignRecipients;
  documents?: DocuSignDocument[];
  envelopeTemplateDefinition?: {
    templateId: string;
  };
  customFields?: {
    textCustomFields?: DocuSignCustomField[];
    listCustomFields?: DocuSignCustomField[];
  };
}

// ============================================
// ENVELOPE TYPES
// ============================================

export type DocuSignEnvelopeStatus =
  | "created"
  | "sent"
  | "delivered"
  | "signed"
  | "completed"
  | "declined"
  | "voided"
  | "deleted";

export interface DocuSignEnvelopeListItem {
  envelopeId: string;
  status: DocuSignEnvelopeStatus;
  statusChangedDateTime: string;
  emailSubject: string;
  emailBlurb?: string;
  createdDateTime: string;
  sentDateTime?: string;
  deliveredDateTime?: string;
  completedDateTime?: string;
  voidedDateTime?: string;
  declinedDateTime?: string;
  sender?: {
    userName: string;
    userId: string;
    email: string;
  };
  recipientsUri?: string;
  customFieldsUri?: string;
  notificationUri?: string;
  documentsUri?: string;
  certificateUri?: string;
  templatesUri?: string;
}

export interface DocuSignEnvelopeListResponse {
  envelopes: DocuSignEnvelopeListItem[];
  resultSetSize: string;
  totalSetSize: string;
  startPosition: string;
  endPosition: string;
  nextUri?: string;
  previousUri?: string;
}

export interface DocuSignEnvelope {
  envelopeId: string;
  status: DocuSignEnvelopeStatus;
  statusChangedDateTime: string;
  documentsUri?: string;
  recipientsUri?: string;
  attachmentsUri?: string;
  emailSubject?: string;
  emailBlurb?: string;
  createdDateTime: string;
  sentDateTime?: string;
  deliveredDateTime?: string;
  completedDateTime?: string;
  voidedDateTime?: string;
  declinedDateTime?: string;
  sender?: {
    userName: string;
    userId: string;
    email: string;
  };
  recipients?: DocuSignRecipients;
  documents?: DocuSignDocument[];
  customFields?: {
    textCustomFields?: DocuSignCustomField[];
    listCustomFields?: DocuSignCustomField[];
  };
  notification?: {
    useAccountDefaults: string;
    reminders?: {
      reminderEnabled: string;
      reminderDelay: string;
      reminderFrequency: string;
    };
    expirations?: {
      expireEnabled: string;
      expireAfter: string;
      expireWarn: string;
    };
  };
}

// ============================================
// RECIPIENT TYPES
// ============================================

export interface DocuSignRecipients {
  signers?: DocuSignSigner[];
  carbonCopies?: DocuSignCarbonCopy[];
  certifiedDeliveries?: DocuSignCertifiedDelivery[];
  agents?: DocuSignAgent[];
  editors?: DocuSignEditor[];
  intermediaries?: DocuSignIntermediary[];
}

export interface DocuSignRecipientBase {
  recipientId: string;
  recipientIdGuid?: string;
  name: string;
  email: string;
  routingOrder?: string;
  note?: string;
  status?: string;
  completedCount?: string;
  deliveredDateTime?: string;
  signedDateTime?: string;
  declinedDateTime?: string;
  declinedReason?: string;
  deliveryMethod?: string;
  totalTabCount?: string;
}

export interface DocuSignSigner extends DocuSignRecipientBase {
  tabs?: DocuSignTabs;
  roleName?: string;
  isBulkRecipient?: string;
  requireIdLookup?: string;
  accessCode?: string;
  customFields?: string[];
  emailNotification?: {
    emailSubject?: string;
    emailBody?: string;
    supportedLanguage?: string;
  };
}

export interface DocuSignCarbonCopy extends DocuSignRecipientBase {
  roleName?: string;
}

export interface DocuSignCertifiedDelivery extends DocuSignRecipientBase {}

export interface DocuSignAgent extends DocuSignRecipientBase {}

export interface DocuSignEditor extends DocuSignRecipientBase {}

export interface DocuSignIntermediary extends DocuSignRecipientBase {}

// ============================================
// TAB TYPES
// ============================================

export interface DocuSignTabs {
  signHereTabs?: DocuSignSignHereTab[];
  initialHereTabs?: DocuSignInitialHereTab[];
  dateSignedTabs?: DocuSignDateSignedTab[];
  textTabs?: DocuSignTextTab[];
  checkboxTabs?: DocuSignCheckboxTab[];
  numberTabs?: DocuSignNumberTab[];
  emailTabs?: DocuSignEmailTab[];
  dateTabs?: DocuSignDateTab[];
  radioGroupTabs?: DocuSignRadioGroupTab[];
  listTabs?: DocuSignListTab[];
  fullNameTabs?: DocuSignFullNameTab[];
  titleTabs?: DocuSignTitleTab[];
  companyTabs?: DocuSignCompanyTab[];
  formulaTabs?: DocuSignFormulaTab[];
  approveTabs?: DocuSignApproveTab[];
  declineTabs?: DocuSignDeclineTab[];
}

export interface DocuSignTabBase {
  tabId?: string;
  documentId: string;
  recipientId?: string;
  pageNumber: string;
  xPosition: string;
  yPosition: string;
  width?: string;
  height?: string;
  anchorString?: string;
  anchorXOffset?: string;
  anchorYOffset?: string;
  anchorUnits?: string;
  anchorIgnoreIfNotPresent?: string;
  tabLabel?: string;
  name?: string;
  value?: string;
  required?: string;
  locked?: string;
  bold?: string;
  italic?: string;
  underline?: string;
  fontColor?: string;
  fontSize?: string;
  font?: string;
  conditionalParentLabel?: string;
  conditionalParentValue?: string;
  customTabId?: string;
  mergeField?: {
    allowSenderToEdit?: string;
    configurationType?: string;
    path?: string;
    row?: string;
    writeBack?: string;
  };
  status?: string;
  tabOrder?: string;
  templateLocked?: string;
  templateRequired?: string;
  tooltip?: string;
}

export interface DocuSignSignHereTab extends DocuSignTabBase {
  scaleValue?: string;
  optional?: string;
  stampType?: string;
}

export interface DocuSignInitialHereTab extends DocuSignTabBase {
  scaleValue?: string;
  optional?: string;
}

export interface DocuSignDateSignedTab extends DocuSignTabBase {}

export interface DocuSignTextTab extends DocuSignTabBase {
  maxLength?: string;
  validationPattern?: string;
  validationMessage?: string;
  concealValueOnDocument?: string;
  disableAutoSize?: string;
  originalValue?: string;
  isPaymentAmount?: string;
}

export interface DocuSignCheckboxTab extends DocuSignTabBase {
  selected?: string;
  shared?: string;
}

export interface DocuSignNumberTab extends DocuSignTabBase {
  validationPattern?: string;
  validationMessage?: string;
  maxLength?: string;
  originalValue?: string;
}

export interface DocuSignEmailTab extends DocuSignTabBase {}

export interface DocuSignDateTab extends DocuSignTabBase {
  validationPattern?: string;
  validationMessage?: string;
  originalValue?: string;
}

export interface DocuSignRadioGroupTab {
  groupName: string;
  radios: Array<{
    pageNumber: string;
    xPosition: string;
    yPosition: string;
    value?: string;
    selected?: string;
    required?: string;
  }>;
  conditionalParentLabel?: string;
  conditionalParentValue?: string;
  documentId: string;
  recipientId?: string;
  requireAll?: string;
  requireInitialOnSharedChange?: string;
  shared?: string;
  tabType?: string;
  templateLocked?: string;
  templateRequired?: string;
  tooltip?: string;
  value?: string;
}

export interface DocuSignListTab extends DocuSignTabBase {
  listItems?: Array<{
    text: string;
    value: string;
    selected?: string;
  }>;
  originalValue?: string;
}

export interface DocuSignFullNameTab extends DocuSignTabBase {}

export interface DocuSignTitleTab extends DocuSignTabBase {}

export interface DocuSignCompanyTab extends DocuSignTabBase {}

export interface DocuSignFormulaTab extends DocuSignTabBase {
  formula?: string;
  roundDecimalPlaces?: string;
  isPaymentAmount?: string;
}

export interface DocuSignApproveTab extends DocuSignTabBase {
  buttonText?: string;
}

export interface DocuSignDeclineTab extends DocuSignTabBase {
  buttonText?: string;
  declineReason?: string;
}

// ============================================
// DOCUMENT TYPES
// ============================================

export interface DocuSignDocument {
  documentId: string;
  name: string;
  type?: string;
  uri?: string;
  order?: string;
  pages?: string;
  display?: string;
  includeInDownload?: string;
  signerMustAcknowledge?: string;
  templateRequired?: string;
  authoritativeCopy?: string;
  pdfBytes?: string;
  documentBase64?: string;
  documentFields?: Array<{
    name: string;
    value: string;
  }>;
  fileExtension?: string;
  matchBoxes?: Array<{
    pageNumber: string;
    xPosition: string;
    yPosition: string;
    width: string;
    height: string;
  }>;
}

// ============================================
// CUSTOM FIELD TYPES
// ============================================

export interface DocuSignCustomField {
  fieldId?: string;
  name: string;
  value?: string;
  required?: string;
  show?: string;
  configurationType?: string;
  listItems?: string[];
}

// ============================================
// CREATE ENVELOPE TYPES
// ============================================

export interface DocuSignCreateEnvelopeRequest {
  emailSubject: string;
  emailBlurb?: string;
  templateId?: string;
  templateRoles?: Array<{
    email: string;
    name: string;
    roleName: string;
    clientUserId?: string;
    tabs?: DocuSignTabs;
    emailNotification?: {
      emailSubject?: string;
      emailBody?: string;
    };
  }>;
  documents?: Array<{
    documentBase64?: string;
    name: string;
    fileExtension: string;
    documentId: string;
  }>;
  recipients?: DocuSignRecipients;
  status: "sent" | "created" | "draft";
  customFields?: {
    textCustomFields?: Array<{
      name: string;
      value: string;
      show?: string;
      required?: string;
    }>;
  };
  notification?: {
    useAccountDefaults?: string;
    reminders?: {
      reminderEnabled: string;
      reminderDelay: string;
      reminderFrequency: string;
    };
    expirations?: {
      expireEnabled: string;
      expireAfter: string;
      expireWarn: string;
    };
  };
  eventNotification?: {
    url: string;
    loggingEnabled?: string;
    requireAcknowledgment?: string;
    useSoapInterface?: string;
    includeCertificateWithSoap?: string;
    signMessageWithX509Cert?: string;
    includeDocuments?: string;
    includeEnvelopeVoidReason?: string;
    includeTimeZone?: string;
    includeSenderAccountAsCustomField?: string;
    includeDocumentFields?: string;
    includeCertificateOfCompletion?: string;
    envelopeEvents?: Array<{
      envelopeEventStatusCode: string;
      includeDocuments?: string;
    }>;
    recipientEvents?: Array<{
      recipientEventStatusCode: string;
      includeDocuments?: string;
    }>;
  };
}

export interface DocuSignCreateEnvelopeResponse {
  envelopeId: string;
  uri: string;
  statusDateTime: string;
  status: DocuSignEnvelopeStatus;
}

// ============================================
// API CLIENT TYPES
// ============================================

export interface DocuSignClientConfig {
  /**
   * Access token for API authentication (OAuth Bearer token)
   */
  accessToken?: string;

  /**
   * Refresh token for automatic token refresh (OAuth only)
   */
  refreshToken?: string;

  /**
   * Token expiration timestamp (OAuth only)
   */
  tokenExpiresAt?: Date;

  /**
   * OAuth config for token refresh
   */
  oauthConfig?: DocuSignOAuthConfig;

  /**
   * Callback when tokens are refreshed (OAuth only)
   */
  onTokenRefresh?: (tokens: DocuSignTokens) => Promise<void>;

  /**
   * DocuSign account ID (required for API calls)
   */
  accountId: string;

  /**
   * Base URI for the account (e.g., https://demo.docusign.net/restapi)
   * Retrieved from user info after OAuth
   */
  baseUri: string;

  /**
   * Request timeout in milliseconds (defaults to 30000)
   */
  timeout?: number;

  /**
   * Maximum number of retries for failed requests (defaults to 3)
   */
  maxRetries?: number;

  /**
   * Initial retry delay in milliseconds (defaults to 1000)
   */
  initialRetryDelay?: number;
}

export interface DocuSignRequestOptions {
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
