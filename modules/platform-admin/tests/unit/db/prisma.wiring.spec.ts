import { Test, TestingModule } from '@nestjs/testing';
import { PlatformAdminModule } from '../../../platform-admin.module';
import { PrismaService } from '../../../src/db/prisma.service';
import { OrganizationRepository } from '../../../src/organizations/organization.repository';

describe('PlatformAdmin — Prisma Wiring', () => {
  let module: TestingModule;
  let prismaService: PrismaService;
  let organizationRepository: OrganizationRepository;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [PlatformAdminModule],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);
    organizationRepository = module.get<OrganizationRepository>(OrganizationRepository);
  });

  afterAll(async () => {
    await module.close();
  });

  it('should provide PrismaService', () => {
    expect(prismaService).toBeDefined();
    expect(prismaService).toBeInstanceOf(PrismaService);
  });

  it('should provide OrganizationRepository', () => {
    expect(organizationRepository).toBeDefined();
    expect(organizationRepository).toBeInstanceOf(OrganizationRepository);
  });

  it('should inject PrismaService into OrganizationRepository', () => {
    expect(organizationRepository['prisma']).toBeDefined();
    expect(organizationRepository['prisma']).toBeInstanceOf(PrismaService);
  });
});
