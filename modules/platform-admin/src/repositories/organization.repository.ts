import { Injectable } from '@nestjs/common';
import { PrismaService } from '../db/prisma.service';
import { Organization, Prisma } from '@prisma/client';
import { enforcePolicy } from './repository.guard';

@Injectable()
export class OrganizationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.OrganizationCreateInput): Promise<Organization> {
    return this.prisma.organization.create({ data });
  }

  async findAll(): Promise<Organization[]> {
    enforcePolicy('organization', 'read:list');
    return this.prisma.organization.findMany();
  }

  async findById(id: string): Promise<Organization | null> {
    enforcePolicy('organization', 'read:byId');
    return this.prisma.organization.findUnique({ where: { id } });
  }

  async suspend(id: string): Promise<Organization> {
    return this.prisma.organization.update({
      where: { id },
      data: { status: 'suspended', suspendedAt: new Date() },
    });
  }

  async unsuspend(id: string): Promise<Organization> {
    return this.prisma.organization.update({
      where: { id },
      data: { status: 'active', suspendedAt: null },
    });
  }
}
