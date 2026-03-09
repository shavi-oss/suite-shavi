import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InternalUserRepository } from './internal-user.repository';
import { AuditService } from '../audit/audit.service';
import { UserStatus, EntityType, ActionType, ResultType, InviteStatus } from '@prisma/client';
import { CreateInternalUserDto, InternalUserResponseDto } from './dto/create-internal-user.dto';
import { scrypt, timingSafeEqual, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

/**
 * Internal User Service
 * 
 * Gate 7: Audit logging
 * Gate 9: Role change with RBAC enforcement
 * Gate 10: Invite + set-password credential lifecycle
 */

const INVITE_TTL_MS = 72 * 60 * 60 * 1000; // 72 hours

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
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new BadRequestException('Email already exists');
    }

    try {
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
   */
  async changeRole(
    id: string,
    newRole: string,
    actorRole: string,
    userId: string,
    correlationId: string,
  ): Promise<InternalUserResponseDto> {
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

  /**
   * generateInvite — Gate 10
   * Generate a cryptographically strong one-time invite token.
   * Raw token returned to caller for copy-link flow.
   * Only hashed token stored in DB.
   */
  async generateInvite(
    id: string,
    actorId: string,
    correlationId: string,
    baseUrl: string,
  ): Promise<{ inviteUrl: string; expiresAt: Date }> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`Internal user ${id} not found`);
    }
    if (user.status === UserStatus.deactivated) {
      throw new BadRequestException('Cannot generate invite for deactivated user');
    }

    // 32 random bytes → 64-hex raw token — NEVER stored
    const rawToken = randomBytes(32).toString('hex');

    // Hash token before DB storage (scrypt with fresh salt)
    const salt = randomBytes(16);
    const hash = (await scryptAsync(rawToken, salt, 64)) as Buffer;
    const inviteTokenHash = `${salt.toString('hex')}:${hash.toString('hex')}`;

    const expiresAt = new Date(Date.now() + INVITE_TTL_MS);

    // Atomic: store hash + audit log
    await this.userRepository['prisma'].$transaction(async (tx: any) => {
      await tx.internalUser.update({
        where: { id },
        data: {
          inviteTokenHash,
          inviteExpiresAt: expiresAt,
          inviteStatus: InviteStatus.invited,
        },
      });
      await this.auditService.logAction({
        correlationId,
        entityType: EntityType.internal_user,
        entityId: id,
        action: ActionType.invite,
        performedBy: actorId,
        result: ResultType.success,
      }, tx);
    });

    // Build invite URL: token + uid (email resolved server-side on redeem)
    const inviteUrl = `${baseUrl}/set-password?token=${rawToken}&uid=${id}`;
    return { inviteUrl, expiresAt };
  }

  /**
   * redeemInvite — Gate 10
   * Invited user sets their password via one-time token.
   * Fail-closed: expired/invalid/reused/deactivated all return generic 400.
   */
  async redeemInvite(
    uid: string,
    rawToken: string,
    password: string,
    correlationId: string,
  ): Promise<void> {
    const GENERIC_DENY = 'Invalid or expired invite token';

    const user = await this.userRepository.findById(uid);

    if (!user || user.status === UserStatus.deactivated) {
      await this._dummyScrypt();
      throw new BadRequestException(GENERIC_DENY);
    }
    if (!user.inviteTokenHash || !user.inviteExpiresAt) {
      await this._dummyScrypt();
      throw new BadRequestException(GENERIC_DENY);
    }
    // Check expiry first
    if (new Date() > user.inviteExpiresAt) {
      await this.userRepository.expireInvite(uid);
      throw new BadRequestException(GENERIC_DENY);
    }

    // Verify token via timing-safe scrypt compare
    const [saltHex, hashHex] = user.inviteTokenHash.split(':');
    if (!saltHex || !hashHex) {
      throw new BadRequestException(GENERIC_DENY);
    }
    const salt = Buffer.from(saltHex, 'hex');
    const storedHash = Buffer.from(hashHex, 'hex');
    const inputHash = (await scryptAsync(rawToken, salt, 64)) as Buffer;

    if (storedHash.length !== inputHash.length || !timingSafeEqual(storedHash, inputHash)) {
      throw new BadRequestException(GENERIC_DENY);
    }

    // Token valid — hash new password + store atomically
    const pwSalt = randomBytes(16);
    const pwHash = (await scryptAsync(password, pwSalt, 64)) as Buffer;
    const passwordHash = `${pwSalt.toString('hex')}:${pwHash.toString('hex')}`;

    await this.userRepository['prisma'].$transaction(async (tx: any) => {
      await tx.internalUser.update({
        where: { id: uid },
        data: {
          passwordHash,
          inviteTokenHash: null,
          inviteExpiresAt: null,
          inviteStatus: InviteStatus.active,
        },
      });
      await this.auditService.logAction({
        correlationId,
        entityType: EntityType.internal_user,
        entityId: uid,
        action: ActionType.redeem,
        performedBy: uid, // self-service
        result: ResultType.success,
      }, tx);
    });
  }

  private async _dummyScrypt(): Promise<void> {
    const fakeSalt = randomBytes(16);
    const fakeHash = Buffer.alloc(64);
    const inputHash = (await scryptAsync('dummy', fakeSalt, 64)) as Buffer;
    timingSafeEqual(fakeHash, inputHash.length === 64 ? inputHash : fakeHash);
  }

  private mapToResponse(user: any): InternalUserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      inviteStatus: user.inviteStatus ?? 'pending',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      createdBy: user.createdBy,
    };
  }
}
