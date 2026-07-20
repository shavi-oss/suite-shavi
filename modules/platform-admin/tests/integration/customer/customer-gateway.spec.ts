import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CustomerModule } from '../../../src/customer/customer.module';
import { CustomerSessionService } from '../../../src/customer/auth/customer-session.service';
import { CustomerCrmService } from '../../../src/customer/crm/customer-crm.service';
import { CustomerKernelBrokerService } from '../../../src/customer/kernel/customer-kernel-broker.service';
import { CustomerAllExceptionsFilter } from '../../../src/customer/errors/customer-all-exceptions.filter';
import { CustomerKernelException } from '../../../src/customer/errors/customer-kernel.exception';
import { BassanCrmJwtVerifier } from '../../../src/customer/auth/bassan-crm/bassan-crm-jwt-verifier';

/**
 * G3 integration test — standardized CUSTOMER_* error envelope + tenant-scoping
 * (claim-only, fail-closed) across all /api/customer/* controllers.
 * Spec: docs/customer-gateway/SPEC_AUTH_BROKER_TENANT_ERROR.md §4 / ADR-016 D3.
 *
 * TDD: written to assert the required behaviour; depends on the controllers being
 * wired with @UseFilters(CustomerAllExceptionsFilter) + @UsePipes(ValidationPipe)
 * and on DTO class-validator decorators (login/create-contact).
 */

const CLAIM = { sub: 'user-1', organizationId: 'ORG-CLAIM', email: 'a@b.c' };

describe('Customer Gateway — tenant-scoping + standardized error model (G3)', () => {
  let app: INestApplication;

  const broker: any = { loginUser: jest.fn().mockResolvedValue('core.jwt.token') };
  const session: any = {
    // login delegates to the Kernel broker (the real production call path).
    login: jest.fn().mockImplementation(async (email: string, password: string) => {
      const kernelToken = await broker.loginUser(email, password);
      return { token: 'sess-' + (kernelToken ?? 'undefined'), expiresIn: 900 };
    }),
    refresh: jest.fn().mockReturnValue({ token: 'new', expiresIn: 900 }),
    logout: jest.fn(),
    verify: jest.fn().mockReturnValue(CLAIM),
  };
  const crm: any = {
    // Contract shapes (Spec §5.5 / §5.6) — the mock MUST return what the real
    // service returns, otherwise the gap the G1 review flagged stays uncaught.
    list: jest
      .fn()
      .mockResolvedValue({ items: [{ id: 'c1', name: 'Jane', email: 'j@e.com', phone: '+1' }], total: 1 }),
    create: jest.fn().mockResolvedValue({
      id: 'c1',
      name: 'Jane',
      email: 'jane@example.com',
      phone: '+1',
      organizationId: 'ORG-CLAIM',
      createdAt: '2026-07-19T00:00:00.000Z',
    }),
  };
  // Real CrmScopeGuard injects BassanCrmJwtVerifier -> we mock it to issue/deny scopes.
  const crmVerifier: any = { verify: jest.fn() };

  beforeAll(async () => {
    process.env.CORE_API_BASE_URL = process.env.CORE_API_BASE_URL || 'http://localhost:3000';
    const moduleRef = await Test.createTestingModule({ imports: [CustomerModule] })
      .overrideProvider(CustomerSessionService).useValue(session)
      .overrideProvider(CustomerCrmService).useValue(crm)
      .overrideProvider(CustomerKernelBrokerService).useValue(broker)
      .overrideProvider(BassanCrmJwtVerifier).useValue(crmVerifier)
      .compile();

    app = moduleRef.createNestApplication();
    // NOTE: no global ValidationPipe — the customer controllers apply their own
    // scoped @UsePipes(ValidationPipe) (ADR-016 D3: scoped, not app-wide).
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Restore default behaviours after clearAllMocks.
    session.verify.mockReturnValue(CLAIM);
    broker.loginUser.mockResolvedValue('core.jwt.token');
    crm.list.mockResolvedValue({ items: [{ id: 'c1', name: 'Jane', email: 'j@e.com', phone: '+1' }], total: 1 });
    crm.create.mockResolvedValue({
      id: 'c1',
      name: 'Jane',
      email: 'jane@example.com',
      phone: '+1',
      organizationId: 'ORG-CLAIM',
      createdAt: '2026-07-19T00:00:00.000Z',
    });
    // Grants both crm.leads scopes (enough for list+create routes).
    crmVerifier.verify.mockResolvedValue({ sub: 'bassan-user', scope: 'crm.leads:read crm.leads:write' });
  });

  describe('standardized error envelope (Spec §4.1 / ADR-016 D3)', () => {
    it('401 CUSTOMER_UNAUTHORIZED when no session token (fail-closed)', async () => {
      const res = await request(app.getHttpServer()).get('/api/customer/v1/me');
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('CUSTOMER_UNAUTHORIZED');
    });

    it('400 CUSTOMER_BAD_REQUEST + details on invalid LoginDto', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/customer/v1/auth/session')
        .send({ email: 'not-an-email', password: 'short' });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('CUSTOMER_BAD_REQUEST');
      expect(Array.isArray(res.body.error.details)).toBe(true);
      expect(res.body.error.details.length).toBeGreaterThan(0);
    });

    it('403 CUSTOMER_FORBIDDEN when crm scope missing', async () => {
      // Verifier returns claims WITHOUT the required crm.leads scope -> guard 403s.
      crmVerifier.verify.mockResolvedValue({ sub: 'bassan-user', scope: 'crm.tasks:read' });
      const res = await request(app.getHttpServer())
        .get('/api/customer/v1/crm/contacts')
        .set('Authorization', 'Bearer tok')
        .set('x-bassan-crm-token', 'bassan.crm.jwt');
      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('CUSTOMER_FORBIDDEN');
    });

    it('404 CUSTOMER_NOT_FOUND when service throws NotFound', async () => {
      crm.list.mockRejectedValueOnce(new NotFoundException('contact missing'));
      const res = await request(app.getHttpServer())
        .get('/api/customer/v1/crm/contacts')
        .set('Authorization', 'Bearer tok')
        .set('x-bassan-crm-token', 'bassan.crm.jwt');
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('CUSTOMER_NOT_FOUND');
    });

    it('409 CUSTOMER_CONFLICT when service throws Conflict', async () => {
      crm.create.mockRejectedValueOnce(new ConflictException('duplicate contact'));
      const res = await request(app.getHttpServer())
        .post('/api/customer/v1/crm/contacts')
        .set('Authorization', 'Bearer tok')
        .set('x-bassan-crm-token', 'bassan.crm.jwt')
        .send({ name: 'Jane', email: 'jane@example.com' });
      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('CUSTOMER_CONFLICT');
    });

    it('502 CUSTOMER_KERNEL_ERROR (generic) when broker fails', async () => {
      session.login.mockRejectedValueOnce(new CustomerKernelException('login-network'));
      const res = await request(app.getHttpServer())
        .post('/api/customer/v1/auth/session')
        .send({ email: 'valid@example.com', password: 'password123' });
      expect(res.status).toBe(502);
      expect(res.body.error.code).toBe('CUSTOMER_KERNEL_ERROR');
      expect(res.body.error.message).toBe('Upstream service unavailable');
    });
  });

  describe('tenant claim-only, fail-closed (Contract B §4.1/§10)', () => {
    it('derives org from JWT claim and IGNORES spoofed X-Organization-Id header (/me)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/customer/v1/me')
        .set('Authorization', 'Bearer tok')
        .set('x-organization-id', 'ORG-SPOOF');
      expect(res.status).toBe(200);
      expect(res.body.organizationId).toBe('ORG-CLAIM');
      expect(res.body.organizationId).not.toBe('ORG-SPOOF');
    });

    it('passes claim orgId to CRM service on list (tenant-scoped)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/customer/v1/crm/contacts')
        .set('Authorization', 'Bearer tok')
        .set('x-bassan-crm-token', 'bassan.crm.jwt')
        .set('x-organization-id', 'ORG-SPOOF');
      expect(res.status).toBe(200);
      expect(crm.list).toHaveBeenCalledWith('ORG-CLAIM');
    });

    it('passes claim orgId to CRM service on create (tenant-scoped)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/customer/v1/crm/contacts')
        .set('Authorization', 'Bearer tok')
        .set('x-bassan-crm-token', 'bassan.crm.jwt')
        .set('x-organization-id', 'ORG-SPOOF')
        .send({ name: 'Jane', email: 'jane@example.com' });
      expect(res.status).toBe(201);
      expect(crm.create).toHaveBeenCalledWith('ORG-CLAIM', expect.anything());
    });
  });

  describe('CRM response shapes (Spec §5.5 / §5.6)', () => {
    it('GET /crm/contacts returns { items, total } envelope (Spec §5.5)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/customer/v1/crm/contacts')
        .set('Authorization', 'Bearer tok')
        .set('x-bassan-crm-token', 'bassan.crm.jwt');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.items)).toBe(true);
      expect(typeof res.body.total).toBe('number');
      expect(res.body.total).toBe(res.body.items.length);
      for (const item of res.body.items) {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('name');
        // Internal tenant column must NEVER be exposed to the client.
        expect(item).not.toHaveProperty('suiteOrgId');
      }
    });

    it('POST /crm/contacts returns { id, name, email, phone, organizationId, createdAt } (Spec §5.6)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/customer/v1/crm/contacts')
        .set('Authorization', 'Bearer tok')
        .set('x-bassan-crm-token', 'bassan.crm.jwt')
        .send({ name: 'Jane', email: 'jane@example.com', phone: '+1' });
      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        id: 'c1',
        name: 'Jane',
        email: 'jane@example.com',
        phone: '+1',
        organizationId: 'ORG-CLAIM',
        createdAt: '2026-07-19T00:00:00.000Z',
      });
      // Internal tenant column must NEVER be exposed to the client.
      expect(res.body).not.toHaveProperty('suiteOrgId');
    });
  });

  describe('no secret leakage (CONFLICT_RULES #6)', () => {
    it('error envelope never contains a token/Bearer/accessToken', async () => {
      const res = await request(app.getHttpServer()).get('/api/customer/v1/me');
      const payload = JSON.stringify(res.body).toLowerCase();
      expect(payload).not.toContain('bearer');
      expect(payload).not.toContain('eyj'); // JWT segment prefix
      expect(payload).not.toContain('accesstoken');
    });
  });
});
