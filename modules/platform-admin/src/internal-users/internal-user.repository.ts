import { Injectable } from '@nestjs/common';
import { PrismaService } from '../db/prisma.service';
import { UserStatus, InviteStatus } from '@prisma/client';

/**
 * Internal User Repository
 * 
 * Purpose: Data access for internal users
 * Gate 10: Added invite lifecycle methods
 */

@Injectable()
export class InternalUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(email: string, name: string, role: any, createdBy: string) {
    return this.prisma.internalUser.create({
      data: { email, name, role, createdBy, status: UserStatus.active },
    });
  }

  async findAll() {
    return this.prisma.internalUser.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return this.prisma.internalUser.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.internalUser.findUnique({
      where: { email },
    });
  }

  async updateStatus(id: string, status: UserStatus) {
    return this.prisma.internalUser.update({
      where: { id },
      data: { status },
    });
  }

  async updateRole(id: string, role: any) {
    return this.prisma.internalUser.update({
      where: { id },
      data: { role },
    });
  }

  // Gate 10 — Invite lifecycle methods

  /** Store hashed invite token + expiry, set inviteStatus = invited */
  async storeInviteToken(id: string, inviteTokenHash: string, inviteExpiresAt: Date) {
    return this.prisma.internalUser.update({
      where: { id },
      data: { inviteTokenHash, inviteExpiresAt, inviteStatus: InviteStatus.invited },
    });
  }

  /** Clear invite token after successful redemption, set inviteStatus = active, store passwordHash */
  async redeemInvite(id: string, passwordHash: string) {
    return this.prisma.internalUser.update({
      where: { id },
      data: {
        passwordHash,
        inviteTokenHash: null,
        inviteExpiresAt: null,
        inviteStatus: InviteStatus.active,
      },
    });
  }

  /** Mark invitation expired (for cleanup/admin display) */
  async expireInvite(id: string) {
    return this.prisma.internalUser.update({
      where: { id },
      data: { inviteStatus: InviteStatus.expired, inviteTokenHash: null, inviteExpiresAt: null },
    });
  }
}
