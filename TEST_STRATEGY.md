# OpenProposal Test Strategy

## Executive Summary

This document outlines a comprehensive testing strategy for the OpenProposal codebase. Based on the codebase analysis, there are currently **no existing tests** in the project. This strategy provides a phased approach to establishing robust test coverage across all critical systems.

## Current State Analysis

### Codebase Overview
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript (strict mode enabled)
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js
- **API Routes**: 87 route handlers
- **React Components**: 85+ TSX files
- **Core Libraries**: 20+ utility/service modules

### Current Test Coverage
**Status**: No test files found in the project (excluding node_modules)

### Testing Infrastructure
**Current Setup**: None
- No test framework configured in package.json
- No test scripts defined
- No test configuration files (jest.config.js, vitest.config.ts, etc.)
- No CI/CD pipeline for automated testing

## Recommended Testing Stack

### 1. Unit & Integration Testing: Vitest
**Rationale**:
- Native ESM support (better Next.js compatibility)
- Faster than Jest for TypeScript projects
- Compatible with existing Vite ecosystem
- Hot Module Replacement for test files
- Built-in TypeScript support

### 2. Component Testing: React Testing Library
**Rationale**:
- Industry standard for React component testing
- Encourages testing user behavior over implementation
- Works seamlessly with Vitest
- Excellent TypeScript support

### 3. E2E Testing: Playwright
**Rationale**:
- Multi-browser support (Chrome, Firefox, Safari)
- Excellent TypeScript support
- Built-in test runner and assertions
- Network interception and mocking
- Screenshot and video recording on failures
- Better stability than Cypress for complex flows

### 4. API Testing: Supertest + MSW
**Rationale**:
- Supertest: HTTP assertion library for API routes
- MSW (Mock Service Worker): Intercept and mock external API calls
- Both integrate well with Vitest

## Test Priority Matrix

### P0 (Critical - Implement First)
These areas handle sensitive data and core business logic:

1. **Authentication & Authorization**
   - User authentication flows (magic link, OAuth)
   - Session management
   - Permission checks (org roles, document access)
   - API route authentication middleware

2. **Payment Processing**
   - Stripe payment intent creation
   - Payment amount validation and conversion
   - Fee calculation logic
   - Payment status tracking

3. **Database Operations**
   - Organization CRUD operations
   - Document access control
   - Member management
   - Data integrity constraints

### P1 (High Priority - Implement Second)
Business-critical features:

1. **Document Management**
   - Document creation and updates
   - Template usage
   - Version control
   - Document sharing/access

2. **API Routes**
   - Organization endpoints
   - Payment endpoints
   - Settings endpoints
   - Integration endpoints (DocuSign, etc.)

3. **Core Utilities**
   - Slug generation and uniqueness
   - Email template rendering
   - PDF generation
   - Storage utilities

### P2 (Medium Priority - Implement Third)
Supporting features:

1. **React Components**
   - Form validation
   - Payment forms
   - Document builder components
   - Team management UI

2. **Hooks**
   - useDocuments
   - useSubscription
   - useBuilder
   - useSession

### P3 (Lower Priority - Implement Last)
UI and enhancement features:

1. **UI Components**
   - shadcn/ui component customizations
   - Layout components
   - Styling and visual regression

2. **Integration Features**
   - DocuSign import
   - CRM integrations
   - Webhook handling

## Test Implementation Plan

### Phase 1: Foundation Setup (Week 1)

#### Install Dependencies
```json
{
  "devDependencies": {
    "vitest": "^1.1.0",
    "@vitest/ui": "^1.1.0",
    "@testing-library/react": "^14.1.2",
    "@testing-library/jest-dom": "^6.1.5",
    "@testing-library/user-event": "^14.5.1",
    "jsdom": "^23.0.1",
    "@playwright/test": "^1.40.1",
    "supertest": "^6.3.3",
    "@types/supertest": "^6.0.2",
    "msw": "^2.0.11"
  }
}
```

#### Configuration Files

**vitest.config.ts**
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '.next/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData.ts'
      ],
      thresholds: {
        statements: 70,
        branches: 70,
        functions: 70,
        lines: 70
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
```

**playwright.config.ts**
```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    }
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI
  }
})
```

**tests/setup.ts**
```typescript
import '@testing-library/jest-dom'
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

expect.extend(matchers)

// Clean up after each test
afterEach(() => {
  cleanup()
})

// Mock environment variables
process.env.NEXTAUTH_SECRET = 'test-secret'
process.env.NEXTAUTH_URL = 'http://localhost:3000'
```

#### Update package.json
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:all": "pnpm test && pnpm test:e2e"
  }
}
```

### Phase 2: Critical Path Tests (Week 2-3)

#### 1. Authentication Tests

**tests/lib/auth.test.ts**
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { auth, signIn, signOut } from '@/lib/auth'
import { db } from '@/lib/db'

// Mock database
vi.mock('@/lib/db', () => ({
  db: {
    insert: vi.fn(),
    select: vi.fn(),
    update: vi.fn()
  }
}))

describe('Authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('auth()', () => {
    it('should return null when no session exists', async () => {
      // Mock NextAuth to return no session
      vi.mock('next-auth', () => ({
        default: vi.fn(() => ({
          auth: vi.fn(() => null)
        }))
      }))

      const session = await auth()
      expect(session).toBeNull()
    })

    it('should return user session when authenticated', async () => {
      const mockSession = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User'
        }
      }

      // Test implementation would use actual NextAuth mock
      expect(mockSession.user.id).toBe('user-123')
    })
  })

  describe('Profile creation on signup', () => {
    it('should auto-create profile for new users', async () => {
      const userId = 'new-user-123'

      // Mock the profile creation
      const insertMock = vi.fn().mockResolvedValue([{
        id: userId,
        brandColor: '#000000',
        stripeAccountEnabled: false
      }])

      // Test that profile is created with correct defaults
      expect(insertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          id: userId,
          brandColor: '#000000',
          stripeAccountEnabled: false
        })
      )
    })
  })
})
```

#### 2. Organization Management Tests

**tests/lib/organizations.test.ts**
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createOrganization,
  getUserOrganizations,
  getUserRole,
  canManageMembers,
  generateSlug,
  createUniqueSlug,
  inviteMember,
  acceptInvite
} from '@/lib/organizations'

describe('Organization Management', () => {
  describe('generateSlug', () => {
    it('should convert organization name to URL-safe slug', () => {
      expect(generateSlug('Acme Corporation')).toBe('acme-corporation')
      expect(generateSlug('Test & Co.')).toBe('test-co')
      expect(generateSlug('  Extra   Spaces  ')).toBe('extra-spaces')
      expect(generateSlug('Special!@#$%Characters')).toBe('specialcharacters')
    })

    it('should handle maximum length', () => {
      const longName = 'a'.repeat(100)
      const slug = generateSlug(longName)
      expect(slug.length).toBeLessThanOrEqual(50)
    })

    it('should remove leading and trailing dashes', () => {
      expect(generateSlug('-test-')).toBe('test')
      expect(generateSlug('---test---')).toBe('test')
    })
  })

  describe('createUniqueSlug', () => {
    it('should append counter when slug exists', async () => {
      // Mock DB to return existing slug on first call, none on second
      const dbMock = vi.fn()
        .mockResolvedValueOnce([{ id: 'existing' }]) // First slug exists
        .mockResolvedValueOnce([]) // Second slug available

      const slug = await createUniqueSlug('test-org')
      // Should try 'test-org', find it exists, then try 'test-org-1'
      expect(dbMock).toHaveBeenCalledTimes(2)
    })
  })

  describe('createOrganization', () => {
    it('should create organization with owner as first member', async () => {
      const orgData = {
        name: 'Test Org',
        ownerId: 'user-123',
        options: {
          logoUrl: 'https://example.com/logo.png',
          brandColor: '#FF0000'
        }
      }

      // Mock would verify:
      // 1. Organization is created
      // 2. Owner is added with role 'owner' and status 'active'
      // 3. Profile's currentOrganizationId is updated
    })

    it('should use default brand color when not provided', async () => {
      // Test that default #000000 is used
    })
  })

  describe('getUserRole', () => {
    it('should return null for non-members', async () => {
      const role = await getUserRole('org-123', 'non-member-user')
      expect(role).toBeNull()
    })

    it('should return null for removed members', async () => {
      // Test that removed status returns null
    })

    it('should return correct role for active members', async () => {
      // Test owner, admin, member roles
    })
  })

  describe('canManageMembers', () => {
    it('should return true for owners', async () => {
      // Mock owner role
      const canManage = await canManageMembers('org-123', 'owner-user')
      expect(canManage).toBe(true)
    })

    it('should return true for admins', async () => {
      const canManage = await canManageMembers('org-123', 'admin-user')
      expect(canManage).toBe(true)
    })

    it('should return false for regular members', async () => {
      const canManage = await canManageMembers('org-123', 'member-user')
      expect(canManage).toBe(false)
    })
  })

  describe('inviteMember', () => {
    it('should create invite with token and expiry', async () => {
      const invite = await inviteMember(
        'org-123',
        'newuser@example.com',
        'member',
        'inviter-123'
      )

      expect(invite).toMatchObject({
        email: 'newuser@example.com',
        role: 'member',
        organizationId: 'org-123'
      })
      expect(invite.token).toBeTruthy()
      expect(invite.expiresAt).toBeInstanceOf(Date)
    })

    it('should normalize email to lowercase', async () => {
      const invite = await inviteMember(
        'org-123',
        'NewUser@EXAMPLE.COM',
        'admin',
        'inviter-123'
      )

      expect(invite.email).toBe('newuser@example.com')
    })
  })

  describe('acceptInvite', () => {
    it('should reject expired invites', async () => {
      // Mock expired invite
      await expect(acceptInvite('expired-token', 'user-123'))
        .rejects.toThrow('Invite expired')
    })

    it('should reject already accepted invites', async () => {
      await expect(acceptInvite('used-token', 'user-123'))
        .rejects.toThrow('Invite already accepted')
    })

    it('should add new member and update profile', async () => {
      // Test successful invite acceptance flow
    })

    it('should reactivate removed members', async () => {
      // Test that removed members are reactivated with new role
    })
  })
})
```

#### 3. Permission System Tests

**tests/lib/permissions.test.ts**
```typescript
import { describe, it, expect } from 'vitest'
import {
  roleHasPermission,
  getRolePermissions,
  hasOrgPermission,
  requireOrgPermission
} from '@/lib/permissions'

describe('Permission System', () => {
  describe('roleHasPermission', () => {
    it('should grant all permissions to owner', () => {
      expect(roleHasPermission('owner', 'org:delete')).toBe(true)
      expect(roleHasPermission('owner', 'billing:manage')).toBe(true)
      expect(roleHasPermission('owner', 'members:remove')).toBe(true)
    })

    it('should deny billing:manage to admin', () => {
      expect(roleHasPermission('admin', 'billing:manage')).toBe(false)
    })

    it('should deny org:delete to admin', () => {
      expect(roleHasPermission('admin', 'org:delete')).toBe(false)
    })

    it('should allow admin to manage members', () => {
      expect(roleHasPermission('admin', 'members:invite')).toBe(true)
      expect(roleHasPermission('admin', 'members:remove')).toBe(true)
    })

    it('should deny member from managing other members', () => {
      expect(roleHasPermission('member', 'members:invite')).toBe(false)
      expect(roleHasPermission('member', 'members:remove')).toBe(false)
    })

    it('should allow all roles to read org', () => {
      expect(roleHasPermission('owner', 'org:read')).toBe(true)
      expect(roleHasPermission('admin', 'org:read')).toBe(true)
      expect(roleHasPermission('member', 'org:read')).toBe(true)
    })
  })

  describe('requireOrgPermission', () => {
    it('should return unauthorized when no session', async () => {
      // Mock no session
      const result = await requireOrgPermission('org-123', 'org:read')
      expect(result.authorized).toBe(false)
      expect(result.error).toBe('Unauthorized')
    })

    it('should return error when user not a member', async () => {
      // Mock session but user not in org
      const result = await requireOrgPermission('org-123', 'org:read')
      expect(result.authorized).toBe(false)
      expect(result.error).toBe('Not a member of this organization')
    })

    it('should return error when user lacks permission', async () => {
      // Mock member trying to delete org
      const result = await requireOrgPermission('org-123', 'org:delete')
      expect(result.authorized).toBe(false)
      expect(result.error).toBe('Insufficient permissions')
    })

    it('should authorize when user has permission', async () => {
      // Mock owner with billing permission
      const result = await requireOrgPermission('org-123', 'billing:manage')
      expect(result.authorized).toBe(true)
      expect(result.userId).toBeTruthy()
      expect(result.role).toBe('owner')
    })
  })
})
```

#### 4. Payment Processing Tests

**tests/lib/stripe.test.ts**
```typescript
import { describe, it, expect, vi } from 'vitest'
import { toCents, createPaymentIntent } from '@/lib/stripe'

describe('Payment Processing', () => {
  describe('toCents', () => {
    it('should convert dollars to cents correctly', () => {
      expect(toCents(10.00)).toBe(1000)
      expect(toCents(10.50)).toBe(1050)
      expect(toCents(0.01)).toBe(1)
      expect(toCents(999.99)).toBe(99999)
    })

    it('should handle rounding correctly', () => {
      expect(toCents(10.005)).toBe(1001)
      expect(toCents(10.004)).toBe(1000)
    })

    it('should handle zero', () => {
      expect(toCents(0)).toBe(0)
    })
  })

  describe('createPaymentIntent', () => {
    it('should create payment intent with correct amount', async () => {
      const mockStripe = vi.fn()

      // Test payment intent creation with metadata
    })

    it('should calculate platform fee correctly', async () => {
      const amount = 10000 // $100.00
      const expectedFee = Math.round(amount * 0.025) // 2.5%

      // Verify platform fee calculation
      expect(expectedFee).toBe(250) // $2.50
    })

    it('should not charge platform fee without Stripe Connect account', async () => {
      // Test that fee is undefined when no stripeAccountId
    })
  })
})
```

#### 5. API Route Tests

**tests/api/organizations/route.test.ts**
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from '@/app/api/organizations/route'
import { NextRequest } from 'next/server'

describe('Organizations API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/organizations', () => {
    it('should return 401 when not authenticated', async () => {
      // Mock no session
      const response = await GET()
      expect(response.status).toBe(401)

      const data = await response.json()
      expect(data.error).toBe('Unauthorized')
    })

    it('should return user organizations when authenticated', async () => {
      // Mock authenticated session
      const response = await GET()
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.organizations).toBeInstanceOf(Array)
    })

    it('should handle database errors gracefully', async () => {
      // Mock database error
      const response = await GET()
      expect(response.status).toBe(500)
      expect(await response.json()).toMatchObject({
        error: 'Failed to fetch organizations'
      })
    })
  })

  describe('POST /api/organizations', () => {
    it('should return 401 when not authenticated', async () => {
      const request = new NextRequest('http://localhost/api/organizations', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test Org' })
      })

      const response = await POST(request)
      expect(response.status).toBe(401)
    })

    it('should validate organization name length', async () => {
      const request = new NextRequest('http://localhost/api/organizations', {
        method: 'POST',
        body: JSON.stringify({ name: 'A' }) // Too short
      })

      const response = await POST(request)
      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.error).toContain('at least 2 characters')
    })

    it('should create organization with valid data', async () => {
      const orgData = {
        name: 'Test Organization',
        logoUrl: 'https://example.com/logo.png',
        brandColor: '#FF0000'
      }

      const request = new NextRequest('http://localhost/api/organizations', {
        method: 'POST',
        body: JSON.stringify(orgData)
      })

      const response = await POST(request)
      expect(response.status).toBe(201)

      const data = await response.json()
      expect(data.organization).toMatchObject({
        name: 'Test Organization',
        logoUrl: orgData.logoUrl,
        brandColor: orgData.brandColor
      })
    })

    it('should trim whitespace from organization name', async () => {
      const request = new NextRequest('http://localhost/api/organizations', {
        method: 'POST',
        body: JSON.stringify({ name: '  Test Org  ' })
      })

      const response = await POST(request)
      expect(response.status).toBe(201)

      const data = await response.json()
      expect(data.organization.name).toBe('Test Org')
    })
  })
})
```

**tests/api/payments/create-intent/route.test.ts**
```typescript
import { describe, it, expect, vi } from 'vitest'
import { POST } from '@/app/api/payments/create-intent/route'
import { NextRequest } from 'next/server'

describe('Payment Intent API', () => {
  describe('POST /api/payments/create-intent', () => {
    it('should validate required fields', async () => {
      const request = new NextRequest('http://localhost/api/payments/create-intent', {
        method: 'POST',
        body: JSON.stringify({})
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
    })

    it('should reject negative amounts', async () => {
      const request = new NextRequest('http://localhost/api/payments/create-intent', {
        method: 'POST',
        body: JSON.stringify({
          amount: -10,
          currency: 'usd',
          documentId: 'doc-123',
          recipientId: 'rec-123'
        })
      })

      const response = await POST(request)
      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.error).toBe('Invalid amount')
    })

    it('should reject amounts exceeding maximum', async () => {
      const request = new NextRequest('http://localhost/api/payments/create-intent', {
        method: 'POST',
        body: JSON.stringify({
          amount: 1000000, // Over max
          currency: 'usd',
          documentId: 'doc-123',
          recipientId: 'rec-123'
        })
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
      expect(await response.json()).toMatchObject({
        error: expect.stringContaining('cannot exceed')
      })
    })

    it('should verify document exists', async () => {
      const request = new NextRequest('http://localhost/api/payments/create-intent', {
        method: 'POST',
        body: JSON.stringify({
          amount: 100,
          currency: 'usd',
          documentId: 'nonexistent',
          recipientId: 'rec-123'
        })
      })

      const response = await POST(request)
      expect(response.status).toBe(404)
      expect(await response.json()).toMatchObject({
        error: 'Document not found'
      })
    })

    it('should verify recipient belongs to document', async () => {
      // Test that recipient must be associated with the document
    })

    it('should create payment intent with platform fee when Stripe Connect enabled', async () => {
      // Test fee calculation for connected accounts
    })

    it('should create payment intent without platform fee for standard accounts', async () => {
      // Test no fee when no Stripe Connect
    })
  })
})
```

### Phase 3: Component Tests (Week 4)

**tests/components/auth/user-button.test.tsx**
```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UserButton } from '@/components/auth/user-button'

describe('UserButton Component', () => {
  it('should render user name when authenticated', () => {
    const mockUser = {
      name: 'John Doe',
      email: 'john@example.com',
      image: 'https://example.com/avatar.jpg'
    }

    render(<UserButton user={mockUser} />)
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('should render sign in button when not authenticated', () => {
    render(<UserButton user={null} />)
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('should open dropdown menu on click', async () => {
    const user = userEvent.setup()
    const mockUser = {
      name: 'John Doe',
      email: 'john@example.com'
    }

    render(<UserButton user={mockUser} />)

    const button = screen.getByRole('button')
    await user.click(button)

    expect(screen.getByText(/sign out/i)).toBeInTheDocument()
  })
})
```

**tests/components/team/team-switcher.test.tsx**
```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TeamSwitcher } from '@/components/team/team-switcher'

describe('TeamSwitcher Component', () => {
  it('should display current organization', () => {
    const orgs = [
      { id: '1', name: 'Acme Corp', role: 'owner' },
      { id: '2', name: 'Beta Inc', role: 'member' }
    ]

    render(<TeamSwitcher organizations={orgs} currentOrgId="1" />)
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
  })

  it('should list all organizations in dropdown', async () => {
    const user = userEvent.setup()
    const orgs = [
      { id: '1', name: 'Acme Corp', role: 'owner' },
      { id: '2', name: 'Beta Inc', role: 'member' }
    ]

    render(<TeamSwitcher organizations={orgs} currentOrgId="1" />)

    const button = screen.getByRole('button')
    await user.click(button)

    expect(screen.getByText('Beta Inc')).toBeInTheDocument()
  })

  it('should show personal workspace option', async () => {
    const user = userEvent.setup()
    const orgs = [{ id: '1', name: 'Acme Corp', role: 'owner' }]

    render(<TeamSwitcher organizations={orgs} currentOrgId="1" />)

    const button = screen.getByRole('button')
    await user.click(button)

    expect(screen.getByText(/personal workspace/i)).toBeInTheDocument()
  })
})
```

### Phase 4: E2E Tests (Week 5)

**tests/e2e/auth.spec.ts**
```typescript
import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/)
  })

  test('should login with magic link', async ({ page, context }) => {
    await page.goto('/login')

    // Fill in email
    await page.fill('input[type="email"]', 'test@example.com')
    await page.click('button[type="submit"]')

    // Should show verification message
    await expect(page.locator('text=/check your email/i')).toBeVisible()
  })

  test('should maintain session after page reload', async ({ page }) => {
    // Login first
    // ... login flow

    // Reload page
    await page.reload()

    // Should still be authenticated
    await expect(page).toHaveURL(/\/dashboard/)
  })
})
```

**tests/e2e/document-creation.spec.ts**
```typescript
import { test, expect } from '@playwright/test'

test.describe('Document Creation', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    // ... authentication setup
  })

  test('should create new blank document', async ({ page }) => {
    await page.goto('/documents')
    await page.click('text=New Document')

    // Should navigate to builder
    await expect(page).toHaveURL(/\/documents\/new/)

    // Should show empty document
    await expect(page.locator('[data-testid="document-builder"]')).toBeVisible()
  })

  test('should save document with title', async ({ page }) => {
    await page.goto('/documents/new')

    // Add title
    await page.fill('input[placeholder*="title"]', 'Test Proposal')

    // Add some content
    await page.click('[data-testid="add-text-block"]')
    await page.fill('textarea', 'Test content')

    // Save
    await page.click('button:has-text("Save")')

    // Should show success message
    await expect(page.locator('text=/saved/i')).toBeVisible()
  })

  test('should create document from template', async ({ page }) => {
    await page.goto('/templates')

    // Click use template
    await page.click('[data-testid="use-template"]:first-of-type')

    // Should navigate to new document with template content
    await expect(page).toHaveURL(/\/documents\//)
    await expect(page.locator('[data-testid="document-builder"]')).toBeVisible()
  })
})
```

**tests/e2e/payment-flow.spec.ts**
```typescript
import { test, expect } from '@playwright/test'

test.describe('Payment Flow', () => {
  test('should request payment during signing', async ({ page }) => {
    // Navigate to signing page (with payment required)
    await page.goto('/sign/test-token')

    // Should show payment step
    await expect(page.locator('text=/payment required/i')).toBeVisible()

    // Fill in payment details (using Stripe test card)
    await page.frameLocator('iframe[name*="stripe"]').locator('[name="cardnumber"]')
      .fill('4242424242424242')
    await page.frameLocator('iframe[name*="stripe"]').locator('[name="exp-date"]')
      .fill('12/30')
    await page.frameLocator('iframe[name*="stripe"]').locator('[name="cvc"]')
      .fill('123')

    // Submit payment
    await page.click('button:has-text("Pay")')

    // Should proceed to signature
    await expect(page.locator('[data-testid="signature-canvas"]')).toBeVisible()
  })

  test('should handle payment errors', async ({ page }) => {
    // Use card that will decline
    await page.goto('/sign/test-token')

    await page.frameLocator('iframe[name*="stripe"]').locator('[name="cardnumber"]')
      .fill('4000000000000002') // Declined card

    await page.click('button:has-text("Pay")')

    // Should show error message
    await expect(page.locator('text=/payment.*declined/i')).toBeVisible()
  })
})
```

**tests/e2e/organization-management.spec.ts**
```typescript
import { test, expect } from '@playwright/test'

test.describe('Organization Management', () => {
  test('should create new organization', async ({ page }) => {
    await page.goto('/create-team')

    await page.fill('input[name="name"]', 'Test Organization')
    await page.click('button[type="submit"]')

    // Should redirect to organization dashboard
    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page.locator('text=Test Organization')).toBeVisible()
  })

  test('should invite team member', async ({ page }) => {
    await page.goto('/settings/team')

    await page.click('button:has-text("Invite")')
    await page.fill('input[type="email"]', 'newmember@example.com')
    await page.selectOption('select[name="role"]', 'member')
    await page.click('button:has-text("Send Invite")')

    // Should show invite in list
    await expect(page.locator('text=newmember@example.com')).toBeVisible()
  })

  test('should switch between organizations', async ({ page }) => {
    await page.goto('/dashboard')

    // Open team switcher
    await page.click('[data-testid="team-switcher"]')

    // Select different org
    await page.click('text=Beta Inc')

    // Should update UI
    await expect(page.locator('[data-testid="current-org"]')).toHaveText('Beta Inc')
  })
})
```

## CI/CD Integration

### GitHub Actions Workflow

**.github/workflows/test.yml**
```yaml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  unit-tests:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Run database migrations
        run: pnpm db:push
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test

      - name: Run unit tests
        run: pnpm test:coverage
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
          NEXTAUTH_SECRET: test-secret

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  e2e-tests:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run database migrations
        run: pnpm db:push
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test

      - name: Build application
        run: pnpm build
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test

      - name: Run E2E tests
        run: pnpm test:e2e
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
          NEXTAUTH_SECRET: test-secret
          NEXTAUTH_URL: http://localhost:3000

      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

  type-check:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Type check
        run: pnpm tsc --noEmit
```

## Test Data Management

### Mock Data Factory

**tests/factories/user.factory.ts**
```typescript
export const createMockUser = (overrides = {}) => ({
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  image: null,
  createdAt: new Date(),
  updatedAt: new Date(),
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
  createdAt: new Date(),
  ...overrides
})

export const createMockDocument = (overrides = {}) => ({
  id: 'doc-123',
  title: 'Test Document',
  userId: 'user-123',
  organizationId: null,
  blocks: [],
  settings: {},
  status: 'draft',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
})
```

### Database Test Utilities

**tests/utils/db.ts**
```typescript
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

export async function cleanDatabase() {
  // Truncate all tables in reverse dependency order
  await db.execute(sql`TRUNCATE TABLE payments CASCADE`)
  await db.execute(sql`TRUNCATE TABLE recipients CASCADE`)
  await db.execute(sql`TRUNCATE TABLE documents CASCADE`)
  await db.execute(sql`TRUNCATE TABLE organization_invites CASCADE`)
  await db.execute(sql`TRUNCATE TABLE organization_members CASCADE`)
  await db.execute(sql`TRUNCATE TABLE organizations CASCADE`)
  await db.execute(sql`TRUNCATE TABLE subscriptions CASCADE`)
  await db.execute(sql`TRUNCATE TABLE profiles CASCADE`)
  await db.execute(sql`TRUNCATE TABLE sessions CASCADE`)
  await db.execute(sql`TRUNCATE TABLE accounts CASCADE`)
  await db.execute(sql`TRUNCATE TABLE users CASCADE`)
}

export async function seedTestData() {
  // Insert basic test data for E2E tests
}
```

## Coverage Goals

### Phase 1 (Weeks 1-3): Critical Coverage
- **Target**: 70% overall coverage
- **Priority**: Auth, Payments, Organizations
- **Metrics**:
  - Statements: 70%
  - Branches: 70%
  - Functions: 70%
  - Lines: 70%

### Phase 2 (Weeks 4-5): Comprehensive Coverage
- **Target**: 80% overall coverage
- **Expanded**: API routes, Components, Hooks
- **Metrics**:
  - Statements: 80%
  - Branches: 75%
  - Functions: 80%
  - Lines: 80%

### Phase 3 (Week 6+): Full Coverage
- **Target**: 85%+ overall coverage
- **Complete**: E2E flows, Edge cases
- **Metrics**:
  - Statements: 85%
  - Branches: 80%
  - Functions: 85%
  - Lines: 85%

## Maintenance & Best Practices

### Test Organization
```
tests/
├── setup.ts                 # Global test setup
├── factories/               # Mock data factories
│   ├── user.factory.ts
│   └── organization.factory.ts
├── utils/                   # Test utilities
│   ├── db.ts
│   └── auth.ts
├── lib/                     # Library tests
│   ├── auth.test.ts
│   ├── organizations.test.ts
│   ├── permissions.test.ts
│   └── stripe.test.ts
├── api/                     # API route tests
│   ├── organizations/
│   └── payments/
├── components/              # Component tests
│   ├── auth/
│   ├── team/
│   └── payments/
└── e2e/                     # E2E tests
    ├── auth.spec.ts
    ├── document-creation.spec.ts
    └── payment-flow.spec.ts
```

### Writing Good Tests
1. **Follow AAA Pattern**: Arrange, Act, Assert
2. **One Assertion Per Test**: Keep tests focused
3. **Use Descriptive Names**: `should reject expired invites` not `test1`
4. **Mock External Dependencies**: Database, Stripe, Email services
5. **Test Error Cases**: Not just happy paths
6. **Avoid Implementation Details**: Test behavior, not internals
7. **Use Factories**: Keep test data consistent
8. **Clean Up**: Reset state between tests

### Code Review Checklist
- [ ] New features include tests
- [ ] Tests cover happy path and error cases
- [ ] No hardcoded test data (use factories)
- [ ] Tests are isolated (no interdependencies)
- [ ] Mock external services appropriately
- [ ] Test names clearly describe what's being tested
- [ ] Coverage meets minimum threshold (70%)

## Monitoring & Reporting

### Coverage Tracking
- **Tool**: Vitest coverage with v8 provider
- **Reports**: HTML, JSON, and text formats
- **Threshold Enforcement**: Fail builds below 70% coverage
- **Trend Tracking**: Monitor coverage over time in CI

### Test Performance
- **Unit Tests**: Should run in < 30 seconds
- **E2E Tests**: Should run in < 5 minutes
- **Monitoring**: Track test execution time in CI
- **Optimization**: Parallelize tests, use test.concurrent

### Quality Metrics
- **Test Reliability**: < 1% flaky test rate
- **Test Maintenance**: Update tests with code changes
- **Regression Prevention**: Add test for each bug fix
- **Documentation**: Keep this strategy updated

## Appendix

### Additional Resources
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

### Test Environment Setup
- Use separate test database (never production)
- Mock external APIs (Stripe, email services)
- Use deterministic test data
- Clean database between test runs
- Set appropriate timeouts for async operations

### Known Testing Challenges
1. **Real-time Collaboration**: Use mock Liveblocks client
2. **File Uploads**: Mock S3 operations
3. **Email Sending**: Mock Resend API
4. **Stripe Webhooks**: Use Stripe test mode
5. **PDF Generation**: Mock @react-pdf/renderer

---

**Document Version**: 1.0
**Last Updated**: 2026-01-09
**Maintained By**: Development Team
