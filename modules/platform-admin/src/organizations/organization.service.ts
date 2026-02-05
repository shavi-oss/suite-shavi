import { Injectable, NotFoundException } from '@nestjs/common';
import { OrganizationRepository } from './organization.repository';
import { AuditService } from '../audit/audit.service';
import { EntityType, ActionType, ResultType } from '@prisma/client';
import { CreateOrganizationDto, OrganizationResponseDto } from './dto/organization.dto';

/**
 * Organization Service
 * 
 * Purpose: Business logic for Suite organization management
 * Evidence: MODULE_SCOPE_LOCK.md Section 2.2 (Lines 58-64)
 */

@Injectable()
export class OrganizationService {
  constructor(
    private readonly orgRepository: OrganizationRepository,
    private readonly auditService: AuditService,
  ) {}

  async create(
    dto: CreateOrganizationDto,
    userId: string,
    correlationId: string,
  ): Promise<OrganizationResponseDto> {
    try {
      const org = await this.orgRepository.create(dto.name, userId);

      // Audit log (fail-closed)
      await this.auditService.logAction({
        correlationId,
        entityType: EntityType.organization,
        entityId: org.id,
        action: ActionType.create,
        performedBy: userId,
        result: ResultType.success,
        metadata: { name: dto.name },
      });

      return this.mapToResponse(org);
    } catch (error) {
      // Audit failure
      await this.auditService.logAction({
        correlationId,
        entityType: EntityType.organization,
        entityId: 'unknown',
        action: ActionType.create,
        performedBy: userId,
        result: ResultType.failure,
        metadata: { error: (error as Error).message },
      });

      throw error;
    }
  }

  async findAll(): Promise<OrganizationResponseDto[]> {
    const orgs = await this.orgRepository.findAll();
    return orgs.map(this.mapToResponse);
  }

  async findById(id: string): Promise<OrganizationResponseDto> {
    const org = await this.orgRepository.findById(id);
    
    if (!org) {
      throw new NotFoundException(`Organization ${id} not found`);
    }

    return this.mapToResponse(org);
  }

  async suspend(
    id: string,
    userId: string,
    correlationId: string,
  ): Promise<OrganizationResponseDto> {
    const org = await this.orgRepository.findById(id);
    
    if (!org) {
      throw new NotFoundException(`Organization ${id} not found`);
    }

    try {
      const updated = await this.orgRepository.updateStatus(id, 'suspended' as any);

      await this.auditService.logAction({
        correlationId,
        entityType: EntityType.organization,
        entityId: id,
        action: ActionType.suspend,
        performedBy: userId,
        result: ResultType.success,
      });

      return this.mapToResponse(updated);
    } catch (error) {
      await this.auditService.logAction({
        correlationId,
        entityType: EntityType.organization,
        entityId: id,
        action: ActionType.suspend,
        performedBy: userId,
        result: ResultType.failure,
        metadata: { error: (error as Error).message },
      });

      throw error;
    }
  }

  async unsuspend(
    id: string,
    userId: string,
    correlationId: string,
  ): Promise<OrganizationResponseDto> {
    const org = await this.orgRepository.findById(id);
    
    if (!org) {
      throw new NotFoundException(`Organization ${id} not found`);
    }

    try {
      const updated = await this.orgRepository.updateStatus(id, 'active' as any);

      await this.auditService.logAction({
        correlationId,
        entityType: EntityType.organization,
        entityId: id,
        action: ActionType.unsuspend,
        performedBy: userId,
        result: ResultType.success,
      });

      return this.mapToResponse(updated);
    } catch (error) {
      await this.auditService.logAction({
        correlationId,
        entityType: EntityType.organization,
        entityId: id,
        action: ActionType.unsuspend,
        performedBy: userId,
        result: ResultType.failure,
        metadata: { error: (error as Error).message },
      });

      throw error;
    }
  }

  private mapToResponse(org: any): OrganizationResponseDto {
    return {
      id: org.id,
      name: org.name,
      status: org.status,
      createdAt: org.createdAt,
      updatedAt: org.updatedAt,
      createdBy: org.createdBy,
    };
  }
}
