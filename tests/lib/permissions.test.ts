import { describe, it, expect } from 'vitest'
import { roleHasPermission, getRolePermissions } from '@/lib/permissions'

describe('Permission System', () => {
  describe('roleHasPermission', () => {
    it('should grant all permissions to owner', () => {
      expect(roleHasPermission('owner', 'org:delete')).toBe(true)
      expect(roleHasPermission('owner', 'billing:manage')).toBe(true)
      expect(roleHasPermission('owner', 'members:remove')).toBe(true)
      expect(roleHasPermission('owner', 'documents:create')).toBe(true)
      expect(roleHasPermission('owner', 'storage:upload')).toBe(true)
    })

    it('should deny billing:manage to admin', () => {
      expect(roleHasPermission('admin', 'billing:manage')).toBe(false)
    })

    it('should deny org:delete to admin', () => {
      expect(roleHasPermission('admin', 'org:delete')).toBe(false)
    })

    it('should allow admin to manage members', () => {
      expect(roleHasPermission('admin', 'members:invite')).toBe(true)
      expect(roleHasPermission('admin', 'members:update')).toBe(true)
      expect(roleHasPermission('admin', 'members:remove')).toBe(true)
    })

    it('should allow admin to read billing', () => {
      expect(roleHasPermission('admin', 'billing:read')).toBe(true)
    })

    it('should deny member from managing other members', () => {
      expect(roleHasPermission('member', 'members:invite')).toBe(false)
      expect(roleHasPermission('member', 'members:remove')).toBe(false)
      expect(roleHasPermission('member', 'members:update')).toBe(false)
    })

    it('should allow member to read members', () => {
      expect(roleHasPermission('member', 'members:read')).toBe(true)
    })

    it('should deny member from updating org', () => {
      expect(roleHasPermission('member', 'org:update')).toBe(false)
    })

    it('should allow all roles to read org', () => {
      expect(roleHasPermission('owner', 'org:read')).toBe(true)
      expect(roleHasPermission('admin', 'org:read')).toBe(true)
      expect(roleHasPermission('member', 'org:read')).toBe(true)
    })

    it('should allow all roles to create documents', () => {
      expect(roleHasPermission('owner', 'documents:create')).toBe(true)
      expect(roleHasPermission('admin', 'documents:create')).toBe(true)
      expect(roleHasPermission('member', 'documents:create')).toBe(true)
    })

    it('should allow all roles to upload to storage', () => {
      expect(roleHasPermission('owner', 'storage:upload')).toBe(true)
      expect(roleHasPermission('admin', 'storage:upload')).toBe(true)
      expect(roleHasPermission('member', 'storage:upload')).toBe(true)
    })

    it('should deny member from deleting documents', () => {
      expect(roleHasPermission('member', 'documents:delete')).toBe(false)
    })

    it('should allow admin to delete documents', () => {
      expect(roleHasPermission('admin', 'documents:delete')).toBe(true)
    })
  })

  describe('getRolePermissions', () => {
    it('should return all permissions for owner', () => {
      const permissions = getRolePermissions('owner')
      expect(permissions).toContain('org:delete')
      expect(permissions).toContain('billing:manage')
      expect(permissions).toContain('members:remove')
      expect(permissions.length).toBeGreaterThan(10)
    })

    it('should return subset for admin', () => {
      const permissions = getRolePermissions('admin')
      expect(permissions).toContain('members:invite')
      expect(permissions).toContain('org:update')
      expect(permissions).not.toContain('org:delete')
      expect(permissions).not.toContain('billing:manage')
    })

    it('should return limited permissions for member', () => {
      const permissions = getRolePermissions('member')
      expect(permissions).toContain('documents:create')
      expect(permissions).toContain('documents:read')
      expect(permissions).not.toContain('members:invite')
      expect(permissions).not.toContain('org:update')
    })

    it('should return different permission counts by role', () => {
      const ownerPerms = getRolePermissions('owner')
      const adminPerms = getRolePermissions('admin')
      const memberPerms = getRolePermissions('member')

      expect(ownerPerms.length).toBeGreaterThan(adminPerms.length)
      expect(adminPerms.length).toBeGreaterThan(memberPerms.length)
    })
  })
})
