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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      await this.auditService.logAction({
        correlationId,
        entityType: EntityType.org_mapping,
        entityId: dto.suiteOrgId,
        action: ActionType.link,
        performedBy: userId,
        result: ResultType.failure,
        metadata: { error: 'Core validation failed', coreOrgId: dto.coreOrgId },
      });

      throw new BadRequestException(
        'Failed to validate Core organization: ' + errorMessage,
      );
    }

    // Fail-closed: Core org does not exist
    if (!coreOrgExists) {
      await this.auditService.logAction({
        correlationId,
        entityType: EntityType.org_mapping,
        entityId: dto.suiteOrgId,
        action: ActionType.link,
        performedBy: userId,
        result: ResultType.failure,
        metadata: { error: 'Core org not found', coreOrgId: dto.coreOrgId },
      });

      throw new NotFoundException(
        `Core organization ${dto.coreOrgId} not found`,
      );
    }

    // Create mapping
    try {
      const mapping = await this.mappingRepository.create(
        dto.suiteOrgId,
        dto.coreOrgId,
        userId,
      );

      // Audit success
      await this.auditService.logAction({
        correlationId,
        entityType: EntityType.org_mapping,
        entityId: dto.suiteOrgId,
        action: ActionType.link,
        performedBy: userId,
        result: ResultType.success,
        metadata: { coreOrgId: dto.coreOrgId },
      });

      return this.mapToResponse(mapping);
    } catch (error) {
      // Audit failure
      await this.auditService.logAction({
        correlationId,
        entityType: EntityType.org_mapping,
        entityId: dto.suiteOrgId,
        action: ActionType.link,
        performedBy: userId,
        result: ResultType.failure,
        metadata: { error: (error as Error).message },
      });

      throw error;
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
