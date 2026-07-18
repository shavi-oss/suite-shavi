import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';

/**
 * CustomerKernelBrokerService — the ONLY component that calls Core on behalf of a
 * Workspace request (Contract B §3.2 / §5.2).
 *
 *  - loginUser(): calls Core POST /api/v1/auth/login (Core owns user auth, Contract A §6.2).
 *    Returns the Core user-scoped accessToken. That token is stored server-side by
 *    CustomerSessionService and NEVER returned to the Workspace.
 *  - Future user-scoped Kernel calls (ERP / Helpdesk / ...) reuse the stored Core token.
 *
 * Security (Contract B Stop Rules / ARCHITECTURAL_LAWS LAW-5):
 *  - NEVER log the Core token (or any token) — not even partially.
 *  - NEVER return the Core token to the client.
 *  - Runtime-assert that only customer-authorized endpoints are called.
 */

const CUSTOMER_ALLOWED_ENDPOINTS: Array<{ method: string; pattern: RegExp }> = [
  { method: 'POST', pattern: /^\/api\/v1\/auth\/login$/ },
  { method: 'GET', pattern: /^\/api\/v1\/organizations\/[^/]+$/ },
];

function assertCustomerEndpointAllowed(method: string, path: string): void {
  const ok = CUSTOMER_ALLOWED_ENDPOINTS.some(
    (e) => e.method === method && e.pattern.test(path),
  );
  if (!ok) {
    throw new Error(`STOP: Core endpoint not authorized for customer broker: ${method} ${path}`);
  }
}

function redact(): { errorCode: string } {
  return { errorCode: 'CUSTOMER_KERNEL_FAILED' };
}

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
    assertCustomerEndpointAllowed('POST', '/api/v1/auth/login');
    const correlationId = `cust-${Date.now()}`;
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
          throw new Error('Core login returned no accessToken');
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
      throw new Error(`Core login error: ${res.status}`);
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      this.logger.error({
        message: 'Customer kernel login network error',
        correlationId,
        email,
        errorCode: redact().errorCode,
      });
      throw new Error('Core login network error');
    }
  }
}
