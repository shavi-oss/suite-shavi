import { Logger } from '@nestjs/common';
import { BassanCrmAuditSink, CrmAuditEvent } from '../../../../src/customer/auth/bassan-crm/bassan-crm-audit';
import { S2sTokenService } from '../../../../src/auth/s2s-token.service';

function makeEvent(overrides: Partial<CrmAuditEvent> = {}): CrmAuditEvent {
  return {
    eventType: 'authorization.decision',
    domain: 'crm',
    decision: 'allow',
    outcome: 'allowed',
    requiredPermission: 'crm.leads:read',
    granted: true,
    source: 'shavi:crm-scope-guard',
    policyVersion: 'core-audit-emission-v1',
    correlationId: 'corr-1',
    actor: { subject: 'u1', isAdminBypass: false },
    resource: 'GET /api/customer/v1/crm/contacts',
    emittedAt: new Date().toISOString(),
    metadata: {},
    ...overrides,
  };
}

/**
 * Contract A §16 — BassanCrmAuditSink transports crm.* decisions to Kernel
 * central audit (HTTPS/S2S POST). Fail-closed: never throws, never leaks.
 */
describe('BassanCrmAuditSink — Contract A §16', () => {
  let sink: BassanCrmAuditSink;
  let s2s: { mintS2sJwt: jest.Mock };
  let fetchMock: jest.Mock;
  let errorSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;
  const originalFetch = (global as any).fetch;
  // Only touch the exact env keys we need, and restore them per-test, so we
  // never leak env state into sibling specs sharing the jest worker.
  const ENV_KEYS = [
    'CORE_API_BASE_URL',
    'PLATFORM_ADMIN_JWT_PRIVATE_KEY_PEM_B64',
    'PLATFORM_ADMIN_JWT_KID',
  ] as const;
  const savedEnv: Record<string, string | undefined> = {};

  beforeEach(() => {
    for (const k of ENV_KEYS) savedEnv[k] = process.env[k];
    process.env.CORE_API_BASE_URL = 'http://kernel.test';
    process.env.PLATFORM_ADMIN_JWT_PRIVATE_KEY_PEM_B64 = Buffer.from('dummy-key').toString('base64');
    process.env.PLATFORM_ADMIN_JWT_KID = 'kid-1';
    s2s = { mintS2sJwt: jest.fn().mockReturnValue('signed.jwt.token') };
    fetchMock = jest.fn().mockResolvedValue({ ok: true, status: 200 } as Response);
    (global as any).fetch = fetchMock;
    errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    sink = new BassanCrmAuditSink(s2s as unknown as S2sTokenService);
  });

  afterEach(() => {
    for (const k of ENV_KEYS) {
      if (savedEnv[k] === undefined) delete process.env[k];
      else process.env[k] = savedEnv[k];
    }
    (global as any).fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('mints an S2S JWT and POSTs the event to the allowlisted Kernel endpoint', async () => {
    await sink.emitCrmDecision(makeEvent());
    expect(s2s.mintS2sJwt).toHaveBeenCalledWith('shavi-audit-sink');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toBe('http://kernel.test/api/v2/admin/audit/events');
    expect(opts.method).toBe('POST');
    expect(opts.headers['Authorization']).toBe('Bearer signed.jwt.token');
    expect(opts.headers['X-Correlation-Id']).toBe('corr-1');
    expect(opts.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(opts.body)).toMatchObject({ decision: 'allow', correlationId: 'corr-1' });
  });

  it('resolves (no throw) on Kernel 401/403 — audit-pipeline fault, not auth fault', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 401 } as Response);
    await expect(sink.emitCrmDecision(makeEvent())).resolves.toBeUndefined();
    expect(errorSpy).toHaveBeenCalled();
    expect(JSON.stringify(errorSpy.mock.calls[0][0])).toContain('CRM_AUDIT_EMIT_FAILED');
  });

  it('resolves (no throw) on Kernel 5xx', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 500 } as Response);
    await expect(sink.emitCrmDecision(makeEvent())).resolves.toBeUndefined();
    expect(errorSpy).toHaveBeenCalled();
  });

  it('resolves (no throw) on network error', async () => {
    fetchMock.mockRejectedValue(new Error('ECONNREFUSED'));
    await expect(sink.emitCrmDecision(makeEvent())).resolves.toBeUndefined();
    expect(errorSpy).toHaveBeenCalled();
  });

  it('skips emission (resolves) when S2S signing material is missing', async () => {
    s2s.mintS2sJwt.mockReturnValue(null);
    await expect(sink.emitCrmDecision(makeEvent())).resolves.toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalled();
  });

  it('skips emission (resolves) when CORE_API_BASE_URL is missing', async () => {
    const saved = process.env.CORE_API_BASE_URL;
    delete process.env.CORE_API_BASE_URL;
    const localSink = new BassanCrmAuditSink(s2s as unknown as S2sTokenService);
    process.env.CORE_API_BASE_URL = saved;
    await expect(localSink.emitCrmDecision(makeEvent())).resolves.toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalled();
  });

  it('NEVER logs the JWT or PII on audit failure', async () => {
    fetchMock.mockRejectedValue(new Error('boom with secret eyJabc.def.ghi token'));
    await sink.emitCrmDecision(makeEvent());
    const logged = errorSpy.mock.calls.map((c) => JSON.stringify(c[0])).join('|');
    expect(logged).not.toContain('eyJ'); // JWT segment prefix
    expect(logged).not.toContain('Bearer'); // auth header value
    expect(logged).not.toContain('signed.jwt.token');
    expect(logged).toContain('CRM_AUDIT_EMIT_FAILED');
  });
});
