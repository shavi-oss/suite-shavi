/**
 * Create Org Mapping DTO
 * 
 * Purpose: Link Suite org to Core org
 * Evidence: MODULE_SCOPE_LOCK.md Section 2.2 (Line 68)
 */
export class CreateOrgMappingDto {
  suiteOrgId!: string;
  coreOrgId!: string;
}

/**
 * Org Mapping Response DTO
 */
export class OrgMappingResponseDto {
  suiteOrgId!: string;
  coreOrgId!: string;
  createdAt!: Date;
  updatedAt!: Date;
  createdBy!: string;
}
