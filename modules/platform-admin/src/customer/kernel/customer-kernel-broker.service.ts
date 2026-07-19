import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { assertCustomerEndpointAllowed } from '../../core-adapter/core.contract.assert';
import { CustomerKernelException } from '../errors/customer-kernel.exception';

/**
 * CustomerKernelBrokerService — the ONLY component that calls Core on behalf of a
 * Workspace request (Contract B §3.2 / §5.2).
 *
 *  - loginUser(): calls Core POST /api/v1/auth/login (Core owns user auth, Contract A §6.2).
 *    Returns the Core user-scoped accessToken. That token is stored server-side by
 *    CustomerSessionService and NEVER returned to the Workspace.
 *  - Future user-scoped Kernel calls (ERP / Helpdesk / ...) reuse the stored Core token.
 *
 * Security (Contract B Stop Rules / ARCHITECTURAL_LAWS LAW-5 / ADR-016 D3-D4):
 *  - NEVER log the Core token (or any token) — not even partially.
 *  - NEVER return the Core token to the client.
 *  - Runtime-assert (every call) that only customer-authorized endpoints are called,
 *    reusing the canonical allowlist in core.contract.assert (ADR-016 D4 consolidation).
 *  - Failures surface as the typed CustomerKernelException (→ 502 CUSTOMER_KERNEL_ERROR,
 *    generic message). No raw upstream error/stack ever leaves the broker.
 */

@Injectable()
export class CustomerKernelBrokerService {
  private readonly logger = new Logger(CustomerKernelBrokerService.name);
  private readonly coreBaseUrl: string;

  constructor() {
    this.coreBaseUrl = process.env.CORE_API_BASE_URL || '';
    if (!this.coreBaseUrl) {
      throw new Error('CORE_API_BASE_URL is not configured');
    }
  }

  async loginUser(email: string, password: string): Promise<string> {
    // RUNTIME CONTRACT ASSERTION: only customer-authorized Core endpoints (ADR-016 D4).
    assertCustomerEndpointAllowed('POST', '/api/v1/auth/login');

    // Suite-side request correlation id (c-<uuid> per Spec §4.1 / §6); also X-Correlation-Id to Core.
    const correlationId = `c-${randomUUID()}`;
    const url = `${this.coreBaseUrl}/api/v1/auth/login`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Correlation-Id': correlationId,
        },
        body: JSON.stringify({ email, password }),
        signal: AbortSignal.timeout(10000),
      });

      if (res.ok) {
        const data = (await res.json()) as any;
        const token = data?.accessToken;
        if (!token) {
          this.logger.error({ message: 'Customer kernel login returned no accessToken', correlationId, email });
          throw new CustomerKernelException('login-no-token');
        }
        // SAFE: no token in log
        this.logger.log({
          message: 'Customer kernel login succeeded',
          correlationId,
          email,
        });
        return token;
      }

      if (res.status === 401 || res.status === 403) {
        this.logger.warn({
          message: 'Customer kernel auth failed',
          correlationId,
          email,
          status: res.status,
        });
        throw new UnauthorizedException('Invalid credentials');
      }

      this.logger.error({
        message: 'Customer kernel login error',
        correlationId,
        email,
        status: res.status,
      });
      throw new CustomerKernelException('login-http');
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof CustomerKernelException) {
        throw error;
      }
      // Network / timeout — never forward the raw error object; generic typed error.
      this.logger.error({
        message: 'Customer kernel login network error',
        correlationId,
        email,
        errorCode: 'CUSTOMER_KERNEL_FAILED',
      });
      throw new CustomerKernelException('login-network');
    }
  }
}
