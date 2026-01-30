/**
 * HealthController Tests — platform-admin
 *
 * GATE 4.9 — UNIT TESTS
 * Tests for HealthController endpoint behavior.
 */

import { HealthController } from '../../../controllers/health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(() => {
    controller = new HealthController();
  });

  describe('getHealth', () => {
    it('should return health response with status "ok"', () => {
      const result = controller.getHealth();
      expect(result.status).toBe('ok');
    });

    it('should return module name "platform-admin"', () => {
      const result = controller.getHealth();
      expect(result.module).toBe('platform-admin');
    });

    it('should return valid ISO 8601 timestamp', () => {
      const result = controller.getHealth();
      expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
    });

    it('should not throw exceptions', () => {
      expect(() => controller.getHealth()).not.toThrow();
    });
  });
});
