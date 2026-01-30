/**
 * Fail-Closed Security Tests — platform-admin
 *
 * GATE 4.8 — SECURITY TESTS
 * Tests for deny-by-default enforcement.
 */

import { DenyAllGuard } from '../../guards/deny-all.guard';
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
});

