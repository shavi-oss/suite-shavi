/**
 * Build Non-Regression Tests — platform-admin
 *
 * GATE 4.8 — NON-REGRESSION TESTS
 * Tests to ensure no unintended features exist.
 * 
 * GATE 4.9 — NON-REGRESSION TESTS (UPDATED)
 * Tests to ensure exactly one controller and one route exist.
 */

import { Test } from '@nestjs/testing';
import { PlatformAdminModule } from '../../platform-admin.module';
import { HealthController } from '../../controllers/health.controller';

describe('Build Non-Regression', () => {
  describe('module exports', () => {
    it('should export only PlatformAdminModule', () => {
      const moduleExports = require('../../index');
      expect(moduleExports.PlatformAdminModule).toBe(PlatformAdminModule);
      expect(Object.keys(moduleExports)).toEqual(['PlatformAdminModule']);
    });
  });

  describe('Gate 4.9 — controller constraints', () => {
    it('should have exactly one controller (HealthController)', () => {
      // Count controllers by checking module metadata
      const controllers = Reflect.getMetadata('controllers', PlatformAdminModule);
      expect(controllers).toBeDefined();
      expect(controllers.length).toBe(1);
      expect(controllers[0]).toBe(HealthController);
    });

    it('should have exactly one route (/platform-admin/health)', () => {
      // Verify only one route exists by checking controller methods
      const controller = new HealthController();
      const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(controller))
        .filter(name => name !== 'constructor');
      
      expect(methods.length).toBe(1);
      expect(methods[0]).toBe('getHealth');
    });
  });

  describe('TypeScript compilation', () => {
    it('should compile without errors', () => {
      // This test passes if the file compiles
      expect(true).toBe(true);
    });
  });
});

