/**
 * Core Contract Assertion
 * 
 * Purpose: Runtime assertion that we only call authorized Core endpoints
 * Evidence: CORE_V1_INTEGRATION_LOCK.md Section 8.1
 * 
 * ALLOWED: GET /api/v1/organizations/:id, POST /api/v2/admin/organizations,
 *           PATCH /api/v2/admin/organizations/:id/suspend,
 *           PATCH /api/v2/admin/organizations/:id/unsuspend,
 *           PATCH /api/v2/admin/organizations/:id/deactivate
 * FORBIDDEN: All other Core endpoints
 */

const ALLOWED_CORE_ENDPOINTS = [
  'GET /api/v1/organizations/:id',
  'POST /api/v2/admin/organizations',
  'PATCH /api/v2/admin/organizations/:id/suspend',
  'PATCH /api/v2/admin/organizations/:id/unsuspend',
  'PATCH /api/v2/admin/organizations/:id/deactivate',
] as const;

export type AllowedCoreEndpoint = typeof ALLOWED_CORE_ENDPOINTS[number];

/**
 * Assert that a Core endpoint call is authorized
 * 
 * @param method - HTTP method
 * @param path - Endpoint path
 * @throws Error if endpoint is not in allowlist
 */
export function assertCoreEndpointAllowed(
  method: string,
  path: string,
): void {
  const endpoint = `${method.toUpperCase()} ${path}`;
  
  // Check exact match
  if (ALLOWED_CORE_ENDPOINTS.includes(endpoint as AllowedCoreEndpoint)) {
    return;
  }

  // Check pattern match for :id params
  const pathPattern = path.replace(/\/[a-f0-9-]{36}/gi, '/:id');
  const patternEndpoint = `${method.toUpperCase()} ${pathPattern}`;
  
  if (ALLOWED_CORE_ENDPOINTS.includes(patternEndpoint as AllowedCoreEndpoint)) {
    return;
  }

  // STOP: Unauthorized Core endpoint call
  throw new Error(
    `STOP: Unauthorized Core endpoint call: ${endpoint}. ` +
    `Only allowed: ${ALLOWED_CORE_ENDPOINTS.join(', ')}`,
  );
}

/**
 * Get list of allowed Core endpoints
 */
export function getAllowedCoreEndpoints(): readonly string[] {
  return ALLOWED_CORE_ENDPOINTS;
}
