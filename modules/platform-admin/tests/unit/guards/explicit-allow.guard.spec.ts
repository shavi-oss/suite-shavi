/**
 * ExplicitAllowGuard Tests — platform-admin
 *
 * GATE 4.9 — UNIT TESTS
 * Tests for ExplicitAllowGuard opt-in behavior.
 */

import { ExecutionContext } from '@nestjs/common';
import { ExplicitAllowGuard } from '../../../guards/explicit-allow.guard';

describe('ExplicitAllowGuard', () => {
  let guard: ExplicitAllowGuard;

  beforeEach(() => {
    guard = new ExplicitAllowGuard();
  });

  describe('canActivate', () => {
    it('should always return true', () => {
      const mockContext = {} as ExecutionContext;
      const result = guard.canActivate(mockContext);
      expect(result).toBe(true);
    });

    it('should allow access with any ExecutionContext', () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({}),
          getResponse: () => ({}),
        }),
      } as ExecutionContext;
      const result = guard.canActivate(mockContext);
      expect(result).toBe(true);
    });

    it('should not throw exceptions', () => {
      const mockContext = {} as ExecutionContext;
      expect(() => guard.canActivate(mockContext)).not.toThrow();
    });
  });
});
