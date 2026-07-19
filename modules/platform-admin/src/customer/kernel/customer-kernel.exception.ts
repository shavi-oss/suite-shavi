import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * CustomerKernelException — the TYPED exception the Customer Kernel Broker MUST throw
 * on any Core (Kernel) failure (5xx / network / malformed response).
 *
 * Why typed (ADR-016 D3 / SPEC §2.3): the global customer error filter (G3 /
 * t_bd6b701a) maps this class to the CUSTOMER_KERNEL_ERROR (502) envelope with a
 * generic message. A bare `Error` would instead map to CUSTOMER_INTERNAL and could
 * leak raw upstream context into the handler path.
 *
 * Contract B Stop Rules / CONFLICT_RULES #6: instances MUST carry ONLY safe,
 * generic messages — never a token, PII, or the raw upstream error text.
 */
export class CustomerKernelException extends HttpException {
  constructor(message = 'Upstream service unavailable') {
    super(message, HttpStatus.BAD_GATEWAY);
  }
}
