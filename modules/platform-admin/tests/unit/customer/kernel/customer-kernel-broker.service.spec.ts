import { Logger } from '@nestjs/common';
import { CustomerKernelBrokerService } from '../../../../src/customer/kernel/customer-kernel-broker.service';
import { CustomerKernelException } from '../../../../src/customer/kernel/customer-kernel.exception';
import { UnauthorizedException } from '@nestjs/common';
import * as coreAssert from '../../../../src/core-adapter/core.contract.assert';

/**
 * G2 acceptance (SPEC_AUTH_BROKER_TENANT_ERROR §8 / ADR-016 D4):
 *  - The broker throws the TYPED CustomerKernelException (not a bare Error) on any
 *    Kernel (Core) 5xx / network / malformed response, so the error filter maps it
 *    to CUSTOMER_KERNEL_ERROR (502) with a generic message.
 *  - The broker MUST route every Core call through the CANONICAL allowlist assertion
 *    in core.contract.assert.ts (customer subset) — no private copy (drift fix).
 *  - The Core (Kernel) token is NEVER logged.
 */
function jsonResponse(status: number, body: any) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as any;
}

describe('CustomerKernelBrokerService', () => {
  let fetchSpy: jest.Mock;
  let assertSpy: jest.SpyInstance;
  let logSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;
  let errSpy: jest.SpyInstance;

  beforeAll(() => {
    process.env.CORE_API_BASE_URL = 'http://core.test';
  });

  beforeEach(() => {
    fetchSpy = jest.fn();
    (global as any).fetch = fetchSpy;
    assertSpy = jest.spyOn(coreAssert, 'assertCustomerEndpointAllowed');
    logSpy = jest.spyOn(Logger.prototype, 'log');
    warnSpy = jest.spyOn(Logger.prototype, 'warn');
    errSpy = jest.spyOn(Logger.prototype, 'error');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns the Core accessToken on 200 OK', async () => {
    fetchSpy.mockResolvedValue(jsonResponse(200, { accessToken: 'core.jwt.token' }));
    const broker = new CustomerKernelBrokerService();
    const token = await broker.loginUser('a@b.c', 'pw');
    expect(token).toBe('core.jwt.token');
  });

  it('throws CustomerKernelException (502) on Core 5xx', async () => {
    fetchSpy.mockResolvedValue(jsonResponse(502, { message: 'boom' }));
    const broker = new CustomerKernelBrokerService();
    await expect(broker.loginUser('a@b.c', 'pw')).rejects.toBeInstanceOf(CustomerKernelException);
  });

  it('throws CustomerKernelException (502) on network error', async () => {
    fetchSpy.mockRejectedValue(new Error('ECONNREFUSED'));
    const broker = new CustomerKernelBrokerService();
    await expect(broker.loginUser('a@b.c', 'pw')).rejects.toBeInstanceOf(CustomerKernelException);
  });

  it('throws CustomerKernelException when Core returns no accessToken', async () => {
    fetchSpy.mockResolvedValue(jsonResponse(200, { foo: 'bar' }));
    const broker = new CustomerKernelBrokerService();
    await expect(broker.loginUser('a@b.c', 'pw')).rejects.toBeInstanceOf(CustomerKernelException);
  });

  it('throws UnauthorizedException (401) on Core 401/403 — invalid credentials', async () => {
    fetchSpy.mockResolvedValue(jsonResponse(401, { message: 'no' }));
    const broker = new CustomerKernelBrokerService();
    await expect(broker.loginUser('a@b.c', 'pw')).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('routes the Core call through the CANONICAL allowlist assertion (D4 consolidation)', async () => {
    fetchSpy.mockResolvedValue(jsonResponse(200, { accessToken: 't' }));
    const broker = new CustomerKernelBrokerService();
    await broker.loginUser('a@b.c', 'pw');
    expect(assertSpy).toHaveBeenCalledWith('POST', '/api/v1/auth/login');
  });

  it('NEVER logs the Core token (Contract B Stop Rules / CONFLICT_RULES #6)', async () => {
    const SECRET = 'SUPER_SECRET_CORE_TOKEN_SHOULD_NOT_APPEAR_IN_LOGS';
    fetchSpy.mockResolvedValue(jsonResponse(200, { accessToken: SECRET }));
    const broker = new CustomerKernelBrokerService();
    await broker.loginUser('a@b.c', 'pw');
    const allArgs = [
      ...logSpy.mock.calls,
      ...warnSpy.mock.calls,
      ...errSpy.mock.calls,
    ]
      .map((c) => JSON.stringify(c))
      .join('|');
    expect(allArgs).not.toContain(SECRET);
  });
});
