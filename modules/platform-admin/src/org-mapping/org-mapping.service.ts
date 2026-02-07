import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { OrgMappingRepository } from './org-mapping.repository';
import { OrganizationRepository } from '../organizations/organization.repository';
import { CoreClient } from '../core-adapter/core.client';
import { AuditService } from '../audit/audit.service';
import { EntityType, ActionType, ResultType } from '@prisma/client';
import {
  CreateOrgMappingDto,
  OrgMappingResponseDto,
} from './dto/org-mapping.dto';

/**
 * Org Mapping Service
 * 
 * Purpose: Link Suite org ↔ Core org with validation
 * Evidence: MODULE_SCOPE_LOCK.md Section 2.2 (Lines 66-70)
 * 
 * MUST: Validate coreOrgId exists in Core before creating mapping
 * MUST: Fail-closed if validation fails
 * Evidence: MODULE_SECURITY_LAWS.md Section 3.3
 * 
 * Gate 7: Audit logging added for WRITE operations
 * Evidence: MODULE_SECURITY_LAWS.md Section 3.4
 */

@Injectable()
export class OrgMappingService {
  constructor(
    private readonly mappingRepository: OrgMappingRepository,
    private readonly orgRepository: OrganizationRepository,
    private readonly coreClient: CoreClient,
    private readonly auditService: AuditService,
  ) {}

  async create(
    dto: CreateOrgMappingDto,
    userId: string,
    coreJwt: string,
    correlationId: string,
  ): Promise<OrgMappingResponseDto> {
    // Validate Suite org exists
    const suiteOrg = await this.orgRepository.findById(dto.suiteOrgId);
    if (!suiteOrg) {
      throw new NotFoundException(
        `Suite organization ${dto.suiteOrgId} not found`,
      );
    }

    // Check for existing mapping (fail-closed on duplicate)
    const existingBySuite = await this.mappingRepository.findBySuiteOrgId(
      dto.suiteOrgId,
    );
    if (existingBySuite) {
      throw new ConflictException(
        `Mapping already exists for Suite org ${dto.suiteOrgId}`,
      );
    }

    const existingByCore = await this.mappingRepository.findByCoreOrgId(
      dto.coreOrgId,
    );
    if (existingByCore) {
      throw new ConflictException(
        `Mapping already exists for Core org ${dto.coreOrgId}`,
      );
    }

    // Validate Core org exists (REQUIRED)
    // Evidence: MODULE_INTEGRATION_PLAN.md Section 3.1 (Lines 70-77)
    let coreOrgExists: boolean;
    try {
      coreOrgExists = await this.coreClient.validateOrganizationExists(
        dto.coreOrgId,
        coreJwt,
        correlationId,
      );
    } catch (error) {
      // Core API error (5xx or network) - fail-closed
      throw new BadRequestException('Failed to validate Core organization');
    }

    // Fail-closed: Core org does not exist
    if (!coreOrgExists) {
      throw new NotFoundException(
        `Core organization ${dto.coreOrgId} not found`,
      );
    }

    // Create mapping
    try {
      // Use transaction for atomic audit + DB write
      const mapping = await this.mappingRepository['prisma'].$transaction(async (tx: any) => {
        const newMapping = await tx.suiteOrgMapping.create({
          data: {
            suiteOrgId: dto.suiteOrgId,
            coreOrgId: dto.coreOrgId,
            createdBy: userId,
          },
        });

        // Audit log (fail-closed) - NO PII in metadata
        await this.auditService.logAction({
          correlationId,
          entityType: EntityType.org_mapping,
          entityId: newMapping.suiteOrgId,
          action: ActionType.link,
          performedBy: userId,
          result: ResultType.success,
        }, tx);

        return newMapping;
      });

      return this.mapToResponse(mapping);
    } catch (error) {
      // Audit failure - safe error code only
      throw new Error('ORG_MAPPING_CREATE_FAILED');
    }
  }

  async findAll(): Promise<OrgMappingResponseDto[]> {
    const mappings = await this.mappingRepository.findAll();
    return mappings.map(this.mapToResponse);
  }

  async findBySuiteOrgId(suiteOrgId: string): Promise<OrgMappingResponseDto> {
    const mapping = await this.mappingRepository.findBySuiteOrgId(suiteOrgId);

    if (!mapping) {
      throw new NotFoundException(
        `Mapping not found for Suite org ${suiteOrgId}`,
      );
    }

    return this.mapToResponse(mapping);
  }

  private mapToResponse(mapping: any): OrgMappingResponseDto {
    return {
      suiteOrgId: mapping.suiteOrgId,
      coreOrgId: mapping.coreOrgId,
      createdAt: mapping.createdAt,
      updatedAt: mapping.updatedAt,
      createdBy: mapping.createdBy,
    };
  }
}
