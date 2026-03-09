import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InternalUserRepository } from './internal-user.repository';
import { AuditService } from '../audit/audit.service';
import { UserStatus, EntityType, ActionType, ResultType } from '@prisma/client';
import { CreateInternalUserDto, InternalUserResponseDto } from './dto/create-internal-user.dto';

/**
 * Internal User Service
 * 
 * Purpose: Business logic for internal user management
 * Evidence: MODULE_SCOPE_LOCK.md Section 2.2 (Lines 72-77)
 * 
 * Gate 7: Audit logging added for WRITE operations
 * Evidence: MODULE_SECURITY_LAWS.md Section 3.4
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
      throw new BadRequestException('Email already exists');
    }

    try {
      // Use transaction for atomic audit + DB write
      const user = await this.userRepository['prisma'].$transaction(async (tx: any) => {
        const newUser = await tx.internalUser.create({
          data: {
            email: dto.email,
            name: dto.name,
            role: dto.role,
            createdBy: userId,
            status: UserStatus.active,
          },
        });

        // Audit log (fail-closed) - NO PII in metadata
        await this.auditService.logAction({
          correlationId,
          entityType: EntityType.internal_user,
          entityId: newUser.id,
          action: ActionType.create,
          performedBy: userId,
          result: ResultType.success,
        }, tx);

        return newUser;
      });

      return this.mapToResponse(user);
    } catch (error) {
      // Audit failure - safe error code only
      throw new Error('INTERNAL_USER_CREATE_FAILED');
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
      // Use transaction for atomic audit + DB write
      const updated = await this.userRepository['prisma'].$transaction(async (tx: any) => {
        const updatedUser = await tx.internalUser.update({
          where: { id },
          data: { status: UserStatus.deactivated },
        });

        await this.auditService.logAction({
          correlationId,
          entityType: EntityType.internal_user,
          entityId: id,
          action: ActionType.deactivate,
          performedBy: userId,
          result: ResultType.success,
        }, tx);

        return updatedUser;
      });

      return this.mapToResponse(updated);
    } catch (error) {
      throw new Error('INTERNAL_USER_DEACTIVATE_FAILED');
    }
  }

  /**
   * changeRole — Gate 9
   * RBAC: only platform_admin may assign platform_admin role
   * Fail-closed: ForbiddenException if developer_ops tries to assign platform_admin
   */
  async changeRole(
    id: string,
    newRole: string,
    actorRole: string,
    userId: string,
    correlationId: string,
  ): Promise<InternalUserResponseDto> {
    // Fail-closed: only platform_admin can assign platform_admin role
    if (newRole === 'platform_admin' && actorRole !== 'platform_admin') {
      throw new ForbiddenException('Only platform_admin may assign platform_admin role');
    }

    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`Internal user ${id} not found`);
    }

    try {
      const updated = await this.userRepository['prisma'].$transaction(async (tx: any) => {
        const updatedUser = await tx.internalUser.update({
          where: { id },
          data: { role: newRole },
        });

        await this.auditService.logAction({
          correlationId,
          entityType: EntityType.internal_user,
          entityId: id,
          action: ActionType.update,
          performedBy: userId,
          result: ResultType.success,
        }, tx);

        return updatedUser;
      });

      return this.mapToResponse(updated);
    } catch (error) {
      throw new Error('INTERNAL_USER_ROLE_CHANGE_FAILED');
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
