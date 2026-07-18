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

describe('CustomerSessionGuard', () => {
  beforeAll(() => {
    process.env.CUSTOMER_SESSION_SECRET = 'test-secret';
  });

  it('denies a missing token', () => {
    const svc = new CustomerSessionService(fakeBroker(CORE_TOKEN));
    const guard = new CustomerSessionGuard(svc);
    expect(() => guard.canActivate(makeCtx({ headers: {} }))).toThrow(UnauthorizedException);
  });

  it('denies an invalid token', () => {
    const svc = new CustomerSessionService(fakeBroker(CORE_TOKEN));
    const guard = new CustomerSessionGuard(svc);
    expect(() => guard.canActivate(makeCtx({ headers: { authorization: 'Bearer bad.token.here' } }))).toThrow(UnauthorizedException);
  });

  it('resolves tenant from JWT claim and IGNORES a spoofed X-Organization-Id header', async () => {
    const svc = new CustomerSessionService(fakeBroker(CORE_TOKEN));
    const login = await svc.login('a@b.c', 'password123');
    const guard = new CustomerSessionGuard(svc);
    const req: any = {
      headers: { authorization: 'Bearer ' + login.token, 'x-organization-id': 'EVIL-ORG' },
    };
    expect(guard.canActivate(makeCtx(req))).toBe(true);
    expect(req.user.organizationId).toBe('org-1');
    expect(req.user.organizationId).not.toBe('EVIL-ORG');
  });

  it('denies when the server-side session was logged out', async () => {
    const svc = new CustomerSessionService(fakeBroker(CORE_TOKEN));
    const login = await svc.login('a@b.c', 'password123');
    svc.logout(login.token);
    const guard = new CustomerSessionGuard(svc);
    expect(() => guard.canActivate(makeCtx({ headers: { authorization: 'Bearer ' + login.token } }))).toThrow(UnauthorizedException);
  });
});
