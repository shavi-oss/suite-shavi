import { DataAccessPolicy } from '../../../src/policy/data-access.policy';

describe('DataAccessPolicy — Fail-Closed Enforcement', () => {
  it('should allow organization:read:list', () => {
    expect(() => {
      DataAccessPolicy.enforce('organization', 'read:list');
    }).not.toThrow();
  });

  it('should allow organization:read:byId', () => {
    expect(() => {
      DataAccessPolicy.enforce('organization', 'read:byId');
    }).not.toThrow();
  });

  it('should deny organization:write:create', () => {
    expect(() => {
      DataAccessPolicy.enforce('organization', 'write:create');
    }).toThrow('POLICY_DENIED: organization:write:create');
  });

  it('should deny truly unregistered resource (fail-closed)', () => {
    expect(() => {
      DataAccessPolicy.enforce('unknown' as any, 'read:list');
    }).toThrow('POLICY_DENIED: unknown:read:list');
  });

  it('should return false for unregistered actions', () => {
    expect(DataAccessPolicy.isAllowed('organization', 'read:list')).toBe(true);
    expect(DataAccessPolicy.isAllowed('organization', 'write:create')).toBe(false);
    expect(DataAccessPolicy.isAllowed('unknown' as any, 'read:list')).toBe(false);
  });
});
