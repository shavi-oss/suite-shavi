// Mock the canonical allowlist assert module so we can force a violation without
// a real Core. Only assertCustomerEndpointAllowed is used by the broker.
jest.mock('../../../../src/core-adapter/core.contract.assert');

import { CustomerKernelBrokerService } from '../../../../src/customer/kernel/customer-kernel-broker.service';
import { CustomerKernelException } from '../../../../src/customer/errors/customer-kernel.exception';
import { assertCustomerEndpointAllowed } from '../../../../src/core-adapter/core.contract.assert';

/**
 * Locks remediation nuance #7 (G1 review): assertCustomerEndpointAllowed throws a
 * bare Error on a disallowed endpoint. The broker MUST rethrow a TYPED
 * CustomerKernelException('allowlist-violation') — which the exceptions filter
 * maps to 502 CUSTOMER_KERNEL_ERROR (Spec §2.3 / ADR-016 D3) — NOT let a bare
 * Error escape to the default 500 handler.
 */
describe('CustomerKernelBrokerService — allowlist violation is typed (nuance #7)', () => {
  const mockedAssert = assertCustomerEndpointAllowed as jest.Mock;

  beforeAll(() => {
    process.env.CORE_API_BASE_URL = process.env.CORE_API_BASE_URL || 'http://localhost:9999';
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Simulate a disallowed Core endpoint (assert throws a bare STOP Error).
    mockedAssert.mockImplementation(() => {
      throw new Error('STOP: Unauthorized Core endpoint call');
    });
  });

  it('rethrows a typed CustomerKernelException (allowlist-violation), not a bare Error', async () => {
    const broker = new CustomerKernelBrokerService();
    await expect(broker.loginUser('a@example.com', 'password123')).rejects.toBeInstanceOf(
      CustomerKernelException,
    );
    await expect(broker.loginUser('a@example.com', 'password123')).rejects.toMatchObject({
      operation: 'allowlist-violation',
    });
    expect(mockedAssert).toHaveBeenCalledWith('POST', '/api/v1/auth/login');
  });
});
