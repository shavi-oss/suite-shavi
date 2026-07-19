import { CustomerKernelException } from '../../../../src/customer/kernel/customer-kernel.exception';
import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * CustomerKernelException — the typed exception the broker MUST throw on Kernel
 * (Core) failures so the global error filter (G3 / t_bd6b701a) maps it to the
 * CUSTOMER_KERNEL_ERROR (502) envelope without leaking tokens or raw upstream errors.
 */
describe('CustomerKernelException', () => {
  it('is an HttpException carrying HTTP 502 (BAD_GATEWAY)', () => {
    const e = new CustomerKernelException('Upstream service unavailable');
    expect(e).toBeInstanceOf(HttpException);
    expect(e.getStatus()).toBe(HttpStatus.BAD_GATEWAY);
  });

  it('carries a safe, generic message (no token / PII / raw upstream text)', () => {
    const token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.corebody.signature';
    const e = new CustomerKernelException('Upstream service unavailable');
    expect(typeof e.message).toBe('string');
    expect(e.message).not.toContain(token);
    expect(e.message).not.toMatch(/eyJ|Bearer|accessToken/i);
  });
});
