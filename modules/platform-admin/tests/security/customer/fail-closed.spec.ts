/**
 * Security regression gate for the Customer Gateway (Contract B Stop Rules).
 *   1. Tenant is resolved from the JWT claim ONLY - client headers are ignored.
 *   2. The Core (Kernel) token is server-side only - never in the login response.
 */
import { CustomerSessionService } from '../../../src/customer/auth/customer-session.service';
import { CustomerSessionGuard } from '../../../src/customer/auth/customer-session.guard';
import { UnauthorizedException } from '@nestjs/common';

function fakeBroker(token: string) {
  return { loginUser: async () => token } as any;
}

const CORE_PAYLOAD = Buffer.from(
  JSON.stringify({ sub: 'u1', email: 'a@b.c', organizationId: 'org-1' }),
).toString('base64url');
const CORE_TOKEN='h.' + CORE_PAYLOAD + '.s';

function makeCtx(req: any) {
  return {
    switchToHttp: () => ({ getRequest: () => req }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as any;
}

describe('Customer Gateway - Fail-Closed Security Gate', () => {
  beforeAll(() => {
    process.env.CUSTOMER_SESSION_SECRET = 'test-secret';
  });

  it('STOP RULE: tenant header X-Organization-Id is NEVER trusted', async () => {
    const svc = new CustomerSessionService(fakeBroker(CORE_TOKEN));
    const login = await svc.login('a@b.c', 'password123');
    const guard = new CustomerSessionGuard(svc);
    const req: any = {
      headers: { authorization: 'Bearer ' + login.token, 'x-tenant-id': 'SPOOF', 'x-organization-id': 'SPOOF' },
    };
    guard.canActivate(makeCtx(req));
    expect(req.user.organizationId).toBe('org-1');
    expect(req.user.organizationId).not.toBe('SPOOF');
  });

  it('STOP RULE: Core token is never exposed to the Workspace', async () => {
    const svc = new CustomerSessionService(fakeBroker(CORE_TOKEN));
    const res = await svc.login('a@b.c', 'password123');
    const body = JSON.stringify(res);
    expect(body).not.toContain(CORE_TOKEN);
    expect(res.token).toBeDefined();
  });

  it('STOP RULE: invalid/expired Session JWT is denied', async () => {
    const svc = new CustomerSessionService(fakeBroker(CORE_TOKEN));
    const guard = new CustomerSessionGuard(svc);
    expect(() => guard.canActivate(makeCtx({ headers: { authorization: 'Bearer x.y.z' } }))).toThrow(UnauthorizedException);
  });
});
