/**
 * Security regression gate: the Customer Gateway error envelope (ADR-016 D3) must
 * NEVER leak tokens, secrets, PII, or stack traces — into either the HTTP response
 * body or the server logs. This is the explicit "log-leak" gate required by the G1
 * acceptance criteria (SPEC_AUTH_BROKER_TENANT_ERROR §8).
 *
 * It covers both the response envelope and the structured log line emitted by
 * CustomerAllExceptionsFilter.
 */
import { ArgumentsHost } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { CustomerAllExceptionsFilter } from '../../../src/customer/errors/customer-all-exceptions.filter';
import { CustomerKernelException } from '../../../src/customer/errors/customer-kernel.exception';

// A realistic "worst case" upstream error string that an attacker would love to see
// reflected back: a Core JWT, a Bearer token, an email, and a password.
const LEAKY =
  'Error: upstream 502 from Core eyJhbGciOiJIUzI1Ni.very.secret.signature ' +
  'Bearer cust-abc password=Sup3rSecret! email=victim@org.com\n' +
  '    at CoreClient.call (/app/core.client.ts:42:11)';

function runFilter(exception: unknown): { body: any; logged: string } {
  const res: any = {
    statusCode: 0,
    body: null,
    status(c: number) {
      this.statusCode = c;
      return this;
    },
    json(b: any) {
      this.body = b;
      return this;
    },
  };
  const host: ArgumentsHost = {
    switchToHttp: () => ({
      getResponse: () => res,
      getRequest: () => ({ method: 'POST', url: '/api/customer/v1/auth/session' }),
    }),
  } as any;

  const errSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  try {
    new CustomerAllExceptionsFilter().catch(exception, host);
  } finally {
    // noop
  }
  const logged = errSpy.mock.calls.map((c) => JSON.stringify(c[0])).join('|');
  errSpy.mockRestore();
  return { body: res.body, logged };
}

describe('Customer Gateway - Error envelope log-leak gate', () => {
  it('a raw upstream error (502 from Core) is reduced to a GENERIC 502 envelope', () => {
    const { body } = runFilter(new Error(LEAKY));
    expect(body.error.code).toBe('CUSTOMER_INTERNAL');
    expect(body.error.message).toBe('Internal error');
    expect(JSON.stringify(body)).not.toContain('eyJ');
    expect(JSON.stringify(body)).not.toContain('Bearer');
    expect(JSON.stringify(body)).not.toContain('Sup3rSecret');
    expect(JSON.stringify(body)).not.toContain('victim@org.com');
    expect(JSON.stringify(body)).not.toContain('    at ');
  });

  it('the structured log line also contains NO token / PII / stack', () => {
    const { logged } = runFilter(new Error(LEAKY));
    expect(logged).not.toContain('eyJ');
    expect(logged).not.toContain('Bearer');
    expect(logged).not.toContain('Sup3rSecret');
    expect(logged).not.toContain('victim@org.com');
    expect(logged).not.toContain('    at ');
  });

  it('a CustomerKernelException never exposes operation internals to the client', () => {
    const { body, logged } = runFilter(new CustomerKernelException('login-network'));
    expect(body.error.code).toBe('CUSTOMER_KERNEL_ERROR');
    expect(body.error.message).toBe('Upstream service unavailable');
    expect(JSON.stringify(body)).not.toContain('login-network');
    // The operation label is allowed server-side (not a secret) but never in the body.
    expect(logged).toContain('login-network');
  });

  it('envelope always carries a c-<uuid> requestId and a null details for generic errors', () => {
    const { body } = runFilter(new Error(LEAKY));
    expect(body.error.requestId).toMatch(/^c-[0-9a-f-]+$/);
    expect(body.error.details).toBeNull();
  });
});
