import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard')

    // Should redirect to login page
    await expect(page).toHaveURL(/\/login/)
  })

  test('should show login page with email input', async ({ page }) => {
    await page.goto('/login')

    // Should have email input field
    const emailInput = page.locator('input[type="email"]')
    await expect(emailInput).toBeVisible()

    // Should have submit button
    const submitButton = page.locator('button[type="submit"]')
    await expect(submitButton).toBeVisible()
  })

  test('should display email verification message after submission', async ({ page }) => {
    await page.goto('/login')

    // Fill in email
    await page.fill('input[type="email"]', 'test@example.com')

    // Submit form
    await page.click('button[type="submit"]')

    // Should show verification message or redirect
    await page.waitForURL(/\/login\/verify/)
  })

  test('should show Google OAuth button', async ({ page }) => {
    await page.goto('/login')

    // Look for Google sign in button
    const googleButton = page.locator('button:has-text("Google")')
    await expect(googleButton).toBeVisible()
  })

  test('should validate email format', async ({ page }) => {
    await page.goto('/login')

    // Try invalid email
    await page.fill('input[type="email"]', 'invalid-email')
    await page.click('button[type="submit"]')

    // HTML5 validation should prevent submission or show error
    const emailInput = page.locator('input[type="email"]')
    const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage)
    expect(validationMessage).toBeTruthy()
  })
})

test.describe('Protected Routes', () => {
  test('should protect dashboard route', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/)
  })

  test('should protect documents route', async ({ page }) => {
    await page.goto('/documents')
    await expect(page).toHaveURL(/\/login/)
  })

  test('should protect settings route', async ({ page }) => {
    await page.goto('/settings')
    await expect(page).toHaveURL(/\/login/)
  })

  test('should allow access to public routes', async ({ page }) => {
    // Home page should be accessible
    await page.goto('/')
    await expect(page).not.toHaveURL(/\/login/)

    // Blog should be accessible
    await page.goto('/blog')
    await expect(page).not.toHaveURL(/\/login/)
  })
})
