/**
 * User Roles Enum
 * 
 * Scope: LOCKED per MODULE_SCOPE_LOCK.md Section 2.5
 * Roles: 4 ONLY (platform_admin, developer_ops, support, viewer)
 * Evidence: MODULE_SCOPE_LOCK.md Lines 199-204
 */

export enum UserRole {
  PLATFORM_ADMIN = 'platform_admin',
  DEVELOPER_OPS = 'developer_ops',
  SUPPORT = 'support',
  VIEWER = 'viewer',
}

/**
 * Check if a role is valid
 */
export function isValidRole(role: string): role is UserRole {
  return Object.values(UserRole).includes(role as UserRole);
}

/**
 * Get all valid roles
 */
export function getAllRoles(): UserRole[] {
  return Object.values(UserRole);
}
