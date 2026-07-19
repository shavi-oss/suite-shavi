import { CustomerKernelException } from '../../../../src/customer/errors/customer-kernel.exception';

/**
 * CustomerKernelException — the TYPED error the broker MUST throw on Kernel (Core)
 * failures so the global customer error filter (G1 / t_bd6b701a) maps it to the
 * CUSTOMER_KERNEL_ERROR (502) envelope WITHOUT leaking tokens or raw upstream errors.
 *
 * Design (ADR-016 D3): extends the plain Error (not HttpException) so it is a
 * distinct, recognizable type the filter branches on, while carrying ONLY a safe
 * `operation` label — never the Core token, raw upstream error text, or stack.
 */
describe('CustomerKernelException', () => {
  it('is a typed Error (distinct from HttpException) carrying a safe operation label', () => {
    const e = new CustomerKernelException('login-network');
    expect(e).toBeInstanceOf(Error);
    expect(e).toBeInstanceOf(CustomerKernelException);
    // Not an HttpException: the filter owns the 502 mapping explicitly.
    expect((e as any).getStatus).toBeUndefined();
    expect(e.operation).toBe('login-network');
  });

  it('carries a safe, generic message (no token / PII / raw upstream text)', () => {
    const token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.payload.sig';
    const e = new CustomerKernelException('login-http');
    expect(typeof e.message).toBe('string');
    expect(e.message).not.toContain(token);
    expect(e.message).not.toMatch(/eyJ|Bearer|accessToken|password|email/i);
  });
});
