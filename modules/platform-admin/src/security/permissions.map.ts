import { UserRole } from './roles.enum';

/**
 * Permissions Map
 * 
 * Scope: LOCKED per MODULE_SECURITY_LAWS.md Section 3.2
 * Evidence: MODULE_SECURITY_LAWS.md Lines 75-80
 * 
 * Permission Matrix:
 * - platform_admin: Read/Write all resources
 * - developer_ops: Read/Write orgs & mappings, Read-only users
 * - support: Read-only all resources
 * - viewer: Read-only all resources
 */

export enum Resource {
  ORGANIZATIONS = 'organizations',
  ORG_MAPPINGS = 'org_mappings',
  INTERNAL_USERS = 'internal_users',
  AUDIT_LOGS = 'audit_logs',
}

export enum Action {
  READ = 'read',
  WRITE = 'write',
}

type PermissionMatrix = {
  [key in UserRole]: {
    [key in Resource]: Action[];
  };
};

export const PERMISSIONS: PermissionMatrix = {
  [UserRole.PLATFORM_ADMIN]: {
    [Resource.ORGANIZATIONS]: [Action.READ, Action.WRITE],
    [Resource.ORG_MAPPINGS]: [Action.READ, Action.WRITE],
    [Resource.INTERNAL_USERS]: [Action.READ, Action.WRITE],
    [Resource.AUDIT_LOGS]: [Action.READ],
  },
  [UserRole.DEVELOPER_OPS]: {
    [Resource.ORGANIZATIONS]: [Action.READ, Action.WRITE],
    [Resource.ORG_MAPPINGS]: [Action.READ, Action.WRITE],
    [Resource.INTERNAL_USERS]: [Action.READ],
    [Resource.AUDIT_LOGS]: [Action.READ],
  },
  [UserRole.SUPPORT]: {
    [Resource.ORGANIZATIONS]: [Action.READ],
    [Resource.ORG_MAPPINGS]: [Action.READ],
    [Resource.INTERNAL_USERS]: [Action.READ],
    [Resource.AUDIT_LOGS]: [Action.READ],
  },
  [UserRole.VIEWER]: {
    [Resource.ORGANIZATIONS]: [Action.READ],
    [Resource.ORG_MAPPINGS]: [Action.READ],
    [Resource.INTERNAL_USERS]: [Action.READ],
    [Resource.AUDIT_LOGS]: [Action.READ],
  },
};

/**
 * Check if a role has permission for a resource and action
 */
export function hasPermission(
  role: UserRole,
  resource: Resource,
  action: Action,
): boolean {
  const permissions = PERMISSIONS[role]?.[resource];
  return permissions?.includes(action) ?? false;
}

/**
 * Assert that a role has permission (throws if not)
 */
export function assertPermission(
  role: UserRole,
  resource: Resource,
  action: Action,
): void {
  if (!hasPermission(role, resource, action)) {
    throw new Error(
      `Unauthorized: Role '${role}' does not have '${action}' permission for '${resource}'`,
    );
  }
}
