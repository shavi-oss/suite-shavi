/**
 * Fail-Closed Security Tests — platform-admin
 *
 * GATE 4.8 — SECURITY TESTS
 * Tests for deny-by-default enforcement.
 * 
 * GATE 4.9 — SECURITY TESTS (UPDATED)
 * Tests for health endpoint opt-in and guard usage verification.
 * 
 * GATE 3 — ORG MAPPING FAIL-CLOSED TESTS
 * Tests for org-mapping fail-closed scenarios.
 */

import { Test } from '@nestjs/testing';
import { DenyAllGuard } from '../../guards/deny-all.guard';
import { ExplicitAllowGuard } from '../../guards/explicit-allow.guard';
import { PlatformAdminModule } from '../../platform-admin.module';
import { HealthController } from '../../controllers/health.controller';
import { APP_GUARD } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OrgMappingService } from '../../src/org-mapping/org-mapping.service';
import { OrgMappingRepository } from '../../src/org-mapping/org-mapping.repository';
import { OrganizationRepository } from '../../src/organizations/organization.repository';
import { CoreClient } from '../../src/core-adapter/core.client';
import { AuditService } from '../../src/audit/audit.service';

describe('Fail-Closed Security', () => {
  describe('deny-by-default enforcement', () => {
    it('should deny all requests by default', () => {
      const guard = new DenyAllGuard(new Reflector());
      const mockContext = {
        getHandler: () => jest.fn(),
        getClass: () => jest.fn(),
      } as unknown as ExecutionContext;
      const result = guard.canActivate(mockContext);
      expect(result).toBe(false);
    });

    it('should not allow bypass', () => {
      const guard = new DenyAllGuard(new Reflector());
      const mockContext = {
        getHandler: () => jest.fn(),
        getClass: () => jest.fn(),
        switchToHttp: () => ({
          getRequest: () => ({ headers: { authorization: 'Bearer fake-token' } }),
        }),
      } as unknown as ExecutionContext;
      const result = guard.canActivate(mockContext);
      expect(result).toBe(false);
    });
  });

  describe('Gate 4.9 — health endpoint opt-in', () => {
    const originalEnv = process.env;

    beforeAll(() => {
      // Set required environment variable for CoreClient
      process.env = { ...originalEnv, CORE_API_BASE_URL: 'http://core-api.test' };
    });

    afterAll(() => {
      process.env = originalEnv;
    });

    it('should preserve APP_GUARD as DenyAllGuard', () => {
      // Verify APP_GUARD provider exists in module metadata
      const providers = Reflect.getMetadata('providers', PlatformAdminModule) || [];
      const appGuardProvider = providers.find((p: any) => 
        p && typeof p === 'object' && p.provide === APP_GUARD
      );
      
      expect(appGuardProvider).toBeDefined();
      expect(appGuardProvider.useClass).toBe(DenyAllGuard);
    });

    it('should include HealthController among registered controllers', async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [PlatformAdminModule],
      }).compile();

      const healthController = moduleRef.get(HealthController);
      expect(healthController).toBeDefined();
    });

    it('should use ExplicitAllowGuard on exactly one route', () => {
      const controller = new HealthController();
      const metadata = Reflect.getMetadata('__guards__', controller.getHealth);
      
      // Verify guard is applied
      expect(metadata).toBeDefined();
      expect(metadata).toContain(ExplicitAllowGuard);
    });

    it('should use ExplicitAllowGuard EXACTLY once across all controllers (Gate 4.10)', () => {
      // Scan all controllers for ExplicitAllowGuard usage
      const controllers = Reflect.getMetadata('controllers', PlatformAdminModule) || [];
      let guardUsageCount = 0;

      controllers.forEach((ControllerClass: any) => {
        const instance = new ControllerClass();
        const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(instance))
          .filter(name => name !== 'constructor');
        
        methods.forEach(method => {
          const guards = Reflect.getMetadata('__guards__', instance[method]) || [];
          if (guards.includes(ExplicitAllowGuard)) {
            guardUsageCount++;
          }
        });
      });

      expect(guardUsageCount).toBe(1); // EXACTLY one ExplicitAllowGuard class usage (HealthController); @ExplicitAllow() decorator is now class-level metadata read by DenyAllGuard
    });
  });

  describe('Gate 3 — Org Mapping Fail-Closed', () => {
    let service: OrgMappingService;
    let mappingRepository: OrgMappingRepository;
    let orgRepository: OrganizationRepository;
    let coreClient: CoreClient;
    const originalEnv = process.env;

    beforeEach(async () => {
      // Set required environment variable for CoreClient
      process.env = { ...originalEnv, CORE_API_BASE_URL: 'http://core-api.test' };

      const module = await Test.createTestingModule({
        providers: [
          OrgMappingService,
          {
            provide: OrgMappingRepository,
            useValue: {
              findBySuiteOrgId: jest.fn(),
              findByCoreOrgId: jest.fn(),
              create: jest.fn(),
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
          {
            provide: AuditService,
            useValue: {
              logAction: jest.fn().mockResolvedValue(undefined),
            },
          },
        ],
      }).compile();

      service = module.get<OrgMappingService>(OrgMappingService);
      mappingRepository = module.get<OrgMappingRepository>(OrgMappingRepository);
      orgRepository = module.get<OrganizationRepository>(OrganizationRepository);
      coreClient = module.get<CoreClient>(CoreClient);
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('DENY: Core returns 404 → do NOT create mapping', async () => {
      const dto = { suiteOrgId: 'suite-1', coreOrgId: 'core-1' };
      
      jest.spyOn(orgRepository, 'findById').mockResolvedValue({ id: 'suite-1' } as any);
      jest.spyOn(mappingRepository, 'findBySuiteOrgId').mockResolvedValue(null);
      jest.spyOn(mappingRepository, 'findByCoreOrgId').mockResolvedValue(null);
      jest.spyOn(coreClient, 'validateOrganizationExists').mockResolvedValue(false);

      await expect(service.create(dto, 'user-1', 'jwt', 'corr-1')).rejects.toThrow();
      expect(mappingRepository.create).not.toHaveBeenCalled();
    });

    it('DENY: Core returns 401/403 → do NOT create mapping', async () => {
      const dto = { suiteOrgId: 'suite-1', coreOrgId: 'core-1' };
      
      jest.spyOn(orgRepository, 'findById').mockResolvedValue({ id: 'suite-1' } as any);
      jest.spyOn(mappingRepository, 'findBySuiteOrgId').mockResolvedValue(null);
      jest.spyOn(mappingRepository, 'findByCoreOrgId').mockResolvedValue(null);
      jest.spyOn(coreClient, 'validateOrganizationExists').mockRejectedValue(
        new Error('Core authentication failed')
      );

      await expect(service.create(dto, 'user-1', 'jwt', 'corr-1')).rejects.toThrow();
      expect(mappingRepository.create).not.toHaveBeenCalled();
    });

    it('DENY: Missing mapping → do NOT create', async () => {
      const dto = { suiteOrgId: 'suite-1', coreOrgId: 'core-1' };
      
      jest.spyOn(orgRepository, 'findById').mockResolvedValue(null);

      await expect(service.create(dto, 'user-1', 'jwt', 'corr-1')).rejects.toThrow();
      expect(mappingRepository.create).not.toHaveBeenCalled();
    });

    it('DENY: Ambiguous mapping (duplicate) → do NOT create', async () => {
      const dto = { suiteOrgId: 'suite-1', coreOrgId: 'core-1' };
      
      jest.spyOn(orgRepository, 'findById').mockResolvedValue({ id: 'suite-1' } as any);
      jest.spyOn(mappingRepository, 'findBySuiteOrgId').mockResolvedValue({
        suiteOrgId: 'suite-1',
        coreOrgId: 'core-2',
      } as any);

      await expect(service.create(dto, 'user-1', 'jwt', 'corr-1')).rejects.toThrow();
      expect(mappingRepository.create).not.toHaveBeenCalled();
    });

    it('DENY: Any error → do NOT create mapping', async () => {
      const dto = { suiteOrgId: 'suite-1', coreOrgId: 'core-1' };
      
      jest.spyOn(orgRepository, 'findById').mockResolvedValue({ id: 'suite-1' } as any);
      jest.spyOn(mappingRepository, 'findBySuiteOrgId').mockResolvedValue(null);
      jest.spyOn(mappingRepository, 'findByCoreOrgId').mockResolvedValue(null);
      jest.spyOn(coreClient, 'validateOrganizationExists').mockRejectedValue(
        new Error('Network timeout')
      );

      await expect(service.create(dto, 'user-1', 'jwt', 'corr-1')).rejects.toThrow();
      expect(mappingRepository.create).not.toHaveBeenCalled();
    });
  });
});

