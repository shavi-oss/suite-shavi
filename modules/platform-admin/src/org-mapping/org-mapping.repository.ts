import { Injectable } from '@nestjs/common';
import { PrismaService } from '../db/prisma.service';

@Injectable()
export class OrgMappingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    suiteOrgId: string,
    coreOrgId: string,
    createdBy: string,
  ) {
    return this.prisma.suiteOrgMapping.create({
      data: {
        suiteOrgId,
        coreOrgId,
        createdBy,
      },
    });
  }

  async findBySuiteOrgId(suiteOrgId: string) {
    return this.prisma.suiteOrgMapping.findUnique({
      where: { suiteOrgId },
    });
  }

  async findByCoreOrgId(coreOrgId: string) {
    return this.prisma.suiteOrgMapping.findUnique({
      where: { coreOrgId },
    });
  }

  async findAll() {
    return this.prisma.suiteOrgMapping.findMany();
  }

  async delete(suiteOrgId: string) {
    return this.prisma.suiteOrgMapping.delete({
      where: { suiteOrgId },
    });
  }
}
