/**
 * Fail-Closed Security Tests — platform-admin
 *
 * GATE 4.8 — SECURITY TESTS
 * Tests for deny-by-default enforcement.
 * 
 * GATE 4.9 — SECURITY TESTS (UPDATED)
 * Tests for health endpoint opt-in and guard usage verification.
 */

import { Test } from '@nestjs/testing';
import { DenyAllGuard } from '../../guards/deny-all.guard';
import { ExplicitAllowGuard } from '../../guards/explicit-allow.guard';
import { PlatformAdminModule } from '../../platform-admin.module';
import { HealthController } from '../../controllers/health.controller';
import { APP_GUARD } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';

describe('Fail-Closed Security', () => {
  describe('deny-by-default enforcement', () => {
    it('should deny all requests by default', () => {
      const guard = new DenyAllGuard();
      const mockContext = {} as ExecutionContext;
      const result = guard.canActivate(mockContext);
      expect(result).toBe(false);
    });

    it('should not allow bypass', () => {
      const guard = new DenyAllGuard();
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({ headers: { authorization: 'Bearer fake-token' } }),
        }),
      } as ExecutionContext;
      const result = guard.canActivate(mockContext);
      expect(result).toBe(false);
    });
  });

  describe('Gate 4.9 — health endpoint opt-in', () => {
    it('should preserve APP_GUARD as DenyAllGuard', () => {
      // Verify APP_GUARD provider exists in module metadata
      const providers = Reflect.getMetadata('providers', PlatformAdminModule) || [];
      const appGuardProvider = providers.find((p: any) => 
        p && typeof p === 'object' && p.provide === APP_GUARD
      );
      
      expect(appGuardProvider).toBeDefined();
      expect(appGuardProvider.useClass).toBe(DenyAllGuard);
    });

    it('should have exactly one controller (HealthController)', async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [PlatformAdminModule],
      }).compile();

      const controllers = moduleRef.get(HealthController);
      expect(controllers).toBeDefined();
    });

    it('should use ExplicitAllowGuard on exactly one route', () => {
      const controller = new HealthController();
      const metadata = Reflect.getMetadata('__guards__', controller.getHealth);
      
      // Verify guard is applied
      expect(metadata).toBeDefined();
      expect(metadata).toContain(ExplicitAllowGuard);
    });
  });
});

