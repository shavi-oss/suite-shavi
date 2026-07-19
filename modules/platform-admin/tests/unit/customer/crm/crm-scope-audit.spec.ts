import { Reflector } from '@nestjs/core';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { generateKeyPairSync, createSign } from 'crypto';
import { CrmScopeGuard, RequireCrmScope } from '../../../../src/customer/auth/bassan-crm/crm-scope.guard';
import { BassanCrmAuditSink } from '../../../../src/customer/auth/bassan-crm/bassan-crm-audit';
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

const ISS = 'https://bassan.example';
const AUD = 'urn:shavi:crm';

class FakeCtrl {
  @RequireCrmScope('crm.leads:read') read() {}
  @RequireCrmScope('crm.leads:write') write() {}
}

function makeCtx(req: any, handler: any) {
  return {
    switchToHttp: () => ({ getRequest: () => req }),
    getHandler: () => handler,
    getClass: () => FakeCtrl,
  } as any;
}

/**
 * Contract A §16 — every crm.* decision from CrmScopeGuard must be emitted to
 * Bassan Kernel central audit, fire-and-forget, fail-closed.
 */
describe('CrmScopeGuard — central audit emission (Contract A §16)', () => {
  let pair: { privateKey: string; publicKey: string };
  let guard: CrmScopeGuard;
  let sink: { emitCrmDecision: jest.Mock };

  const token = (overrides: Record<string, unknown> = {}) =>
    signRs256(
      { alg: 'RS256', typ: 'JWT' },
      { iss: ISS, aud: AUD, sub: 'u1', exp: Math.floor(Date.now() / 1000) + 3600, ...overrides },
      pair.privateKey,
    );

  beforeEach(() => {
    pair = makeRsaPair();
    const verifier = new BassanCrmJwtVerifier(
      new StaticBassanKeyProvider(pair.publicKey),
      { issuer: ISS, audience: AUD },
    );
    sink = { emitCrmDecision: jest.fn().mockResolvedValue(undefined) };
    guard = new CrmScopeGuard(new Reflector(), verifier, sink as unknown as BassanCrmAuditSink);
  });

  it('emits an allow decision carrying the verified subject', async () => {
    const req: any = { headers: { 'x-bassan-crm-token': 'Bearer ' + token({ scope: 'crm.leads:read' }) } };
    expect(await guard.canActivate(makeCtx(req, FakeCtrl.prototype.read))).toBe(true);
    expect(sink.emitCrmDecision).toHaveBeenCalledTimes(1);
    const evt = sink.emitCrmDecision.mock.calls[0][0];
    expect(evt.decision).toBe('allow');
    expect(evt.outcome).toBe('allowed');
    expect(evt.granted).toBe(true);
    expect(evt.actor.subject).toBe('u1');
    expect(evt.actor.isAdminBypass).toBe(false);
    expect(evt.requiredPermission).toBe('crm.leads:read');
  });

  it('emits an admin_bypass decision for an Admin superuser', async () => {
    const req: any = { headers: { 'x-bassan-crm-token': 'Bearer ' + token({ role: 'Admin' }) } };
    expect(await guard.canActivate(makeCtx(req, FakeCtrl.prototype.write))).toBe(true);
    const evt = sink.emitCrmDecision.mock.calls[0][0];
    expect(evt.decision).toBe('admin_bypass');
    expect(evt.outcome).toBe('bypass_granted');
    expect(evt.granted).toBe(true);
    expect(evt.actor.isAdminBypass).toBe(true);
    expect(evt.metadata.rule).toBe('CRM_ADMIN_BYPASS');
    expect(evt.metadata.bypassReason).toBe('crm-admin-superuser-parity');
  });

  it('emits deny_403/forbidden on scope miss and STILL throws 403', async () => {
    const req: any = { headers: { 'x-bassan-crm-token': 'Bearer ' + token({ scope: 'crm.leads:read' }) } };
    await expect(guard.canActivate(makeCtx(req, FakeCtrl.prototype.write))).rejects.toThrow(ForbiddenException);
    const evt = sink.emitCrmDecision.mock.calls[0][0];
    expect(evt.decision).toBe('deny_403');
    expect(evt.outcome).toBe('forbidden');
    expect(evt.granted).toBe(false);
    expect(evt.actor.subject).toBe('u1');
    expect(evt.metadata.rule).toBe('CRM_SCOPE_DENIED');
  });

  it('emits deny_403/unauthorized+anonymous on missing token and STILL throws 401', async () => {
    const req: any = { headers: {} };
    await expect(guard.canActivate(makeCtx(req, FakeCtrl.prototype.read))).rejects.toThrow(UnauthorizedException);
    const evt = sink.emitCrmDecision.mock.calls[0][0];
    expect(evt.decision).toBe('deny_403');
    expect(evt.outcome).toBe('unauthorized');
    expect(evt.actor.subject).toBe('anonymous');
    expect(evt.metadata.rule).toBe('CRM_TOKEN_MISSING');
  });

  it('emits CRM_SCOPE_MISSING deny when the route has no @RequireCrmScope', async () => {
    const ctx = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: { 'x-bassan-crm-token': 'Bearer ' + token() } }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as any;
    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
    const evt = sink.emitCrmDecision.mock.calls[0][0];
    expect(evt.metadata.rule).toBe('CRM_SCOPE_MISSING');
    expect(evt.requiredPermission).toBe('crm:*');
  });

  // ---- FAIL-CLOSED GUARANTEES (Contract A §16.5) ----
  it('FAIL-CLOSED: audit emit rejection MUST NOT flip allow→deny (still allows)', async () => {
    sink.emitCrmDecision.mockRejectedValueOnce(new Error('audit down'));
    const req: any = { headers: { 'x-bassan-crm-token': 'Bearer ' + token({ scope: 'crm.leads:read' }) } };
    await expect(guard.canActivate(makeCtx(req, FakeCtrl.prototype.read))).resolves.toBe(true);
    expect(sink.emitCrmDecision).toHaveBeenCalledTimes(1);
  });

  it('FAIL-CLOSED: audit emit rejection MUST NOT flip deny→allow (still 403)', async () => {
    sink.emitCrmDecision.mockRejectedValueOnce(new Error('audit down'));
    const req: any = { headers: { 'x-bassan-crm-token': 'Bearer ' + token({ scope: 'crm.leads:read' }) } };
    await expect(guard.canActivate(makeCtx(req, FakeCtrl.prototype.write))).rejects.toThrow(ForbiddenException);
    expect(sink.emitCrmDecision).toHaveBeenCalledTimes(1);
  });

  it('FAIL-CLOSED: audit emit rejection MUST NOT surface to the client (guard resolves)', async () => {
    sink.emitCrmDecision.mockRejectedValueOnce(new Error('audit down'));
    const req: any = { headers: { 'x-bassan-crm-token': 'Bearer ' + token({ scope: 'crm.leads:read' }) } };
    await expect(guard.canActivate(makeCtx(req, FakeCtrl.prototype.read))).resolves.toBe(true);
  });

  it('fire-and-forget: the guard does NOT await the audit emit', async () => {
    let emitResolved = false;
    sink.emitCrmDecision.mockImplementationOnce(async () => {
      await new Promise((r) => setTimeout(r, 50));
      emitResolved = true;
    });
    const req: any = { headers: { 'x-bassan-crm-token': 'Bearer ' + token({ scope: 'crm.leads:read' }) } };
    const result = await guard.canActivate(makeCtx(req, FakeCtrl.prototype.read));
    expect(result).toBe(true);
    // The auth decision returned before the (slow) fire-and-forget emit finished.
    expect(emitResolved).toBe(false);
  });
});
