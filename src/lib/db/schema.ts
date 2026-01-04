import {
  pgTable,
  text,
  uuid,
  timestamp,
  jsonb,
  boolean,
  integer,
  bigint,
  primaryKey,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import type { AdapterAccountType } from 'next-auth/adapters';

// ==========================================
// Auth.js Tables
// ==========================================

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name'),
  email: text('email').unique().notNull(),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  image: text('image'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
});

export const accounts = pgTable(
  'accounts',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccountType>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
    index('accounts_user_id_idx').on(account.userId),
  ]
);

export const sessions = pgTable(
  'sessions',
  {
    sessionToken: text('session_token').primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (session) => [index('sessions_user_id_idx').on(session.userId)]
);

export const verificationTokens = pgTable(
  'verification_tokens',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })]
);

// ==========================================
// Application Tables
// ==========================================

// Profiles - extended user data
export const profiles = pgTable(
  'profiles',
  {
    id: uuid('id')
      .primaryKey()
      .references(() => users.id, { onDelete: 'cascade' }),
    fullName: text('full_name'),
    companyName: text('company_name'),
    logoUrl: text('logo_url'),
    brandColor: text('brand_color').default('#000000'),
    stripeAccountId: text('stripe_account_id'),
    stripeAccountEnabled: boolean('stripe_account_enabled').default(false),
    stripeCustomerId: text('stripe_customer_id'),
    // Current organization context (for team users)
    currentOrganizationId: uuid('current_organization_id'),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (profile) => [
    index('profiles_stripe_account_id_idx').on(profile.stripeAccountId),
    index('profiles_current_org_id_idx').on(profile.currentOrganizationId),
  ]
);

// Documents
export const documents = pgTable(
  'documents',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    // openpropId: text('openprop_id'), // Future: Human-readable ID like OP-A1B2C3
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    // Organization ownership (null for solo users)
    organizationId: uuid('organization_id'),
    title: text('title').notNull(),
    status: text('status')
      .$type<'draft' | 'sent' | 'viewed' | 'completed' | 'expired' | 'declined'>()
      .default('draft')
      .notNull(),
    content: jsonb('content').$type<unknown[]>().default([]).notNull(),
    variables: jsonb('variables').$type<Record<string, unknown>>(),
    settings: jsonb('settings').$type<Record<string, unknown>>(),
    isTemplate: boolean('is_template').default(false).notNull(),
    templateCategory: text('template_category'),
    // Edit-in-place: Lock document after first signature
    lockedAt: timestamp('locked_at', { mode: 'date' }),
    lockedBy: uuid('locked_by'), // References recipients.id (no FK to avoid circular dependency)
    // Blockchain verification
    blockchainTxHash: text('blockchain_tx_hash'),
    blockchainVerifiedAt: timestamp('blockchain_verified_at', { mode: 'date' }),
    // Version tracking
    currentVersion: integer('current_version').default(1).notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
    sentAt: timestamp('sent_at', { mode: 'date' }),
    expiresAt: timestamp('expires_at', { mode: 'date' }),
  },
  (document) => [
    index('documents_user_id_idx').on(document.userId),
    index('documents_org_id_idx').on(document.organizationId),
    index('documents_status_idx').on(document.status),
    index('documents_is_template_idx').on(document.isTemplate),
    index('documents_created_at_idx').on(document.createdAt),
  ]
);

// Recipients
export const recipients = pgTable(
  'recipients',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    documentId: uuid('document_id')
      .notNull()
      .references(() => documents.id, { onDelete: 'cascade' }),
    email: text('email').notNull(),
    name: text('name'),
    role: text('role')
      .$type<'signer' | 'viewer' | 'approver'>()
      .default('signer')
      .notNull(),
    signingOrder: integer('signing_order').default(1).notNull(),
    status: text('status')
      .$type<'pending' | 'viewed' | 'signed' | 'declined'>()
      .default('pending')
      .notNull(),
    accessToken: text('access_token').notNull(),
    viewedAt: timestamp('viewed_at', { mode: 'date' }),
    signedAt: timestamp('signed_at', { mode: 'date' }),
    signatureData: jsonb('signature_data').$type<{
      type: 'drawn' | 'typed' | 'uploaded';
      data: string;
      signedAt: string;
    }>(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    // Payment tracking
    paymentStatus: text('payment_status')
      .$type<'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded'>(),
    paymentAmount: integer('payment_amount'), // Amount in cents
    paymentIntentId: text('payment_intent_id'),
    paymentTiming: text('payment_timing')
      .$type<'due_now' | 'net_30' | 'net_60'>(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (recipient) => [
    index('recipients_document_id_idx').on(recipient.documentId),
    uniqueIndex('recipients_access_token_idx').on(recipient.accessToken),
    index('recipients_email_idx').on(recipient.email),
    index('recipients_status_idx').on(recipient.status),
  ]
);

// Document Events
export const documentEvents = pgTable(
  'document_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    documentId: uuid('document_id')
      .notNull()
      .references(() => documents.id, { onDelete: 'cascade' }),
    recipientId: uuid('recipient_id').references(() => recipients.id, {
      onDelete: 'set null',
    }),
    eventType: text('event_type').notNull(),
    eventData: jsonb('event_data').$type<Record<string, unknown>>(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (event) => [
    index('document_events_document_id_idx').on(event.documentId),
    index('document_events_recipient_id_idx').on(event.recipientId),
    index('document_events_event_type_idx').on(event.eventType),
    index('document_events_created_at_idx').on(event.createdAt),
  ]
);

// Payments
export const payments = pgTable(
  'payments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    documentId: uuid('document_id')
      .notNull()
      .references(() => documents.id, { onDelete: 'cascade' }),
    recipientId: uuid('recipient_id').references(() => recipients.id, {
      onDelete: 'set null',
    }),
    stripePaymentIntentId: text('stripe_payment_intent_id'),
    amount: integer('amount').notNull(),
    currency: text('currency').default('usd').notNull(),
    status: text('status')
      .$type<'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded'>()
      .default('pending')
      .notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (payment) => [
    index('payments_document_id_idx').on(payment.documentId),
    index('payments_stripe_payment_intent_id_idx').on(payment.stripePaymentIntentId),
    index('payments_status_idx').on(payment.status),
  ]
);

// Integrations (for third-party OAuth connections like Google, etc.)
export const integrations = pgTable(
  'integrations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    provider: text('provider').notNull(), // 'google_drive', 'dropbox', 'notion', etc.
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    tokenExpiresAt: timestamp('token_expires_at', { mode: 'date' }),
    scope: text('scope'),
    accountEmail: text('account_email'),
    accountId: text('account_id'),
    metadata: jsonb('metadata').$type<Record<string, unknown>>(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (integration) => [
    index('integrations_user_id_idx').on(integration.userId),
    uniqueIndex('integrations_user_provider_idx').on(
      integration.userId,
      integration.provider
    ),
  ]
);

// Import Jobs (for tracking file import progress)
export const importJobs = pgTable(
  'import_jobs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    provider: text('provider').notNull(), // 'google_drive', 'local', etc.
    status: text('status')
      .$type<'pending' | 'processing' | 'completed' | 'failed'>()
      .default('pending')
      .notNull(),
    totalFiles: integer('total_files').default(0).notNull(),
    processedFiles: integer('processed_files').default(0).notNull(),
    failedFiles: integer('failed_files').default(0).notNull(),
    errorMessage: text('error_message'),
    metadata: jsonb('metadata').$type<Record<string, unknown>>(),
    startedAt: timestamp('started_at', { mode: 'date' }),
    completedAt: timestamp('completed_at', { mode: 'date' }),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (job) => [
    index('import_jobs_user_id_idx').on(job.userId),
    index('import_jobs_status_idx').on(job.status),
  ]
);

// Subscriptions
export const subscriptions = pgTable(
  'subscriptions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    // User subscription (for solo users)
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' }),
    // Organization subscription (for teams) - one of userId or organizationId must be set
    organizationId: uuid('organization_id'),
    stripeCustomerId: text('stripe_customer_id'),
    stripeSubscriptionId: text('stripe_subscription_id').unique(),
    planId: text('plan_id')
      .$type<'free' | 'pro' | 'business' | 'pro_team' | 'business_team'>()
      .default('free')
      .notNull(),
    status: text('status')
      .$type<
        | 'active'
        | 'canceled'
        | 'past_due'
        | 'trialing'
        | 'incomplete'
        | 'incomplete_expired'
      >()
      .default('active')
      .notNull(),
    isEarlyBird: boolean('is_early_bird').default(false).notNull(),
    billingInterval: text('billing_interval')
      .$type<'monthly' | 'yearly'>()
      .default('monthly')
      .notNull(),
    // Team seat tracking
    seatLimit: integer('seat_limit'), // null = unlimited
    currentPeriodStart: timestamp('current_period_start', { mode: 'date' }),
    currentPeriodEnd: timestamp('current_period_end', { mode: 'date' }),
    cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false).notNull(),
    canceledAt: timestamp('canceled_at', { mode: 'date' }),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (subscription) => [
    index('subscriptions_user_id_idx').on(subscription.userId),
    index('subscriptions_org_id_idx').on(subscription.organizationId),
    index('subscriptions_stripe_subscription_id_idx').on(
      subscription.stripeSubscriptionId
    ),
    index('subscriptions_status_idx').on(subscription.status),
  ]
);

// Subscription Add-ons
export const subscriptionAddons = pgTable(
  'subscription_addons',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    subscriptionId: uuid('subscription_id')
      .notNull()
      .references(() => subscriptions.id, { onDelete: 'cascade' }),
    addonId: text('addon_id').$type<'blockchain_audit'>().notNull(),
    stripeSubscriptionItemId: text('stripe_subscription_item_id'),
    status: text('status').default('active').notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (addon) => [index('subscription_addons_subscription_id_idx').on(addon.subscriptionId)]
);

// Early Bird Slots
export const earlyBirdSlots = pgTable(
  'early_bird_slots',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' })
      .unique(),
    slotNumber: integer('slot_number').notNull(),
    planId: text('plan_id').$type<'free' | 'pro' | 'business'>().notNull(),
    claimedAt: timestamp('claimed_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (slot) => [index('early_bird_slots_user_id_idx').on(slot.userId)]
);

// Document Versions (for version history with diff)
export const documentVersions = pgTable(
  'document_versions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    documentId: uuid('document_id')
      .notNull()
      .references(() => documents.id, { onDelete: 'cascade' }),
    versionNumber: integer('version_number').notNull(),
    title: text('title').notNull(),
    content: jsonb('content').$type<unknown[]>().default([]).notNull(),
    variables: jsonb('variables').$type<Record<string, unknown>>(),
    // What triggered this version
    changeType: text('change_type')
      .$type<'created' | 'edited' | 'sent' | 'resent'>()
      .default('edited')
      .notNull(),
    changeDescription: text('change_description'),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (version) => [
    index('document_versions_document_id_idx').on(version.documentId),
    index('document_versions_version_number_idx').on(version.versionNumber),
    index('document_versions_created_at_idx').on(version.createdAt),
  ]
);

// ==========================================
// Organizations / Teams
// ==========================================

// Organizations table
export const organizations = pgTable(
  'organizations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    slug: text('slug').unique().notNull(), // For URLs: /team/acme-inc
    logoUrl: text('logo_url'),
    brandColor: text('brand_color').default('#000000'),
    // Stripe Connect (team-level, not user-level)
    stripeAccountId: text('stripe_account_id'),
    stripeAccountEnabled: boolean('stripe_account_enabled').default(false),
    // Storage tracking
    storageUsedBytes: bigint('storage_used_bytes', { mode: 'number' }).default(0),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (org) => [
    uniqueIndex('organizations_slug_idx').on(org.slug),
    index('organizations_stripe_account_id_idx').on(org.stripeAccountId),
  ]
);

// Organization members
export const organizationMembers = pgTable(
  'organization_members',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: text('role')
      .$type<'owner' | 'admin' | 'member'>()
      .default('member')
      .notNull(),
    invitedBy: uuid('invited_by').references(() => users.id),
    joinedAt: timestamp('joined_at', { mode: 'date' }),
    status: text('status')
      .$type<'pending' | 'active' | 'removed'>()
      .default('active')
      .notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (member) => [
    uniqueIndex('org_members_unique').on(member.organizationId, member.userId),
    index('org_members_org_id_idx').on(member.organizationId),
    index('org_members_user_id_idx').on(member.userId),
    index('org_members_status_idx').on(member.status),
  ]
);

// Pending invites
export const organizationInvites = pgTable(
  'organization_invites',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    email: text('email').notNull(),
    role: text('role')
      .$type<'admin' | 'member'>()
      .default('member')
      .notNull(),
    token: text('token').unique().notNull(),
    invitedBy: uuid('invited_by')
      .notNull()
      .references(() => users.id),
    expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),
    acceptedAt: timestamp('accepted_at', { mode: 'date' }),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (invite) => [
    index('org_invites_org_id_idx').on(invite.organizationId),
    index('org_invites_email_idx').on(invite.email),
    uniqueIndex('org_invites_token_idx').on(invite.token),
  ]
);

// Storage tracking
export const storageItems = pgTable(
  'storage_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    documentId: uuid('document_id').references(() => documents.id, {
      onDelete: 'set null',
    }),
    uploadedBy: uuid('uploaded_by')
      .notNull()
      .references(() => users.id),
    fileName: text('file_name').notNull(),
    fileType: text('file_type').notNull(),
    fileSize: bigint('file_size', { mode: 'number' }).notNull(),
    storagePath: text('storage_path').notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (item) => [
    index('storage_items_org_id_idx').on(item.organizationId),
    index('storage_items_document_id_idx').on(item.documentId),
    index('storage_items_uploaded_by_idx').on(item.uploadedBy),
  ]
);

// ==========================================
// Relations
// ==========================================

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.id],
  }),
  accounts: many(accounts),
  sessions: many(sessions),
  documents: many(documents),
  integrations: many(integrations),
  importJobs: many(importJobs),
  subscription: one(subscriptions, {
    fields: [users.id],
    references: [subscriptions.userId],
  }),
  earlyBirdSlot: one(earlyBirdSlots, {
    fields: [users.id],
    references: [earlyBirdSlots.userId],
  }),
  // Organization memberships
  organizationMemberships: many(organizationMembers),
  invitedMembers: many(organizationMembers, { relationName: 'invitedBy' }),
  sentInvites: many(organizationInvites),
  storageUploads: many(storageItems),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.id],
    references: [users.id],
  }),
  currentOrganization: one(organizations, {
    fields: [profiles.currentOrganizationId],
    references: [organizations.id],
  }),
}));

export const documentsRelations = relations(documents, ({ one, many }) => ({
  user: one(users, {
    fields: [documents.userId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [documents.organizationId],
    references: [organizations.id],
  }),
  recipients: many(recipients),
  events: many(documentEvents),
  payments: many(payments),
  versions: many(documentVersions),
  lockedByRecipient: one(recipients, {
    fields: [documents.lockedBy],
    references: [recipients.id],
  }),
  storageItems: many(storageItems),
}));

export const recipientsRelations = relations(recipients, ({ one, many }) => ({
  document: one(documents, {
    fields: [recipients.documentId],
    references: [documents.id],
  }),
  events: many(documentEvents),
  payments: many(payments),
}));

export const documentEventsRelations = relations(documentEvents, ({ one }) => ({
  document: one(documents, {
    fields: [documentEvents.documentId],
    references: [documents.id],
  }),
  recipient: one(recipients, {
    fields: [documentEvents.recipientId],
    references: [recipients.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  document: one(documents, {
    fields: [payments.documentId],
    references: [documents.id],
  }),
  recipient: one(recipients, {
    fields: [payments.recipientId],
    references: [recipients.id],
  }),
}));

export const integrationsRelations = relations(integrations, ({ one }) => ({
  user: one(users, {
    fields: [integrations.userId],
    references: [users.id],
  }),
}));

export const importJobsRelations = relations(importJobs, ({ one }) => ({
  user: one(users, {
    fields: [importJobs.userId],
    references: [users.id],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one, many }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [subscriptions.organizationId],
    references: [organizations.id],
  }),
  addons: many(subscriptionAddons),
}));

export const subscriptionAddonsRelations = relations(subscriptionAddons, ({ one }) => ({
  subscription: one(subscriptions, {
    fields: [subscriptionAddons.subscriptionId],
    references: [subscriptions.id],
  }),
}));

export const earlyBirdSlotsRelations = relations(earlyBirdSlots, ({ one }) => ({
  user: one(users, {
    fields: [earlyBirdSlots.userId],
    references: [users.id],
  }),
}));

export const documentVersionsRelations = relations(documentVersions, ({ one }) => ({
  document: one(documents, {
    fields: [documentVersions.documentId],
    references: [documents.id],
  }),
  createdByUser: one(users, {
    fields: [documentVersions.createdBy],
    references: [users.id],
  }),
}));

// ==========================================
// Organization Relations
// ==========================================

export const organizationsRelations = relations(organizations, ({ many, one }) => ({
  members: many(organizationMembers),
  invites: many(organizationInvites),
  documents: many(documents),
  storageItems: many(storageItems),
  subscription: one(subscriptions, {
    fields: [organizations.id],
    references: [subscriptions.organizationId],
  }),
}));

export const organizationMembersRelations = relations(organizationMembers, ({ one }) => ({
  organization: one(organizations, {
    fields: [organizationMembers.organizationId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [organizationMembers.userId],
    references: [users.id],
  }),
  invitedByUser: one(users, {
    fields: [organizationMembers.invitedBy],
    references: [users.id],
    relationName: 'invitedBy',
  }),
}));

export const organizationInvitesRelations = relations(organizationInvites, ({ one }) => ({
  organization: one(organizations, {
    fields: [organizationInvites.organizationId],
    references: [organizations.id],
  }),
  invitedByUser: one(users, {
    fields: [organizationInvites.invitedBy],
    references: [users.id],
  }),
}));

export const storageItemsRelations = relations(storageItems, ({ one }) => ({
  organization: one(organizations, {
    fields: [storageItems.organizationId],
    references: [organizations.id],
  }),
  document: one(documents, {
    fields: [storageItems.documentId],
    references: [documents.id],
  }),
  uploadedByUser: one(users, {
    fields: [storageItems.uploadedBy],
    references: [users.id],
  }),
}));
