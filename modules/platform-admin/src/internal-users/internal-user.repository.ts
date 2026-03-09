import { Injectable } from '@nestjs/common';
import { PrismaService } from '../db/prisma.service';
import { UserStatus } from '@prisma/client';

/**
 * Internal User Repository
 * 
 * Purpose: Data access for internal users
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
}
