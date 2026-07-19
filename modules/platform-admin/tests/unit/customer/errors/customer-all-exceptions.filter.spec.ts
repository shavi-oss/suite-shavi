/**
 * Unit test for the standardized Customer Gateway error envelope (Spec §4.1 / ADR-016 D3).
 * The filter is exercised directly with a mock ArgumentsHost so we can assert the exact
 * envelope shape and — critically — that NO token / PII / raw upstream error / stack
 * ever reaches the response body or the logs.
 */
import { ArgumentsHost } from '@nestjs/common';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { CustomerAllExceptionsFilter } from '../../../../src/customer/errors/customer-all-exceptions.filter';
import { CustomerKernelException } from '../../../../src/customer/errors/customer-kernel.exception';

const TOKEN = 'eyJhbG...ibe';

function runFilter(
  exception: unknown,
  req: any = { method: 'POST', url: '/api/customer/v1/auth/session' },
): any {
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
      getRequest: () => req,
    }),
  } as any;
  new CustomerAllExceptionsFilter().catch(exception, host);
  return res;
}

describe('CustomerAllExceptionsFilter — envelope mapping', () => {
  it('maps UnauthorizedException -> 401 CUSTOMER_UNAUTHORIZED (safe message)', () => {
    const res = runFilter(new UnauthorizedException('Missing customer session token'));
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({
      error: {
        code: 'CUSTOMER_UNAUTHORIZED',
        message: 'Missing customer session token',
        requestId: expect.stringMatching(/^c-[0-9a-f-]+$/),
        details: null,
      },
    });
  });

  it('maps ForbiddenException -> 403 CUSTOMER_FORBIDDEN', () => {
    const res = runFilter(new ForbiddenException('Missing crm permission: crm.leads:read'));
    expect(res.statusCode).toBe(403);
    expect(res.body.error.code).toBe('CUSTOMER_FORBIDDEN');
    expect(res.body.error.message).toBe('Missing crm permission: crm.leads:read');
  });

  it('maps ValidationPipe BadRequestException -> 400 CUSTOMER_BAD_REQUEST + details', () => {
    const res = runFilter(
      new BadRequestException({
        statusCode: 400,
        message: ['email must be an email', 'password must be longer than or equal to 8 characters'],
        error: 'Bad Request',
      }),
    );
    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe('CUSTOMER_BAD_REQUEST');
    expect(res.body.error.message).toBe('Validation failed');
    expect(res.body.error.details).toEqual([
      { field: 'email', message: 'must be an email' },
      { field: 'password', message: 'must be longer than or equal to 8 characters' },
    ]);
  });

  it('maps NotFoundException -> 404 CUSTOMER_NOT_FOUND', () => {
    const res = runFilter(new NotFoundException('Resource not found'));
    expect(res.statusCode).toBe(404);
    expect(res.body.error.code).toBe('CUSTOMER_NOT_FOUND');
  });

  it('maps ConflictException -> 409 CUSTOMER_CONFLICT', () => {
    const res = runFilter(new ConflictException('Resource already exists'));
    expect(res.statusCode).toBe(409);
    expect(res.body.error.code).toBe('CUSTOMER_CONFLICT');
  });

  it('maps CustomerKernelException -> 502 CUSTOMER_KERNEL_ERROR (GENERIC message, never the operation)', () => {
    const res = runFilter(new CustomerKernelException('login-network'));
    expect(res.statusCode).toBe(502);
    expect(res.body.error.code).toBe('CUSTOMER_KERNEL_ERROR');
    expect(res.body.error.message).toBe('Upstream service unavailable');
    expect(res.body.error.message).not.toContain('login-network');
    expect(res.body.error.details).toBeNull();
  });

  it('maps an unknown/bare Error -> 500 CUSTOMER_INTERNAL with a GENERIC message (no leak)', () => {
    const res = runFilter(new Error(`unexpected boom with token ${TOKEN}`));
    expect(res.statusCode).toBe(500);
    expect(res.body.error.code).toBe('CUSTOMER_INTERNAL');
    expect(res.body.error.message).toBe('Internal error');
    // The raw error text (which embeds a token) must NOT surface in the body.
    expect(JSON.stringify(res.body)).not.toContain(TOKEN);
    expect(JSON.stringify(res.body)).not.toMatch(/eyJ|Bearer|accessToken/i);
  });

  it('always emits a c-<uuid> requestId', () => {
    const res = runFilter(new Error('x'));
    expect(res.body.error.requestId).toMatch(/^c-[0-9a-f-]+$/);
  });
});

describe('CustomerAllExceptionsFilter — no token / PII / stack leak (security)', () => {
  it('never logs the token or stack; only the safe error code + operation', () => {
    const errSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    try {
      runFilter(new CustomerKernelException('login-network'), {
        method: 'POST',
        url: '/api/customer/v1/auth/session',
        headers: { authorization: `Bearer ${TOKEN}` },
      });
      const logged = errSpy.mock.calls.map((c) => JSON.stringify(c[0])).join('|');
      expect(logged).not.toContain(TOKEN);
      expect(logged).not.toMatch(/eyJ|Bearer|accessToken/i);
      // The safe operation label IS allowed in the log (not a secret).
      expect(logged).toContain('login-network');
      expect(logged).toContain('CUSTOMER_KERNEL_ERROR');
    } finally {
      errSpy.mockRestore();
    }
  });

  it('body + log contain no stack trace markers', () => {
    const errSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    try {
      const res = runFilter(new Error('boom'));
      const logged = errSpy.mock.calls.map((c) => JSON.stringify(c[0])).join('|');
      expect(JSON.stringify(res.body)).not.toContain('    at ');
      expect(logged).not.toContain('    at ');
    } finally {
      errSpy.mockRestore();
    }
  });
});
