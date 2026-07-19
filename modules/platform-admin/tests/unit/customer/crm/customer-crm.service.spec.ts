import { CustomerCrmService } from '../../../../src/customer/crm/customer-crm.service';

/**
 * Unit test for the REAL CustomerCrmService response mapping.
 *
 * Why this exists: the integration spec (customer-gateway.spec.ts) overrides
 * CustomerCrmService with a mock, so it can NOT catch a regression in the real
 * service's response shape. The G1 review flagged exactly that blind spot
 * ("the CRM service is mocked, so the gap is uncaught"). This test exercises the
 * actual service (mocking only the Prisma repository) and locks the Spec §5.5 /
 * §5.6 shapes at the boundary where they are produced.
 */

describe('CustomerCrmService — response shapes (Spec §5.5 / §5.6)', () => {
  const repo: any = {
    list: jest.fn(),
    create: jest.fn(),
  };
  const svc = new CustomerCrmService(repo);

  beforeEach(() => jest.clearAllMocks());

  it('list() returns the { items, total } envelope (Spec §5.5)', async () => {
    const rows = [
      { id: 'a', name: 'A', email: 'a@x', phone: '1', suiteOrgId: 'ORG', createdAt: new Date('2026-07-19T00:00:00.000Z') },
      { id: 'b', name: 'B', email: null, phone: null, suiteOrgId: 'ORG', createdAt: new Date('2026-07-19T00:00:00.000Z') },
    ];
    repo.list.mockResolvedValue(rows);

    const result = await svc.list('ORG');

    expect(repo.list).toHaveBeenCalledWith('ORG');
    expect(result.total).toBe(2);
    expect(result.items).toEqual([
      { id: 'a', name: 'A', email: 'a@x', phone: '1' },
      { id: 'b', name: 'B', email: null, phone: null },
    ]);
    // The internal tenant column must not be present on list items.
    for (const item of result.items) {
      expect(item).not.toHaveProperty('suiteOrgId');
    }
  });

  it('create() maps suiteOrgId -> organizationId and keeps createdAt (Spec §5.6)', async () => {
    const row = {
      id: 'c1',
      name: 'Jane',
      email: 'jane@example.com',
      phone: '+1',
      suiteOrgId: 'ORG-CLAIM',
      createdAt: new Date('2026-07-19T00:00:00.000Z'),
    };
    repo.create.mockResolvedValue(row);

    const result = await svc.create('ORG-CLAIM', { name: 'Jane', email: 'jane@example.com', phone: '+1' });

    expect(repo.create).toHaveBeenCalledWith('ORG-CLAIM', {
      name: 'Jane',
      email: 'jane@example.com',
      phone: '+1',
    });
    expect(result).toEqual({
      id: 'c1',
      name: 'Jane',
      email: 'jane@example.com',
      phone: '+1',
      organizationId: 'ORG-CLAIM',
      createdAt: new Date('2026-07-19T00:00:00.000Z'),
    });
    // Internal tenant column MUST NOT leak into the response.
    expect(result).not.toHaveProperty('suiteOrgId');
  });
});
