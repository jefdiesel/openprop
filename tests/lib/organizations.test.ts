import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateSlug, PLAN_LIMITS } from '@/lib/organizations'

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

    it('should handle empty strings', () => {
      expect(generateSlug('')).toBe('')
      expect(generateSlug('   ')).toBe('')
    })

    it('should convert to lowercase', () => {
      expect(generateSlug('UPPERCASE')).toBe('uppercase')
      expect(generateSlug('MixedCase')).toBe('mixedcase')
    })

    it('should replace multiple spaces with single dash', () => {
      expect(generateSlug('test    multiple    spaces')).toBe('test-multiple-spaces')
    })

    it('should handle unicode characters', () => {
      expect(generateSlug('Café Company')).toBe('caf-company')
      expect(generateSlug('Test Company™')).toBe('test-company')
    })
  })

  describe('PLAN_LIMITS', () => {
    it('should define correct storage limits', () => {
      expect(PLAN_LIMITS.free.storageGb).toBe(0.1)
      expect(PLAN_LIMITS.pro.storageGb).toBe(5)
      expect(PLAN_LIMITS.business.storageGb).toBe(25)
      expect(PLAN_LIMITS.pro_team.storageGb).toBe(5)
      expect(PLAN_LIMITS.business_team.storageGb).toBe(25)
    })

    it('should define correct seat limits', () => {
      expect(PLAN_LIMITS.free.seats).toBe(1)
      expect(PLAN_LIMITS.pro.seats).toBe(1)
      expect(PLAN_LIMITS.business.seats).toBe(1)
      expect(PLAN_LIMITS.pro_team.seats).toBe(10)
      expect(PLAN_LIMITS.business_team.seats).toBeNull() // unlimited
    })
  })
})

// Note: Tests for database operations (createOrganization, getUserRole, etc.)
// would require database mocking or a test database setup.
// These should be implemented with proper DB mocking in Phase 2.
