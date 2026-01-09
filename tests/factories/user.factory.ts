/**
 * Test data factories for creating consistent mock data
 */

export const createMockUser = (overrides = {}) => ({
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  image: null,
  emailVerified: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides
})

export const createMockProfile = (overrides = {}) => ({
  id: 'user-123',
  fullName: 'Test User',
  companyName: 'Test Company',
  logoUrl: null,
  brandColor: '#000000',
  stripeAccountId: null,
  stripeAccountEnabled: false,
  stripeCustomerId: null,
  walletAddress: null,
  currentOrganizationId: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides
})

export const createMockOrganization = (overrides = {}) => ({
  id: 'org-123',
  name: 'Test Organization',
  slug: 'test-organization',
  logoUrl: null,
  brandColor: '#000000',
  stripeAccountId: null,
  stripeAccountEnabled: false,
  storageUsedBytes: 0,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides
})

export const createMockOrganizationMember = (overrides = {}) => ({
  id: 'member-123',
  organizationId: 'org-123',
  userId: 'user-123',
  role: 'member' as const,
  status: 'active' as const,
  joinedAt: new Date('2024-01-01'),
  createdAt: new Date('2024-01-01'),
  ...overrides
})

export const createMockDocument = (overrides = {}) => ({
  id: 'doc-123',
  title: 'Test Document',
  userId: 'user-123',
  organizationId: null,
  blocks: [],
  settings: {},
  status: 'draft' as const,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides
})

export const createMockRecipient = (overrides = {}) => ({
  id: 'rec-123',
  documentId: 'doc-123',
  email: 'recipient@example.com',
  name: 'Test Recipient',
  role: 'signer' as const,
  status: 'pending' as const,
  signedAt: null,
  createdAt: new Date('2024-01-01'),
  ...overrides
})

export const createMockPayment = (overrides = {}) => ({
  id: 'pay-123',
  documentId: 'doc-123',
  recipientId: 'rec-123',
  stripePaymentIntentId: 'pi_test_123',
  amount: 10000, // $100.00 in cents
  currency: 'usd',
  status: 'pending' as const,
  createdAt: new Date('2024-01-01'),
  ...overrides
})

export const createMockInvite = (overrides = {}) => ({
  id: 'invite-123',
  organizationId: 'org-123',
  email: 'invitee@example.com',
  role: 'member' as const,
  token: 'invite-token-123',
  invitedBy: 'user-123',
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  acceptedAt: null,
  createdAt: new Date('2024-01-01'),
  ...overrides
})

export const createMockSession = (overrides = {}) => ({
  user: createMockUser(),
  expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
  ...overrides
})
