import { ArgumentsHost } from '@nestjs/common';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CustomerAllExceptionsFilter } from '../../../../src/customer/errors/customer-all-exceptions.filter';
import { CustomerKernelException } from '../../../../src/customer/errors/customer-kernel.exception';

/**
 * Unit test for the customer-scoped error envelope (ADR-016 D3):
 *  - maps every relevant exception type to the standardized CUSTOMER_* code + status
 *  - CustomerKernelException -> 502 with a GENERIC message (operation is server-side only)
 *  - unknown Error -> 500 with a GENERIC message (raw error text never surfaces)
 *  - NO token / PII / raw-upstream / stack ever appears in the response OR the log
 *    (Contract B Stop Rules / CONFLICT_RULES #6).
 */

function makeHost(method: string, url: string): { host: ArgumentsHost; jsonMock: jest.Mock; statusMock: jest.Mock } {
  const jsonMock = jest.fn();
  const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
  const resMock = { status: statusMock, json: jsonMock } as any;
  const reqMock = { method, url, headers: {} } as any;
  const host = {
    switchToHttp: () => ({
      getRequest: () => reqMock,
      getResponse: () => resMock,
    }),
  } as unknown as ArgumentsHost;
  return { host, jsonMock, statusMock };
}

describe('CustomerAllExceptionsFilter — standardized envelope (ADR-016 D3)', () => {
  let errSpy: jest.SpyInstance;

  beforeEach(() => {
    errSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('maps UnauthorizedException -> 401 CUSTOMER_UNAUTHORIZED', () => {
    const { host, jsonMock, statusMock } = makeHost('GET', '/api/customer/v1/me');
    new CustomerAllExceptionsFilter().catch(new UnauthorizedException(), host);
    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.objectContaining({ code: 'CUSTOMER_UNAUTHORIZED' }) }),
    );
  });

  it('maps BadRequestException -> 400 CUSTOMER_BAD_REQUEST', () => {
    const { host, jsonMock, statusMock } = makeHost('POST', '/api/customer/v1/auth/session');
    new CustomerAllExceptionsFilter().catch(new BadRequestException('bad'), host);
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.objectContaining({ code: 'CUSTOMER_BAD_REQUEST' }) }),
    );
  });

  it('maps ForbiddenException -> 403 CUSTOMER_FORBIDDEN', () => {
    const { host, jsonMock, statusMock } = makeHost('GET', '/api/customer/v1/crm/contacts');
    new CustomerAllExceptionsFilter().catch(new ForbiddenException(), host);
    expect(statusMock).toHaveBeenCalledWith(403);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.objectContaining({ code: 'CUSTOMER_FORBIDDEN' }) }),
    );
  });

  it('maps NotFoundException -> 404 CUSTOMER_NOT_FOUND', () => {
    const { host, jsonMock, statusMock } = makeHost('GET', '/api/customer/v1/crm/contacts');
    new CustomerAllExceptionsFilter().catch(new NotFoundException(), host);
    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.objectContaining({ code: 'CUSTOMER_NOT_FOUND' }) }),
    );
  });

  it('maps ConflictException -> 409 CUSTOMER_CONFLICT', () => {
    const { host, jsonMock, statusMock } = makeHost('POST', '/api/customer/v1/crm/contacts');
    new CustomerAllExceptionsFilter().catch(new ConflictException(), host);
    expect(statusMock).toHaveBeenCalledWith(409);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.objectContaining({ code: 'CUSTOMER_CONFLICT' }) }),
    );
  });

  it('maps CustomerKernelException -> 502 CUSTOMER_KERNEL_ERROR with a GENERIC message (operation stays server-side)', () => {
    const { host, jsonMock, statusMock } = makeHost('POST', '/api/customer/v1/auth/session');
    new CustomerAllExceptionsFilter().catch(new CustomerKernelException('login-network'), host);
    expect(statusMock).toHaveBeenCalledWith(502);
    const body = jsonMock.mock.calls[0][0];
    expect(body.error.code).toBe('CUSTOMER_KERNEL_ERROR');
    expect(body.error.message).toBe('Upstream service unavailable');
    // The safe operation label must NOT leak into the client response body.
    expect(JSON.stringify(body)).not.toContain('login-network');
  });

  it('maps an unknown Error -> 500 CUSTOMER_INTERNAL with a GENERIC message (raw text never surfaces)', () => {
    const { host, jsonMock, statusMock } = makeHost('GET', '/api/customer/v1/me');
    const raw = new Error('DB password=SUPER_SECRET raw upstream stack trace');
    new CustomerAllExceptionsFilter().catch(raw, host);
    expect(statusMock).toHaveBeenCalledWith(500);
    const body = jsonMock.mock.calls[0][0];
    expect(body.error.code).toBe('CUSTOMER_INTERNAL');
    expect(body.error.message).toBe('Internal error');
    expect(JSON.stringify(body)).not.toContain('SUPER_SECRET');
    expect(JSON.stringify(body)).not.toContain('raw upstream');
  });

  describe('no secret leakage (CONFLICT_RULES #6) — response AND log', () => {
    const FAKE_CORE_TOKEN = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.fake.core.token';

    it('CustomerKernelException: response + log contain no token/PII/stack', () => {
      const { host, jsonMock } = makeHost('POST', '/api/customer/v1/auth/session');
      // Even if a token were somehow attached to the exception, it must not surface.
      const ex = Object.assign(new CustomerKernelException('login-network'), { token: FAKE_CORE_TOKEN });
      new CustomerAllExceptionsFilter().catch(ex, host);

      const respText = JSON.stringify(jsonMock.mock.calls[0][0]).toLowerCase();
      expect(respText).not.toContain('bearer');
      expect(respText).not.toContain('eyj');
      expect(respText).not.toContain('accesstoken');

      const logText = JSON.stringify(errSpy.mock.calls[0][0]).toLowerCase();
      expect(logText).not.toContain('bearer');
      expect(logText).not.toContain('eyj');
      expect(logText).not.toContain(FAKE_CORE_TOKEN.toLowerCase());
    });

    it('unknown Error carrying a token: response + log contain no token/stack', () => {
      const { host, jsonMock } = makeHost('GET', '/api/customer/v1/me');
      const ex = Object.assign(new Error('boom'), { stack: 'FAKE_STACK_WITH_TOKEN ' + FAKE_CORE_TOKEN });
      new CustomerAllExceptionsFilter().catch(ex, host);

      const respText = JSON.stringify(jsonMock.mock.calls[0][0]).toLowerCase();
      expect(respText).not.toContain('eyj');
      expect(respText).not.toContain(FAKE_CORE_TOKEN.toLowerCase());

      const logText = JSON.stringify(errSpy.mock.calls[0][0]).toLowerCase();
      // The log envelope never includes the raw exception.message or stack.
      expect(logText).not.toContain(FAKE_CORE_TOKEN.toLowerCase());
      expect(logText).not.toContain('fake_stack_with_token');
    });
  });

  it('response envelope carries code + requestId + details; safe log carries method + path', () => {
    const { host, jsonMock } = makeHost('POST', '/api/customer/v1/auth/session');
    new CustomerAllExceptionsFilter().catch(new BadRequestException('x'), host);
    const body = jsonMock.mock.calls[0][0];
    expect(body.error.code).toBeDefined();
    expect(typeof body.error.requestId).toBe('string');
    expect(body.error.requestId.length).toBeGreaterThan(0);
    // method/path are routing context for the SAFE log ONLY — never the client body.
    expect(body.error).not.toHaveProperty('method');
    expect(body.error).not.toHaveProperty('path');
    const log = errSpy.mock.calls[0][0];
    expect(log.method).toBe('POST');
    expect(log.path).toBe('/api/customer/v1/auth/session');
  });
});
