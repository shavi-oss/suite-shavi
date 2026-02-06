import { Test, TestingModule } from '@nestjs/testing';
import { OrgMappingController } from '../../../src/org-mapping/org-mapping.controller';
import { OrgMappingService } from '../../../src/org-mapping/org-mapping.service';

describe('OrgMappingController', () => {
  let controller: OrgMappingController;
  let service: OrgMappingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrgMappingController],
      providers: [
        {
          provide: OrgMappingService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findBySuiteOrgId: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<OrgMappingController>(OrgMappingController);
    service = module.get<OrgMappingService>(OrgMappingService);
  });

  describe('create', () => {
    it('should create org mapping with JWT from Authorization header', async () => {
      const dto = { suiteOrgId: 'suite-1', coreOrgId: 'core-1' };
      const mockMapping = {
        suiteOrgId: 'suite-1',
        coreOrgId: 'core-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'user-1',
      };

      const req = {
        headers: {
          'x-correlation-id': 'corr-1',
          'authorization': 'Bearer jwt-token-123',
        },
        user: { id: 'user-1' },
      };

      jest.spyOn(service, 'create').mockResolvedValue(mockMapping);

      const result = await controller.create(dto, req);

      expect(result).toEqual(mockMapping);
      expect(service.create).toHaveBeenCalledWith(dto, 'user-1', 'jwt-token-123', 'corr-1');
    });

    it('should generate correlation ID if not provided', async () => {
      const dto = { suiteOrgId: 'suite-1', coreOrgId: 'core-1' };
      const mockMapping = {
        suiteOrgId: 'suite-1',
        coreOrgId: 'core-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'user-1',
      };

      const req = {
        headers: {
          'authorization': 'Bearer jwt-token-123',
        },
        user: { id: 'user-1' },
      };

      jest.spyOn(service, 'create').mockResolvedValue(mockMapping);

      const result = await controller.create(dto, req);

      expect(result).toEqual(mockMapping);
      expect(service.create).toHaveBeenCalled();
      const correlationId = (service.create as jest.Mock).mock.calls[0][3];
      expect(correlationId).toBeDefined();
      expect(typeof correlationId).toBe('string');
    });

    it('should throw error if JWT is missing', async () => {
      const dto = { suiteOrgId: 'suite-1', coreOrgId: 'core-1' };
      const req = {
        headers: {},
        user: { id: 'user-1' },
      };

      await expect(controller.create(dto, req)).rejects.toThrow(
        'Core JWT is required for org mapping validation'
      );
    });
  });

  describe('findAll', () => {
    it('should return all org mappings', async () => {
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

      jest.spyOn(service, 'findAll').mockResolvedValue(mockMappings);

      const result = await controller.findAll();

      expect(result).toEqual(mockMappings);
      expect(result).toHaveLength(2);
    });
  });

  describe('findBySuiteOrgId', () => {
    it('should return org mapping by suite org ID', async () => {
      const mockMapping = {
        suiteOrgId: 'suite-1',
        coreOrgId: 'core-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'user-1',
      };

      jest.spyOn(service, 'findBySuiteOrgId').mockResolvedValue(mockMapping);

      const result = await controller.findBySuiteOrgId('suite-1');

      expect(result).toEqual(mockMapping);
      expect(service.findBySuiteOrgId).toHaveBeenCalledWith('suite-1');
    });
  });
});
