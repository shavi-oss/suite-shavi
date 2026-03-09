/**
 * Create Internal User DTO
 * 
 * Purpose: Validate input for creating internal user
 * Evidence: MODULE_SCOPE_LOCK.md Section 2.2 (Lines 72-77)
 */
export class CreateInternalUserDto {
  email!: string;
  name!: string;
  role!: 'platform_admin' | 'developer_ops' | 'support' | 'viewer';
}

/**
 * Update Role DTO — Gate 9
 */
export class UpdateRoleDto {
  role!: 'platform_admin' | 'developer_ops' | 'support' | 'viewer';
}

/**
 * Internal User Response DTO
 */
export class InternalUserResponseDto {
  id!: string;
  email!: string;
  name!: string;
  role!: 'platform_admin' | 'developer_ops' | 'support' | 'viewer';
  status!: 'active' | 'deactivated';
  createdAt!: Date;
  updatedAt!: Date;
  createdBy!: string;
}
