import { Injectable } from '@nestjs/common';
import { PrismaService } from '../db/prisma.service';
import { OrgStatus } from '@prisma/client';

/**
 * Organization Repository
 * 
 * Purpose: Data access for Suite organizations
 */

@Injectable()
export class OrganizationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(name: string, createdBy: string) {
    return this.prisma.suiteOrganization.create({
      data: { name, createdBy, status: OrgStatus.active },
    });
  }

  async findAll() {
    return this.prisma.suiteOrganization.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return this.prisma.suiteOrganization.findUnique({
      where: { id },
    });
  }

  async updateStatus(id: string, status: OrgStatus) {
    return this.prisma.suiteOrganization.update({
      where: { id },
      data: { status },
    });
  }

  async delete(id: string) {
    return this.prisma.suiteOrganization.delete({
      where: { id },
    });
  }
}
