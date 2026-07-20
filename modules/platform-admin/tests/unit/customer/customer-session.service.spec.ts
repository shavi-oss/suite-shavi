import { CustomerSessionService } from '../../../src/customer/auth/customer-session.service';
import { MemorySessionStore } from '../../../src/customer/auth/memory-session-store';
import { UnauthorizedException } from '@nestjs/common';

function fakeBroker(token: string) {
  return { loginUser: async () => token } as any;
}

const CORE_PAYLOAD = Buffer.from(
  JSON.stringify({ sub: 'u1', email: 'a@b.c', organizationId: 'org-1' }),
).toString('base64url');
const CORE_TOKEN = 'h.' + CORE_PAYLOAD + '.s';

describe('CustomerSessionService', () => {
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

  it('login issues a Session JWT carrying the org claim', async () => {
    const svc = new CustomerSessionService(fakeBroker(CORE_TOKEN), store);
    const res = await svc.login('a@b.c', 'password123');
    expect(res.token).toBeDefined();
    expect(res.expiresIn).toBe(900);
    const parts = res.token.split('.');
    const claims = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    expect(claims.organizationId).toBe('org-1');
    expect(claims.jti).toBeDefined();
  });

  it('login without organizationId is denied (fail-closed)', async () => {
    const noOrgPayload = Buffer.from(JSON.stringify({ sub: 'u1', email: 'a@b.c' })).toString('base64url');
    const noOrg = 'h.' + noOrgPayload + '.s';
    const svc = new CustomerSessionService(fakeBroker(noOrg), store);
    await expect(svc.login('a@b.c', 'password123')).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('refresh rotates jti and invalidates the old token', async () => {
    const svc = new CustomerSessionService(fakeBroker(CORE_TOKEN), store);
    const login = await svc.login('a@b.c', 'password123');
    const refreshed = await svc.refresh(login.token);
    expect(refreshed.token).not.toBe(login.token);
    await expect(svc.verify(login.token)).rejects.toThrow();
    await expect(svc.verify(refreshed.token)).resolves.toBeDefined();
  });

  it('logout invalidates the session', async () => {
    const svc = new CustomerSessionService(fakeBroker(CORE_TOKEN), store);
    const login = await svc.login('a@b.c', 'password123');
    await svc.logout(login.token);
    await expect(svc.verify(login.token)).rejects.toThrow();
  });

  it('Session JWT response NEVER contains the Core token', async () => {
    const svc = new CustomerSessionService(fakeBroker(CORE_TOKEN), store);
    const res = await svc.login('a@b.c', 'password123');
    expect((res as any).kernelToken).toBeUndefined();
    expect(JSON.stringify(res)).not.toContain(CORE_TOKEN);
  });
});
