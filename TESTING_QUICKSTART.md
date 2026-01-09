# Testing Quick Start Guide

This guide will help you get started with testing in OpenProposal.

## Prerequisites

- Node.js 18+ installed
- pnpm package manager
- PostgreSQL database (for integration tests)

## Installation

### 1. Install Test Dependencies

```bash
pnpm add -D vitest @vitest/ui @vitejs/plugin-react \
  @testing-library/react @testing-library/jest-dom @testing-library/user-event \
  jsdom @playwright/test supertest @types/supertest msw
```

### 2. Update package.json Scripts

The following scripts should already be added:

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

## Running Tests

### Unit Tests

```bash
# Run all unit tests
pnpm test

# Run tests in watch mode (recommended for development)
pnpm test

# Run tests with UI
pnpm test:ui

# Run tests with coverage
pnpm test:coverage
```

### E2E Tests

```bash
# First time: Install Playwright browsers
npx playwright install

# Run E2E tests
pnpm test:e2e

# Run E2E tests in UI mode (interactive)
pnpm test:e2e:ui

# Run E2E tests for specific browser
npx playwright test --project=chromium
```

### Run All Tests

```bash
pnpm test:all
```

## Writing Your First Test

### Unit Test Example

Create a file: `tests/lib/myfunction.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { myFunction } from '@/lib/myfunction'

describe('myFunction', () => {
  it('should do something', () => {
    const result = myFunction('input')
    expect(result).toBe('expected output')
  })

  it('should handle edge cases', () => {
    expect(myFunction('')).toBe('')
    expect(myFunction(null)).toBe(null)
  })
})
```

### Component Test Example

Create a file: `tests/components/MyComponent.test.tsx`

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MyComponent } from '@/components/MyComponent'

describe('MyComponent', () => {
  it('should render text', () => {
    render(<MyComponent text="Hello" />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('should handle clicks', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(<MyComponent onClick={handleClick} />)

    const button = screen.getByRole('button')
    await user.click(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### E2E Test Example

Create a file: `tests/e2e/feature.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test('should perform user flow', async ({ page }) => {
  // Navigate to page
  await page.goto('/dashboard')

  // Interact with page
  await page.click('text=New Document')

  // Assert outcome
  await expect(page).toHaveURL(/\/documents\/new/)
})
```

## Testing Best Practices

### 1. Test Organization

```
tests/
├── lib/              # Business logic tests
├── api/              # API route tests
├── components/       # React component tests
├── e2e/              # End-to-end tests
├── factories/        # Mock data factories
└── utils/            # Test utilities
```

### 2. Naming Conventions

- Test files: `*.test.ts` or `*.test.tsx`
- E2E tests: `*.spec.ts`
- Use descriptive test names: `should create organization when valid data provided`

### 3. AAA Pattern

```typescript
it('should do something', () => {
  // Arrange - Set up test data
  const input = 'test'

  // Act - Perform the action
  const result = doSomething(input)

  // Assert - Verify the outcome
  expect(result).toBe('expected')
})
```

### 4. Use Factories for Test Data

```typescript
import { createMockUser, createMockOrganization } from '@/tests/factories/user.factory'

const user = createMockUser({ name: 'Custom Name' })
const org = createMockOrganization({ name: 'Test Org' })
```

### 5. Mock External Dependencies

```typescript
import { vi } from 'vitest'

// Mock a module
vi.mock('@/lib/stripe', () => ({
  createPaymentIntent: vi.fn().mockResolvedValue({ id: 'pi_123' })
}))

// Mock environment variables
process.env.STRIPE_SECRET_KEY = 'sk_test_123'
```

## Common Testing Scenarios

### Testing API Routes

```typescript
import { POST } from '@/app/api/organizations/route'
import { NextRequest } from 'next/server'

it('should create organization', async () => {
  const request = new NextRequest('http://localhost/api/organizations', {
    method: 'POST',
    body: JSON.stringify({ name: 'Test Org' })
  })

  const response = await POST(request)
  expect(response.status).toBe(201)

  const data = await response.json()
  expect(data.organization.name).toBe('Test Org')
})
```

### Testing with Authentication

```typescript
import { vi } from 'vitest'

// Mock authenticated session
vi.mock('@/lib/auth', () => ({
  auth: vi.fn().mockResolvedValue({
    user: { id: 'user-123', email: 'test@example.com' }
  })
}))
```

### Testing Forms

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

it('should submit form', async () => {
  const user = userEvent.setup()
  const onSubmit = vi.fn()

  render(<MyForm onSubmit={onSubmit} />)

  await user.type(screen.getByLabelText('Name'), 'John Doe')
  await user.click(screen.getByRole('button', { name: /submit/i }))

  expect(onSubmit).toHaveBeenCalledWith({ name: 'John Doe' })
})
```

### Testing Async Operations

```typescript
it('should load data', async () => {
  const data = await fetchData()
  expect(data).toBeTruthy()
})

// Or with waitFor
import { waitFor } from '@testing-library/react'

await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument()
})
```

## Debugging Tests

### Visual Debugging (Vitest UI)

```bash
pnpm test:ui
```

Opens a browser interface to run and debug tests visually.

### Playwright Debugging

```bash
# Run in headed mode (see browser)
npx playwright test --headed

# Debug mode (pause on each action)
npx playwright test --debug

# Generate code from browser interactions
npx playwright codegen http://localhost:3000
```

### Console Logs in Tests

```typescript
// Enable console output
process.env.DEBUG_TESTS = 'true'

// Add debug logs
it('should debug', () => {
  console.log('Debug info:', value)
  expect(value).toBe(expected)
})
```

## Coverage Reports

```bash
# Generate coverage
pnpm test:coverage

# Open HTML report
open coverage/index.html
```

### Coverage Thresholds

The project enforces minimum 70% coverage:
- Statements: 70%
- Branches: 70%
- Functions: 70%
- Lines: 70%

## CI/CD Integration

Tests automatically run on:
- Every push to `main` or `develop`
- Every pull request

Check `.github/workflows/test.yml` for CI configuration.

## Troubleshooting

### Tests Timeout

Increase timeout in `vitest.config.ts`:

```typescript
export default defineConfig({
  test: {
    testTimeout: 20000, // 20 seconds
  }
})
```

### Database Connection Issues

Ensure PostgreSQL is running and `DATABASE_URL` is set:

```bash
export DATABASE_URL="postgresql://user:pass@localhost:5432/test_db"
```

### Module Resolution Issues

Check `tsconfig.json` has correct path aliases:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Playwright Browser Issues

Reinstall browsers:

```bash
npx playwright install --with-deps
```

## Next Steps

1. Read the full [TEST_STRATEGY.md](/Users/jef/openprop/openproposal/TEST_STRATEGY.md)
2. Check existing test examples in `tests/` directory
3. Start with testing critical paths (auth, payments, organizations)
4. Gradually increase coverage to 70%+

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Getting Help

- Check test examples in `tests/` directory
- Review existing test patterns
- Consult TEST_STRATEGY.md for detailed guidance
