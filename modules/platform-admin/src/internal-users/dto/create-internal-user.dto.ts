/**
 * Create Internal User DTO
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
 * Internal User Response DTO — includes inviteStatus (Gate 10)
 */
export class InternalUserResponseDto {
  id!: string;
  email!: string;
  name!: string;
  role!: 'platform_admin' | 'developer_ops' | 'support' | 'viewer';
  status!: 'active' | 'deactivated';
  inviteStatus!: 'pending' | 'invited' | 'active' | 'expired';
  createdAt!: Date;
  updatedAt!: Date;
  createdBy!: string;
}

/**
 * Invite Response DTO — Gate 10
 * Contains invite URL (raw token in URL, never stored) and expiry.
 */
export class InviteResponseDto {
  inviteUrl!: string;
  expiresAt!: Date;
}

/**
 * Redeem Invite DTO — Gate 10
 * Used by invited user to set their password.
 */
export class RedeemInviteDto {
  uid!: string;       // internal user ID (from URL param)
  token!: string;     // raw invite token (from URL param)
  password!: string;
  confirmPassword!: string;
}
