/**
 * DenyAllGuard Tests — platform-admin
 *
 * GATE 4.8 — UNIT TESTS
 * Tests for DenyAllGuard fail-closed behavior.
 */

import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DenyAllGuard } from '../../../guards/deny-all.guard';

describe('DenyAllGuard', () => {
  let guard: DenyAllGuard;

  beforeEach(() => {
    guard = new DenyAllGuard(new Reflector());
  });

  describe('canActivate', () => {
    it('should always return false', () => {
      const mockContext = {
        getHandler: () => jest.fn(),
        getClass: () => jest.fn(),
      } as unknown as ExecutionContext;
      const result = guard.canActivate(mockContext);
      expect(result).toBe(false);
    });

    it('should deny access with any ExecutionContext', () => {
      const mockContext = {
        getHandler: () => jest.fn(),
        getClass: () => jest.fn(),
        switchToHttp: () => ({
          getRequest: () => ({}),
          getResponse: () => ({}),
        }),
      } as unknown as ExecutionContext;
      const result = guard.canActivate(mockContext);
      expect(result).toBe(false);
    });

    it('should not throw exceptions', () => {
      const mockContext = {
        getHandler: () => jest.fn(),
        getClass: () => jest.fn(),
      } as unknown as ExecutionContext;
      expect(() => guard.canActivate(mockContext)).not.toThrow();
    });
  });
});

