import {
  assertCoreEndpointAllowed,
  getAllowedCoreEndpoints,
} from '../../../src/core-adapter/core.contract.assert';

describe('Core Contract Assertion — Endpoint Allowlist', () => {
  describe('ALLOW: Authorized endpoint', () => {
    it('should allow GET /api/v1/organizations/:id with UUID', () => {
      expect(() =>
        assertCoreEndpointAllowed('GET', '/api/v1/organizations/123e4567-e89b-12d3-a456-426614174000'),
      ).not.toThrow();
    });

    it('should allow GET /api/v1/organizations/:id (pattern)', () => {
      expect(() =>
        assertCoreEndpointAllowed('GET', '/api/v1/organizations/:id'),
      ).not.toThrow();
    });

    it('should allow case-insensitive method', () => {
      expect(() =>
        assertCoreEndpointAllowed('get', '/api/v1/organizations/123e4567-e89b-12d3-a456-426614174000'),
      ).not.toThrow();
    });
  });

  describe('BLOCK: Unauthorized endpoints', () => {
    it('should block POST /api/v1/organizations', () => {
      expect(() =>
        assertCoreEndpointAllowed('POST', '/api/v1/organizations'),
      ).toThrow('STOP: Unauthorized Core endpoint call');
    });

    it('should block GET /api/v1/workflows', () => {
      expect(() =>
        assertCoreEndpointAllowed('GET', '/api/v1/workflows'),
      ).toThrow('STOP: Unauthorized Core endpoint call');
    });

    it('should block DELETE /api/v1/organizations/:id', () => {
      expect(() =>
        assertCoreEndpointAllowed('DELETE', '/api/v1/organizations/123e4567-e89b-12d3-a456-426614174000'),
      ).toThrow('STOP: Unauthorized Core endpoint call');
    });

    it('should block PUT /api/v1/organizations/:id', () => {
      expect(() =>
        assertCoreEndpointAllowed('PUT', '/api/v1/organizations/123e4567-e89b-12d3-a456-426614174000'),
      ).toThrow('STOP: Unauthorized Core endpoint call');
    });

    it('should block PATCH /api/v1/organizations/:id', () => {
      expect(() =>
        assertCoreEndpointAllowed('PATCH', '/api/v1/organizations/123e4567-e89b-12d3-a456-426614174000'),
      ).toThrow('STOP: Unauthorized Core endpoint call');
    });

    it('should block GET /api/v1/templates', () => {
      expect(() =>
        assertCoreEndpointAllowed('GET', '/api/v1/templates'),
      ).toThrow('STOP: Unauthorized Core endpoint call');
    });

    it('should block POST /api/v1/templates/publish', () => {
      expect(() =>
        assertCoreEndpointAllowed('POST', '/api/v1/templates/publish'),
      ).toThrow('STOP: Unauthorized Core endpoint call');
    });

    it('should block GET /api/v1/auth/token', () => {
      expect(() =>
        assertCoreEndpointAllowed('GET', '/api/v1/auth/token'),
      ).toThrow('STOP: Unauthorized Core endpoint call');
    });
  });

  describe('getAllowedCoreEndpoints', () => {
    it('should return exactly 5 allowed endpoints (Phase C1/C2 additions included)', () => {
      const allowed = getAllowedCoreEndpoints();
      expect(allowed).toHaveLength(5);
      // Original Core v1 contract
      expect(allowed).toContain('GET /api/v1/organizations/:id');
      // Phase C1 — lifecycle endpoints added (admin S2S only)
      expect(allowed).toContain('POST /api/v2/admin/organizations');
      expect(allowed).toContain('PATCH /api/v2/admin/organizations/:id/suspend');
      expect(allowed).toContain('PATCH /api/v2/admin/organizations/:id/unsuspend');
      expect(allowed).toContain('PATCH /api/v2/admin/organizations/:id/deactivate');
    });
  });
});
