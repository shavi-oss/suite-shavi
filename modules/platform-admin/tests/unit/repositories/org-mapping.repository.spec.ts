import { Test, TestingModule } from '@nestjs/testing';
import { OrgMappingRepository } from '../../../src/org-mapping/org-mapping.repository';
import { PrismaService } from '../../../src/db/prisma.service';

describe('OrgMappingRepository', () => {
  let repository: OrgMappingRepository;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrgMappingRepository,
        {
          provide: PrismaService,
          useValue: {
            suiteOrgMapping: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    repository = module.get<OrgMappingRepository>(OrgMappingRepository);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('should create org mapping', async () => {
      const mockMapping = {
        suiteOrgId: 'suite-1',
        coreOrgId: 'core-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'user-1',
      };

      jest.spyOn(prisma.suiteOrgMapping, 'create').mockResolvedValue(mockMapping as any);

      const result = await repository.create('suite-1', 'core-1', 'user-1');

      expect(result).toEqual(mockMapping);
      expect(prisma.suiteOrgMapping.create).toHaveBeenCalledWith({
        data: {
          suiteOrgId: 'suite-1',
          coreOrgId: 'core-1',
          createdBy: 'user-1',
        },
      });
    });
  });

  describe('findBySuiteOrgId', () => {
    it('should find mapping by suite org ID', async () => {
      const mockMapping = {
        suiteOrgId: 'suite-1',
        coreOrgId: 'core-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'user-1',
      };

      jest.spyOn(prisma.suiteOrgMapping, 'findUnique').mockResolvedValue(mockMapping as any);

      const result = await repository.findBySuiteOrgId('suite-1');

      expect(result).toEqual(mockMapping);
      expect(prisma.suiteOrgMapping.findUnique).toHaveBeenCalledWith({
        where: { suiteOrgId: 'suite-1' },
      });
    });

    it('should return null if mapping not found', async () => {
      jest.spyOn(prisma.suiteOrgMapping, 'findUnique').mockResolvedValue(null);

      const result = await repository.findBySuiteOrgId('suite-1');

      expect(result).toBeNull();
    });
  });

  describe('findByCoreOrgId', () => {
    it('should find mapping by core org ID', async () => {
      const mockMapping = {
        suiteOrgId: 'suite-1',
        coreOrgId: 'core-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'user-1',
      };

      jest.spyOn(prisma.suiteOrgMapping, 'findUnique').mockResolvedValue(mockMapping as any);

      const result = await repository.findByCoreOrgId('core-1');

      expect(result).toEqual(mockMapping);
      expect(prisma.suiteOrgMapping.findUnique).toHaveBeenCalledWith({
        where: { coreOrgId: 'core-1' },
      });
    });

    it('should return null if mapping not found', async () => {
      jest.spyOn(prisma.suiteOrgMapping, 'findUnique').mockResolvedValue(null);

      const result = await repository.findByCoreOrgId('core-1');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all mappings', async () => {
      const mockMappings = [
        {
          suiteOrgId: 'suite-1',
          coreOrgId: 'core-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'user-1',
        },
        {
          suiteOrgId: 'suite-2',
          coreOrgId: 'core-2',
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'user-1',
        },
      ];

      jest.spyOn(prisma.suiteOrgMapping, 'findMany').mockResolvedValue(mockMappings as any);

      const result = await repository.findAll();

      expect(result).toHaveLength(2);
      expect(result).toEqual(mockMappings);
    });
  });

  describe('delete', () => {
    it('should delete mapping', async () => {
      const mockMapping = {
        suiteOrgId: 'suite-1',
        coreOrgId: 'core-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'user-1',
      };

      jest.spyOn(prisma.suiteOrgMapping, 'delete').mockResolvedValue(mockMapping as any);

      const result = await repository.delete('suite-1');

      expect(result).toEqual(mockMapping);
      expect(prisma.suiteOrgMapping.delete).toHaveBeenCalledWith({
        where: { suiteOrgId: 'suite-1' },
      });
    });
  });
});
