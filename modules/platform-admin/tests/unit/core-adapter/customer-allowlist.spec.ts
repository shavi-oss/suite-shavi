import {
  assertCustomerEndpointAllowed,
  getAllowedCoreEndpoints,
  getCustomerAllowedCoreEndpoints,
} from '../../../src/core-adapter/core.contract.assert';

/**
 * ADR-016 D4 — the customer broker's allowed Core endpoints MUST live in the
 * SAME canonical allowlist/assert module as CoreClient (core.contract.assert.ts),
 * as a customer-scoped SUBSET. This proves consolidation and prevents the broker
 * from drifting onto an unauthorized Core endpoint.
 */
describe('Customer Core Allowlist (subset in core.contract.assert)', () => {
  it('allows POST /api/v1/auth/login (Kernel-brokered login)', () => {
    expect(() => assertCustomerEndpointAllowed('POST', '/api/v1/auth/login')).not.toThrow();
  });

  it('allows GET /api/v1/organizations/:id with and without a UUID', () => {
    expect(() =>
      assertCustomerEndpointAllowed('GET', '/api/v1/organizations/123e4567-e89b-12d3-a456-426614174000'),
    ).not.toThrow();
    expect(() => assertCustomerEndpointAllowed('GET', '/api/v1/organizations/:id')).not.toThrow();
  });

  it('BLOCKS every non-customer Core endpoint', () => {
    expect(() => assertCustomerEndpointAllowed('GET', '/api/v1/auth/token')).toThrow(/STOP/);
    expect(() => assertCustomerEndpointAllowed('POST', '/api/v1/organizations')).toThrow(/STOP/);
    expect(() =>
      assertCustomerEndpointAllowed('DELETE', '/api/v1/organizations/123e4567-e89b-12d3-a456-426614174000'),
    ).toThrow(/STOP/);
    expect(() => assertCustomerEndpointAllowed('GET', '/api/v1/workflows')).toThrow(/STOP/);
  });

  it('keeps the admin (CoreClient) allowlist unchanged at 6 entries', () => {
    expect(getAllowedCoreEndpoints()).toHaveLength(6);
  });

  it('exposes exactly the 2 customer-scoped endpoints', () => {
    const c = getCustomerAllowedCoreEndpoints();
    expect(c).toContain('POST /api/v1/auth/login');
    expect(c).toContain('GET /api/v1/organizations/:id');
    expect(c).toHaveLength(2);
  });
});
