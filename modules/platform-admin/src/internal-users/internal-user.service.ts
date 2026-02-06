import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InternalUserRepository } from './internal-user.repository';
import { AuditService } from '../audit/audit.service';
import { EntityType, ActionType, ResultType, UserStatus } from '@prisma/client';
import { CreateInternalUserDto, InternalUserResponseDto } from './dto/create-internal-user.dto';

/**
 * Internal User Service
 * 
 * Purpose: Business logic for internal user management
 * Evidence: MODULE_SCOPE_LOCK.md Section 2.2 (Lines 72-77)
 */

@Injectable()
export class InternalUserService {
  constructor(
    private readonly userRepository: InternalUserRepository,
    private readonly auditService: AuditService,
  ) {}

  async create(
    dto: CreateInternalUserDto,
    userId: string,
    correlationId: string,
  ): Promise<InternalUserResponseDto> {
    // Check if email already exists
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new BadRequestException(`Email ${dto.email} already exists`);
    }

    try {
      const user = await this.userRepository.create(
        dto.email,
        dto.name,
        dto.role,
        userId,
      );

      // Audit log (fail-closed)
      await this.auditService.logAction({
        correlationId,
        entityType: EntityType.internal_user,
        entityId: user.id,
        action: ActionType.create,
        performedBy: userId,
        result: ResultType.success,
        metadata: { email: dto.email, name: dto.name, role: dto.role },
      });

      return this.mapToResponse(user);
    } catch (error) {
      // Audit failure
      await this.auditService.logAction({
        correlationId,
        entityType: EntityType.internal_user,
        entityId: 'unknown',
        action: ActionType.create,
        performedBy: userId,
        result: ResultType.failure,
        metadata: { error: (error as Error).message },
      });

      throw error;
    }
  }

  async findAll(): Promise<InternalUserResponseDto[]> {
    const users = await this.userRepository.findAll();
    return users.map(this.mapToResponse);
  }

  async findById(id: string): Promise<InternalUserResponseDto> {
    const user = await this.userRepository.findById(id);
    
    if (!user) {
      throw new NotFoundException(`Internal user ${id} not found`);
    }

    return this.mapToResponse(user);
  }

  async deactivate(
    id: string,
    userId: string,
    correlationId: string,
  ): Promise<InternalUserResponseDto> {
    const user = await this.userRepository.findById(id);
    
    if (!user) {
      throw new NotFoundException(`Internal user ${id} not found`);
    }

    if (user.status === UserStatus.deactivated) {
      throw new BadRequestException(`Internal user ${id} is already deactivated`);
    }

    try {
      const updated = await this.userRepository.updateStatus(id, UserStatus.deactivated);

      // Audit log (fail-closed)
      await this.auditService.logAction({
        correlationId,
        entityType: EntityType.internal_user,
        entityId: id,
        action: ActionType.deactivate,
        performedBy: userId,
        result: ResultType.success,
        metadata: {},
      });

      return this.mapToResponse(updated);
    } catch (error) {
      // Audit failure
      await this.auditService.logAction({
        correlationId,
        entityType: EntityType.internal_user,
        entityId: id,
        action: ActionType.deactivate,
        performedBy: userId,
        result: ResultType.failure,
        metadata: { error: (error as Error).message },
      });

      throw error;
    }
  }

  private mapToResponse(user: any): InternalUserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      createdBy: user.createdBy,
    };
  }
}
