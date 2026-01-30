/**
 * Build Non-Regression Tests — platform-admin
 *
 * GATE 4.8 — NON-REGRESSION TESTS
 * Tests to ensure no unintended features exist.
 */

import { PlatformAdminModule } from '../../platform-admin.module';

describe('Build Non-Regression', () => {
  describe('module exports', () => {
    it('should export only PlatformAdminModule', () => {
      const moduleExports = require('../../index');
      expect(moduleExports.PlatformAdminModule).toBe(PlatformAdminModule);
      expect(Object.keys(moduleExports)).toEqual(['PlatformAdminModule']);
    });
  });

  describe('no controllers', () => {
    it('should not have controllers in module metadata', () => {
      const metadata = Reflect.getMetadata('controllers', PlatformAdminModule);
      expect(metadata).toBeUndefined();
    });
  });

  describe('TypeScript compilation', () => {
    it('should compile without errors', () => {
      // This test passes if the file compiles
      expect(true).toBe(true);
    });
  });
});

