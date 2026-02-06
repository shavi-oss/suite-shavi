import { Test, TestingModule } from '@nestjs/testing';
import { PlatformAdminModule } from '../../../platform-admin.module';
import { PrismaService } from '../../../src/db/prisma.service';
import { OrganizationRepository } from '../../../src/organizations/organization.repository';

describe('PlatformAdmin — Prisma Wiring', () => {
  let module: TestingModule;
  let prismaService: any;
  let organizationRepository: any;
  let PrismaService: any;

  beforeAll(async () => {
    // Mock PrismaClient methods to avoid database connection
    const mockConnect = jest.fn().mockResolvedValue(undefined);
    const mockDisconnect = jest.fn().mockResolvedValue(undefined);
    
    jest.spyOn(require('@prisma/client').PrismaClient.prototype, '$connect').mockImplementation(mockConnect);
    jest.spyOn(require('@prisma/client').PrismaClient.prototype, '$disconnect').mockImplementation(mockDisconnect);

    const { Test } = require('@nestjs/testing');
    const { PlatformAdminModule } = require('../../../platform-admin.module');
    PrismaService = require('../../../src/db/prisma.service').PrismaService;
    const { OrganizationRepository } = require('../../../src/organizations/organization.repository');

    module = await Test.createTestingModule({
      imports: [PlatformAdminModule],
    }).compile();

    prismaService = module.get(PrismaService);
    organizationRepository = module.get(OrganizationRepository);
  });

  afterAll(async () => {
    await module.close();
  });

  it('should provide PrismaService', () => {
    expect(prismaService).toBeDefined();
    expect(prismaService.constructor.name).toBe('PrismaService');
  });

  it('should provide OrganizationRepository', () => {
    expect(organizationRepository).toBeDefined();
    expect(organizationRepository).toBeInstanceOf(OrganizationRepository);
  });

  it('should inject PrismaService into OrganizationRepository', () => {
    expect(organizationRepository['prisma']).toBeDefined();
    expect(organizationRepository['prisma'].constructor.name).toBe('PrismaService');
  });
});
