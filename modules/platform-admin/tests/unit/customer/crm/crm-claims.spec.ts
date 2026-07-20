import {
  parseCrmScope,
  isCrmAdmin,
  hasCrmPermission,
  CRM_PERMISSIONS,
  CRM_AUDIENCE,
  CRM_ADMIN_ROLE,
} from '../../../../src/customer/auth/bassan-crm/crm-claims';

describe('crm.* claim helpers (G-SEC-2 delegation namespace)', () => {
  it('exposes the exact 4-row crm.* namespace', () => {
    expect([...CRM_PERMISSIONS]).toEqual([
      'crm.leads:read',
      'crm.leads:write',
      'crm.tasks:read',
      'crm.tasks:write',
    ]);
  });

  it('pins the SHAVI CRM audience', () => {
    expect(CRM_AUDIENCE).toBe('urn:shavi:crm');
  });

  describe('parseCrmScope', () => {
    it('parses a space-separated scope string into recognized permissions', () => {
      const got = parseCrmScope('crm.leads:read crm.leads:write crm.tasks:read');
      expect(got.has('crm.leads:read')).toBe(true);
      expect(got.has('crm.leads:write')).toBe(true);
      expect(got.has('crm.tasks:read')).toBe(true);
      expect(got.has('crm.tasks:write')).toBe(false);
    });

    it('ignores unknown / malformed scope tokens', () => {
      const got = parseCrmScope('crm.leads:read bogus leads:* crm.tasks:write');
      expect(got).toEqual(new Set(['crm.leads:read', 'crm.tasks:write']));
    });

    it('returns an empty set for undefined/empty scope', () => {
      expect(parseCrmScope(undefined).size).toBe(0);
      expect(parseCrmScope('   ').size).toBe(0);
    });
  });

  describe('isCrmAdmin (superuser-bypass parity with Bassan permissions.guard.ts L72-74)', () => {
    it('is true for role === Admin', () => {
      expect(isCrmAdmin({ role: CRM_ADMIN_ROLE })).toBe(true);
    });
    it('is true for roles array containing Admin', () => {
      expect(isCrmAdmin({ roles: ['user', CRM_ADMIN_ROLE] })).toBe(true);
    });
    it('is true for is_superuser === true', () => {
      expect(isCrmAdmin({ is_superuser: true })).toBe(true);
    });
    it('is false for an ordinary scoped user', () => {
      expect(isCrmAdmin({ role: 'user', scope: 'crm.leads:read' })).toBe(false);
    });
  });

  describe('hasCrmPermission', () => {
    it('grants when the required scope is present', () => {
      expect(hasCrmPermission({ scope: 'crm.leads:read' }, 'crm.leads:read')).toBe(true);
    });
    it('denies when the required scope is absent', () => {
      expect(hasCrmPermission({ scope: 'crm.leads:read' }, 'crm.leads:write')).toBe(false);
    });
    it('grants any required permission to an Admin even without scope (parity)', () => {
      expect(hasCrmPermission({ role: 'Admin' }, 'crm.tasks:write')).toBe(true);
    });
  });
});
