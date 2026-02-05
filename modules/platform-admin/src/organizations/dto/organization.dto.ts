/**
 * Create Organization DTO
 * 
 * Purpose: Validate input for creating Suite organization
 * Evidence: MODULE_SCOPE_LOCK.md Section 2.2 (Line 60)
 */
export class CreateOrganizationDto {
  name!: string;
}

/**
 * Organization Response DTO
 */
export class OrganizationResponseDto {
  id!: string;
  name!: string;
  status!: 'active' | 'suspended';
  createdAt!: Date;
  updatedAt!: Date;
  createdBy!: string;
}
