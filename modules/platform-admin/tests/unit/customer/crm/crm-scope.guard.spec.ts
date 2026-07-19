import { generateKeyPairSync, createSign } from 'crypto';
import { Reflector } from '@nestjs/core';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { CrmScopeGuard, RequireCrmScope } from '../../../../src/customer/auth/bassan-crm/crm-scope.guard';
import { BassanCrmJwtVerifier } from '../../../../src/customer/auth/bassan-crm/bassan-crm-jwt-verifier';
import { StaticBassanKeyProvider } from '../../../../src/customer/auth/bassan-crm/bassan-key-provider';

// ---- RS256 test fixtures (stand-in for Bassan's JWKS; no Bassan code touched) ----
function makeRsaPair() {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  return {
    privateKey: privateKey.export({ type: 'pkcs8', format: 'pem' }).toString(),
    publicKey: publicKey.export({ type: 'spki', format: 'pem' }).toString(),
  };
}

function signRs256(header: object, payload: object, privateKeyPem: string): string {
  const h = Buffer.from(JSON.stringify(header)).toString('base64url');
  const p = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signingInput = `${h}.${p}`;
  const sig = createSign('RSA-SHA256').update(signingInput).sign(privateKeyPem, 'base64url');
  return `${signingInput}.${sig}`;
}

// Signs with a header that claims an arbitrary alg (used to prove alg-confusion is rejected).
function signWithAlg(alg: string, payload: object, privateKeyPem: string): string {
  const h = Buffer.from(JSON.stringify({ alg, typ: 'JWT' })).toString('base64url');
  const p = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signingInput = `${h}.${p}`;
  const sig = alg === 'none' ? '' : createSign('RSA-SHA256').update(signingInput).sign(privateKeyPem, 'base64url');
  return `${signingInput}.${sig}`;
}

const ISS = 'https://bassan.example';
const AUD = 'urn:shavi:crm';

class FakeCtrl {
  @RequireCrmScope('crm.leads:read')
  read() {}
  @RequireCrmScope('crm.leads:write')
  write() {}
}

function makeCtx(req: any, handler: any) {
  return {
    switchToHttp: () => ({ getRequest: () => req }),
    getHandler: () => handler,
    getClass: () => FakeCtrl,
  } as any;
}

describe('CrmScopeGuard — G-SEC-2 (2/3) verify+enforce Bassan crm.* claims', () => {
  let pair: { privateKey: string; publicKey: string };
  let guard: CrmScopeGuard;

  beforeAll(() => {
    pair = makeRsaPair();
    const verifier = new BassanCrmJwtVerifier(
      new StaticBassanKeyProvider(pair.publicKey),
      { issuer: ISS, audience: AUD },
    );
    guard = new CrmScopeGuard(new Reflector(), verifier);
  });

  const token = (overrides: Record<string, unknown> = {}) =>
    signRs256(
      { alg: 'RS256', typ: 'JWT' },
      { iss: ISS, aud: AUD, sub: 'u1', exp: Math.floor(Date.now() / 1000) + 3600, ...overrides },
      pair.privateKey,
    );

  it('allows a request whose token scope satisfies the required read permission', async () => {
    const req: any = { headers: { 'x-bassan-crm-token': 'Bearer ' + token({ scope: 'crm.leads:read' }) } };
    expect(await guard.canActivate(makeCtx(req, FakeCtrl.prototype.read))).toBe(true);
    expect(req.bassanCrm?.sub).toBe('u1');
  });

  it('denies (403) when the token lacks the required write permission', async () => {
    const req: any = { headers: { 'x-bassan-crm-token': 'Bearer ' + token({ scope: 'crm.leads:read' }) } };
    await expect(guard.canActivate(makeCtx(req, FakeCtrl.prototype.write))).rejects.toThrow(ForbiddenException);
  });

  it('denies (401) when the signature is invalid (tampered)', async () => {
    const t = token({ scope: 'crm.leads:read' });
    const parts = t.split('.');
    parts[2] = Buffer.from('forged').toString('base64url');
    const req: any = { headers: { 'x-bassan-crm-token': 'Bearer ' + parts.join('.') } };
    await expect(guard.canActivate(makeCtx(req, FakeCtrl.prototype.read))).rejects.toThrow(UnauthorizedException);
  });

  it('denies (401) on wrong audience', async () => {
    const req: any = { headers: { 'x-bassan-crm-token': 'Bearer ' + token({ aud: 'urn:other' }) } };
    await expect(guard.canActivate(makeCtx(req, FakeCtrl.prototype.read))).rejects.toThrow(UnauthorizedException);
  });

  it('denies (401) on wrong issuer', async () => {
    const req: any = { headers: { 'x-bassan-crm-token': 'Bearer ' + token({ iss: 'https://evil.example' }) } };
    await expect(guard.canActivate(makeCtx(req, FakeCtrl.prototype.read))).rejects.toThrow(UnauthorizedException);
  });

  it('denies (401) on expired token', async () => {
    const req: any = { headers: { 'x-bassan-crm-token': 'Bearer ' + token({ exp: Math.floor(Date.now() / 1000) - 10 }) } };
    await expect(guard.canActivate(makeCtx(req, FakeCtrl.prototype.read))).rejects.toThrow(UnauthorizedException);
  });

  it('rejects alg downgrade (non-RS256) — fail-closed', async () => {
    const req: any = { headers: { 'x-bassan-crm-token': 'Bearer ' + signWithAlg('none', { iss: ISS, aud: AUD, sub: 'u1', exp: Math.floor(Date.now() / 1000) + 3600, scope: 'crm.leads:read' }, pair.privateKey) } };
    await expect(guard.canActivate(makeCtx(req, FakeCtrl.prototype.read))).rejects.toThrow(UnauthorizedException);
  });

  it('rejects alg confusion (HS256 header on an RS256-only verifier) — fail-closed', async () => {
    const req: any = { headers: { 'x-bassan-crm-token': 'Bearer ' + signWithAlg('HS256', { iss: ISS, aud: AUD, sub: 'u1', exp: Math.floor(Date.now() / 1000) + 3600, scope: 'crm.leads:read' }, pair.privateKey) } };
    await expect(guard.canActivate(makeCtx(req, FakeCtrl.prototype.read))).rejects.toThrow(UnauthorizedException);
  });

  it('grants an Admin/superuser even without the scope claim (Bassan permissions.guard.ts L72-74 parity)', async () => {
    const req: any = { headers: { 'x-bassan-crm-token': 'Bearer ' + token({ role: 'Admin' }) } };
    expect(await guard.canActivate(makeCtx(req, FakeCtrl.prototype.write))).toBe(true);
  });

  it('still enforces auth for Admins: an expired Admin token is denied (bypass is scope-only)', async () => {
    const req: any = {
      headers: {
        'x-bassan-crm-token':
          'Bearer ' + token({ role: 'Admin', exp: Math.floor(Date.now() / 1000) - 10 }),
      },
    };
    await expect(guard.canActivate(makeCtx(req, FakeCtrl.prototype.write))).rejects.toThrow(UnauthorizedException);
  });

  it('denies (401) when the Bassan CRM token header is missing', async () => {
    const req: any = { headers: {} };
    await expect(guard.canActivate(makeCtx(req, FakeCtrl.prototype.read))).rejects.toThrow(UnauthorizedException);
  });
});
