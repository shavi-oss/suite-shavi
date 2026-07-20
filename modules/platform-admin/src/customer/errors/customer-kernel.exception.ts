/**
 * CustomerKernelException — typed error thrown by the Customer Kernel broker
 * (CustomerKernelBrokerService) when a Bassan Core (Kernel) call fails:
 * network error, timeout, or 5xx.
 *
 * Security (Contract B Stop Rules / ADR-016 D3):
 *  - Carries ONLY a safe operation label (e.g. 'login', 'login-network').
 *  - NEVER carries the Core token, raw upstream error.message, or stack.
 *  - The AllExceptionsFilter maps this to 502 CUSTOMER_KERNEL_ERROR with a
 *    GENERIC message — the real cause stays server-side in the safe log.
 */
export class CustomerKernelException extends Error {
  public readonly operation: string;

  constructor(operation: string) {
    super(`Customer kernel operation failed: ${operation}`);
    this.name = 'CustomerKernelException';
    this.operation = operation;
    // Restore prototype chain (TS extending built-ins quirk).
    Object.setPrototypeOf(this, CustomerKernelException.prototype);
  }
}
