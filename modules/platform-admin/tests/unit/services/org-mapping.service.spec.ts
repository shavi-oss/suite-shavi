import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { OrgMappingService } from '../../../src/org-mapping/org-mapping.service';
import { OrgMappingRepository } from '../../../src/org-mapping/org-mapping.repository';
import { OrganizationRepository } from '../../../src/organizations/organization.repository';
import { CoreClient } from '../../../src/core-adapter/core.client';

describe('OrgMappingService', () => {
  let service: OrgMappingService;
  let mappingRepository: OrgMappingRepository;
  let orgRepository: OrganizationRepository;
  let coreClient: CoreClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrgMappingService,
        {
          provide: OrgMappingRepository,
          useValue: {
            create: jest.fn(),
            findBySuiteOrgId: jest.fn(),
            findByCoreOrgId: jest.fn(),
            findAll: jest.fn(),
          },
        },
        {
          provide: OrganizationRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: CoreClient,
          useValue: {
            validateOrganizationExists: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OrgMappingService>(OrgMappingService);
    mappingRepository = module.get<OrgMappingRepository>(OrgMappingRepository);
    orgRepository = module.get<OrganizationRepository>(OrganizationRepository);
    coreClient = module.get<CoreClient>(CoreClient);
  });

  describe('create', () => {
    it('should create mapping when all validations pass', async () => {
      const dto = { suiteOrgId: 'suite-1', coreOrgId: 'core-1' };
      const mockSuiteOrg = { id: 'suite-1', name: 'Suite Org' };
      const mockMapping = {
        suiteOrgId: 'suite-1',
        coreOrgId: 'core-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'user-1',
      };

      jest.spyOn(orgRepository, 'findById').mockResolvedValue(mockSuiteOrg as any);
      jest.spyOn(mappingRepository, 'findBySuiteOrgId').mockResolvedValue(null);
      jest.spyOn(mappingRepository, 'findByCoreOrgId').mockResolvedValue(null);
      jest.spyOn(coreClient, 'validateOrganizationExists').mockResolvedValue(true);
      jest.spyOn(mappingRepository, 'create').mockResolvedValue(mockMapping as any);

      const result = await service.create(dto, 'user-1', 'jwt-token', 'corr-1');

      expect(result).toEqual(mockMapping);
      expect(orgRepository.findById).toHaveBeenCalledWith('suite-1');
      expect(coreClient.validateOrganizationExists).toHaveBeenCalledWith('core-1', 'jwt-token', 'corr-1');
      expect(mappingRepository.create).toHaveBeenCalledWith('suite-1', 'core-1', 'user-1');
    });

    it('should throw NotFoundException if suite org not found', async () => {
      const dto = { suiteOrgId: 'suite-1', coreOrgId: 'core-1' };

      jest.spyOn(orgRepository, 'findById').mockResolvedValue(null);

      await expect(service.create(dto, 'user-1', 'jwt-token', 'corr-1')).rejects.toThrow(
        NotFoundException
      );
      await expect(service.create(dto, 'user-1', 'jwt-token', 'corr-1')).rejects.toThrow(
        'Suite organization suite-1 not found'
      );
    });

    it('should throw ConflictException if mapping exists for suite org', async () => {
      const dto = { suiteOrgId: 'suite-1', coreOrgId: 'core-1' };
      const mockSuiteOrg = { id: 'suite-1', name: 'Suite Org' };
      const existingMapping = { suiteOrgId: 'suite-1', coreOrgId: 'core-2' };

      jest.spyOn(orgRepository, 'findById').mockResolvedValue(mockSuiteOrg as any);
      jest.spyOn(mappingRepository, 'findBySuiteOrgId').mockResolvedValue(existingMapping as any);

      await expect(service.create(dto, 'user-1', 'jwt-token', 'corr-1')).rejects.toThrow(
        ConflictException
      );
      await expect(service.create(dto, 'user-1', 'jwt-token', 'corr-1')).rejects.toThrow(
        'Mapping already exists for Suite org suite-1'
      );
    });

    it('should throw ConflictException if mapping exists for core org', async () => {
      const dto = { suiteOrgId: 'suite-1', coreOrgId: 'core-1' };
      const mockSuiteOrg = { id: 'suite-1', name: 'Suite Org' };
      const existingMapping = { suiteOrgId: 'suite-2', coreOrgId: 'core-1' };

      jest.spyOn(orgRepository, 'findById').mockResolvedValue(mockSuiteOrg as any);
      jest.spyOn(mappingRepository, 'findBySuiteOrgId').mockResolvedValue(null);
      jest.spyOn(mappingRepository, 'findByCoreOrgId').mockResolvedValue(existingMapping as any);

      await expect(service.create(dto, 'user-1', 'jwt-token', 'corr-1')).rejects.toThrow(
        ConflictException
      );
      await expect(service.create(dto, 'user-1', 'jwt-token', 'corr-1')).rejects.toThrow(
        'Mapping already exists for Core org core-1'
      );
    });

    it('should throw BadRequestException if Core API fails', async () => {
      const dto = { suiteOrgId: 'suite-1', coreOrgId: 'core-1' };
      const mockSuiteOrg = { id: 'suite-1', name: 'Suite Org' };

      jest.spyOn(orgRepository, 'findById').mockResolvedValue(mockSuiteOrg as any);
      jest.spyOn(mappingRepository, 'findBySuiteOrgId').mockResolvedValue(null);
      jest.spyOn(mappingRepository, 'findByCoreOrgId').mockResolvedValue(null);
      jest.spyOn(coreClient, 'validateOrganizationExists').mockRejectedValue(
        new Error('Core API error: 500')
      );

      await expect(service.create(dto, 'user-1', 'jwt-token', 'corr-1')).rejects.toThrow(
        BadRequestException
      );
      await expect(service.create(dto, 'user-1', 'jwt-token', 'corr-1')).rejects.toThrow(
        'Failed to validate Core organization: Core API error: 500'
      );
    });

    it('should throw NotFoundException if Core org not found (404)', async () => {
      const dto = { suiteOrgId: 'suite-1', coreOrgId: 'core-1' };
      const mockSuiteOrg = { id: 'suite-1', name: 'Suite Org' };

      jest.spyOn(orgRepository, 'findById').mockResolvedValue(mockSuiteOrg as any);
      jest.spyOn(mappingRepository, 'findBySuiteOrgId').mockResolvedValue(null);
      jest.spyOn(mappingRepository, 'findByCoreOrgId').mockResolvedValue(null);
      jest.spyOn(coreClient, 'validateOrganizationExists').mockResolvedValue(false);

      await expect(service.create(dto, 'user-1', 'jwt-token', 'corr-1')).rejects.toThrow(
        NotFoundException
      );
      await expect(service.create(dto, 'user-1', 'jwt-token', 'corr-1')).rejects.toThrow(
        'Core organization core-1 not found'
      );
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

      jest.spyOn(mappingRepository, 'findAll').mockResolvedValue(mockMappings as any);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result[0].suiteOrgId).toBe('suite-1');
      expect(result[1].suiteOrgId).toBe('suite-2');
    });
  });

  describe('findBySuiteOrgId', () => {
    it('should return mapping by suite org ID', async () => {
      const mockMapping = {
        suiteOrgId: 'suite-1',
        coreOrgId: 'core-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'user-1',
      };

      jest.spyOn(mappingRepository, 'findBySuiteOrgId').mockResolvedValue(mockMapping as any);

      const result = await service.findBySuiteOrgId('suite-1');

      expect(result).toEqual(mockMapping);
      expect(mappingRepository.findBySuiteOrgId).toHaveBeenCalledWith('suite-1');
    });

    it('should throw NotFoundException if mapping not found', async () => {
      jest.spyOn(mappingRepository, 'findBySuiteOrgId').mockResolvedValue(null);

      await expect(service.findBySuiteOrgId('suite-1')).rejects.toThrow(NotFoundException);
      await expect(service.findBySuiteOrgId('suite-1')).rejects.toThrow(
        'Mapping not found for Suite org suite-1'
      );
    });
  });
});
