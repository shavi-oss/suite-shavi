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
      // Use transaction for atomic audit + DB write
      const org = await this.orgRepository['prisma'].$transaction(async (tx: any) => {
        const newOrg = await tx.suiteOrganization.create({
          data: { name: dto.name, createdBy: userId, status: 'active' },
        });

        // Audit log (fail-closed) - NO PII in metadata
        await this.auditService.logAction({
          correlationId,
          entityType: EntityType.organization,
          entityId: newOrg.id,
          action: ActionType.create,
          performedBy: userId,
          result: ResultType.success,
        }, tx);

        return newOrg;
      });

      return this.mapToResponse(org);
    } catch (error) {
      throw new Error('ORGANIZATION_CREATE_FAILED');
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
      const updated = await this.orgRepository['prisma'].$transaction(async (tx: any) => {
        const updatedOrg = await tx.suiteOrganization.update({
          where: { id },
          data: { status: 'suspended' },
        });

        await this.auditService.logAction({
          correlationId,
          entityType: EntityType.organization,
          entityId: id,
          action: ActionType.suspend,
          performedBy: userId,
          result: ResultType.success,
        }, tx);

        return updatedOrg;
      });

      return this.mapToResponse(updated);
    } catch (error) {
      throw new Error('ORGANIZATION_SUSPEND_FAILED');
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
      const updated = await this.orgRepository['prisma'].$transaction(async (tx: any) => {
        const updatedOrg = await tx.suiteOrganization.update({
          where: { id },
          data: { status: 'active' },
        });

        await this.auditService.logAction({
          correlationId,
          entityType: EntityType.organization,
          entityId: id,
          action: ActionType.unsuspend,
          performedBy: userId,
          result: ResultType.success,
        }, tx);

        return updatedOrg;
      });

      return this.mapToResponse(updated);
    } catch (error) {
      throw new Error('ORGANIZATION_UNSUSPEND_FAILED');
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
