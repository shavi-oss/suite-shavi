/**
 * Security regression gate for the Customer Gateway (Contract B Stop Rules).
 *   1. Tenant is resolved from the JWT claim ONLY - client headers are ignored.
 *   2. The Core (Kernel) token is server-side only - never in the login response.
 */
import { CustomerSessionService } from '../../../src/customer/auth/customer-session.service';
import { CustomerSessionGuard } from '../../../src/customer/auth/customer-session.guard';
import { MemorySessionStore } from '../../../src/customer/auth/memory-session-store';
import { UnauthorizedException, ArgumentsHost, Logger } from '@nestjs/common';
import { CustomerAllExceptionsFilter } from '../../../src/customer/errors/customer-all-exceptions.filter';
import { CustomerKernelException } from '../../../src/customer/errors/customer-kernel.exception';

function fakeBroker(token: string) {
  return { loginUser: async () => token } as any;
}

const CORE_PAYLOAD = Buffer.from(
  JSON.stringify({ sub: 'u1', email: 'a@b.c', organizationId: 'org-1' }),
).toString('base64url');
const CORE_TOKEN = 'h.' + CORE_PAYLOAD + '.s';

function makeCtx(req: any) {
  return {
    switchToHttp: () => ({ getRequest: () => req }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as any;
}

describe('Customer Gateway - Fail-Closed Security Gate', () => {
  let store: MemorySessionStore;
  beforeAll(() => {
    process.env.CUSTOMER_SESSION_SECRET = 'test-secret';
  });
  beforeEach(() => {
    store = new MemorySessionStore();
  });
  afterEach(async () => {
    await store.close();
  });

  it('STOP RULE: tenant header X-Organization-Id is NEVER trusted', async () => {
    const svc = new CustomerSessionService(fakeBroker(CORE_TOKEN), store);
    const login = await svc.login('a@b.c', 'password123');
    const guard = new CustomerSessionGuard(svc);
    const req: any = {
      headers: { authorization: 'Bearer ' + login.token, 'x-tenant-id': 'SPOOF', 'x-organization-id': 'SPOOF' },
    };
    await guard.canActivate(makeCtx(req));
    expect(req.user.organizationId).toBe('org-1');
    expect(req.user.organizationId).not.toBe('SPOOF');
  });

  it('STOP RULE: Core token is never exposed to the Workspace', async () => {
    const svc = new CustomerSessionService(fakeBroker(CORE_TOKEN), store);
    const res = await svc.login('a@b.c', 'password123');
    const body = JSON.stringify(res);
    expect(body).not.toContain(CORE_TOKEN);
    expect(res.token).toBeDefined();
  });

  it('STOP RULE: invalid/expired Session JWT is denied', async () => {
    const svc = new CustomerSessionService(fakeBroker(CORE_TOKEN), store);
    const guard = new CustomerSessionGuard(svc);
    await expect(guard.canActivate(makeCtx({ headers: { authorization: 'Bearer x.y.z' } }))).rejects.toThrow(UnauthorizedException);
  });
});

// ── ADR-016 D3: standardized error envelope (extends the fail-closed gate) ──────
// Every customer controller error must serialize into the §4.1 envelope, and the
// envelope + its log line MUST NOT leak the Core token / PII / stack.
function runEnvelope(exception: unknown): { body: any; logged: string } {
  const res: any = {
    statusCode: 0,
    body: null,
    status(c: number) { this.statusCode = c; return this; },
    json(b: any) { this.body = b; return this; },
  };
  const host: ArgumentsHost = {
    switchToHttp: () => ({
      getResponse: () => res,
      getRequest: () => ({ method: 'POST', url: '/api/customer/v1/auth/session' }),
    }),
  } as any;
  const errSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  new CustomerAllExceptionsFilter().catch(exception, host);
  const logged = errSpy.mock.calls.map((c) => JSON.stringify(c[0])).join('|');
  errSpy.mockRestore();
  return { body: res.body, logged };
}

describe('Customer Gateway - Standardized error envelope (ADR-016 D3)', () => {
  it('a guard-denied session produces the CUSTOMER_UNAUTHORIZED envelope (no Core token leak)', async () => {
    const svc = new CustomerSessionService(fakeBroker(CORE_TOKEN), new MemorySessionStore());
    const guard = new CustomerSessionGuard(svc);
    let thrown: UnauthorizedException | null = null;
    try {
      await guard.canActivate(makeCtx({ headers: { authorization: 'Bearer x.y.z' } }));
    } catch (e) {
      thrown = e as UnauthorizedException;
    }
    expect(thrown).toBeInstanceOf(UnauthorizedException);
    const { body, logged } = runEnvelope(thrown!);
    expect(body.error.code).toBe('CUSTOMER_UNAUTHORIZED');
    expect(body.error.requestId).toMatch(/^c-[0-9a-f-]+$/);
    expect(JSON.stringify(body)).not.toContain(CORE_TOKEN);
    expect(logged).not.toContain(CORE_TOKEN);
  });

  it('a Kernel broker failure produces CUSTOMER_KERNEL_ERROR (502) with a generic body', () => {
    const { body, logged } = runEnvelope(new CustomerKernelException('login-network'));
    expect(body.error.code).toBe('CUSTOMER_KERNEL_ERROR');
    expect(body.error.message).toBe('Upstream service unavailable');
    expect(JSON.stringify(body)).not.toContain(CORE_TOKEN);
    expect(logged).not.toContain(CORE_TOKEN);
  });
});
