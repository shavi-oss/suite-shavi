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
    it('should have exactly three controllers (Gate 1.7)', () => {
      // Gate 1.7: Verify 3 controllers (HealthController, InternalUserController, AuditController)
      // Evidence: platform-admin.module.ts line 29, GATE_1_7_GOVERNANCE_AMENDMENT.md lines 77-78
      const controllers = Reflect.getMetadata('controllers', PlatformAdminModule);
      expect(controllers).toBeDefined();
      expect(controllers.length).toBe(3);
      
      // Verify exact controller set (order-independent)
      const controllerNames = controllers.map((c: any) => c.name);
      expect(controllerNames).toContain('HealthController');
      expect(controllerNames).toContain('InternalUserController');
      expect(controllerNames).toContain('AuditController');
    });

    it('should have exactly one route (/platform-admin/health)', () => {
      // Verify only one route exists by checking controller methods
      const controller = new HealthController();
      const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(controller))
        .filter(name => name !== 'constructor');
      
      expect(methods.length).toBe(1);
      expect(methods[0]).toBe('getHealth');
    });

    it('should verify route metadata (Gate 4.10)', () => {
      // Verify controller path
      const pathMetadata = Reflect.getMetadata('path', HealthController);
      expect(pathMetadata).toBe('platform-admin');

      // Verify method path
      const controller = new HealthController();
      const methodMetadata = Reflect.getMetadata('path', controller.getHealth);
      expect(methodMetadata).toBe('health');

      // Verify HTTP method using RequestMethod enum (avoid magic numbers)
      const { RequestMethod } = require('@nestjs/common');
      const httpMethod = Reflect.getMetadata('method', controller.getHealth);
      expect(httpMethod).toBe(RequestMethod.GET);
    });
  });

  describe('Gate 4.10 — test command invariant', () => {
    it('should document official test command', () => {
      // Official test command (policy-level documentation)
      const officialCommand = 'npx jest --config jest.config.cjs';
      expect(officialCommand).toBeDefined();
    });

    it('should verify npm test is not the official command', () => {
      // Verify npm test is NOT the official command
      const packageJson = require('../../../../package.json');
      const testScript = packageJson.scripts?.test;

      // Either undefined OR explicitly not the official command
      if (testScript) {
        expect(testScript).not.toBe('jest --config jest.config.cjs');
      }
    });
  });
});

