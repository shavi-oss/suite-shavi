import { Injectable, Logger } from '@nestjs/common';
import { assertCoreEndpointAllowed } from './core.contract.assert';

/**
 * Core Client Adapter
 * 
 * Purpose: Call ONLY the authorized Core endpoint
 * Allowed: GET /api/v1/organizations/:id
 * Evidence: CORE_CONTRACT_V1_EXTRACT.md Section B.8 (Line 182)
 * 
 * MUST: Forward validated Core JWT as-is
 * MUST NOT: Mint or construct Core JWTs
 * MUST NOT: Log JWT in any form (including error objects)
 * Evidence: ARCHITECTURAL_LAWS.md LAW-5, MODULE_SECURITY_LAWS.md Section 3.5
 */

/**
 * Redact sensitive data from fetch errors before logging
 * CRITICAL: Prevents JWT leakage via error objects
 */
function redactSensitiveData(error: unknown): {
  errorCode: string;
} {
  if (error instanceof Error) {
    return {
      errorCode: 'CORE_CLIENT_FAILED',
      // NEVER include: request headers, full error object, error.message
    };
  }
  return {
    errorCode: 'CORE_CLIENT_FAILED',
  };
}

@Injectable()
export class CoreClient {
  private readonly logger = new Logger(CoreClient.name);
  private readonly coreBaseUrl: string;

  constructor() {
    // Use environment variable directly (no @nestjs/config dependency)
    this.coreBaseUrl = process.env.CORE_API_BASE_URL || '';
    
    if (!this.coreBaseUrl) {
      throw new Error('CORE_API_BASE_URL is not configured');
    }
  }

  /**
   * Validate Core Organization Exists
   * 
   * Endpoint: GET /api/v1/organizations/:id
   * Purpose: Validate that Core organizationId exists before creating mapping
   * Evidence: MODULE_INTEGRATION_PLAN.md Section 3.1 (Lines 70-77)
   * 
   * @param coreOrgId - Core organization ID to validate
   * @param coreJwt - User-scoped Core JWT (forwarded as-is, NEVER logged)
   * @param correlationId - Correlation ID for tracing
   * @returns true if org exists, false if 404
   * @throws Error on 5xx or network errors
   */
  async validateOrganizationExists(
    coreOrgId: string,
    coreJwt: string,
    correlationId: string,
  ): Promise<boolean> {
    // RUNTIME CONTRACT ASSERTION: Verify endpoint is in allowlist
    // Evidence: CORE_V1_INTEGRATION_LOCK.md Section 8.1
    assertCoreEndpointAllowed('GET', `/api/v1/organizations/${coreOrgId}`);

    const url = `${this.coreBaseUrl}/api/v1/organizations/${coreOrgId}`;

    try {
      // Use native fetch (Node.js 18+ built-in)
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${coreJwt}`,
          'X-Correlation-Id': correlationId,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      // SAFE: No JWT in log
      if (response.ok) {
        this.logger.log({
          message: 'Core org validation succeeded',
          correlationId,
          coreOrgId,
          statusCode: response.status,
        });
        return true;
      }

      // Handle 404 (org not found)
      if (response.status === 404) {
        this.logger.warn({
          message: 'Core org not found',
          correlationId,
          coreOrgId,
          statusCode: 404,
        });
        return false;
      }

      // Handle 401/403 (fail-closed)
      if (response.status === 401 || response.status === 403) {
        this.logger.error({
          message: 'Core auth failure',
          correlationId,
          coreOrgId,
          statusCode: response.status,
          // SAFE: No JWT in log
        });
        throw new Error('Core authentication failed');
      }

      // Handle 5xx errors
      if (response.status >= 500) {
        this.logger.error({
          message: 'Core API error',
          correlationId,
          coreOrgId,
          statusCode: response.status,
          // SAFE: Only log safe fields, NO error object dump
        });
        throw new Error(`Core API error: ${response.status}`);
      }

      // Other HTTP errors
      this.logger.error({
        message: 'Core API unexpected error',
        correlationId,
        coreOrgId,
        statusCode: response.status,
        // SAFE: No config dump
      });
      throw new Error(`Core API error: ${response.status}`);

    } catch (error) {
      // Only catch network errors or timeouts, not HTTP errors thrown above
      // Re-throw if this is an Error we already threw
      if (error instanceof Error && (
        error.message.includes('Core authentication failed') ||
        error.message.includes('Core API error')
      )) {
        throw error;
      }

      // Handle network errors or timeouts
      // CRITICAL: Use redaction helper to prevent JWT leakage
      const safeError = redactSensitiveData(error);

      // SAFE: error.message does not contain JWT
      this.logger.error({
        message: 'Core API network error',
        correlationId,
        coreOrgId,
        errorCode: safeError.errorCode,
        // SAFE: No fetch error object
      });
      throw new Error('Core API network error');
    }
  }
}
