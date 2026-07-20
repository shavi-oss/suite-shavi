/**
 * Core Contract Assertion
 * 
 * Purpose: Runtime assertion that we only call authorized Core endpoints
 * Evidence: CORE_V1_INTEGRATION_LOCK.md Section 8.1
 * 
 * ALLOWED (admin S2S): GET /api/v1/organizations/:id, POST /api/v2/admin/organizations,
 *           PATCH /api/v2/admin/organizations/:id/suspend,
 *           PATCH /api/v2/admin/organizations/:id/unsuspend,
 *           PATCH /api/v2/admin/organizations/:id/deactivate,
 *           GET /api/v2/admin/organizations/:id,
 *           POST /api/v2/admin/audit/events
 *             (Contract A §16 — Suite→Kernel central audit emission for crm.* decisions)
 *
 * CUSTOMER BROKER SUBSET (ADR-016 D4 — user-scoped, Suite acts on behalf of a
 * Workspace user; the Core token is held server-side and never exposed):
 *           POST /api/v1/auth/login,
 *           GET /api/v1/organizations/:id
 *
 * FORBIDDEN: All other Core endpoints
 */

const ALLOWED_CORE_ENDPOINTS = [
  'GET /api/v1/organizations/:id',
  'POST /api/v2/admin/organizations',
  'PATCH /api/v2/admin/organizations/:id/suspend',
  'PATCH /api/v2/admin/organizations/:id/unsuspend',
  'PATCH /api/v2/admin/organizations/:id/deactivate',
  'GET /api/v2/admin/organizations/:id',
  'POST /api/v2/admin/audit/events',
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

/**
 * ---------------------------------------------------------------------------
 * CUSTOMER SUBSET (Contract B / Workspace ↔ Suite gateway)
 * ---------------------------------------------------------------------------
 * The Bassan Workspace customer broker (CustomerKernelBrokerService) may call ONLY
 * these user-scoped Core endpoints. They are registered HERE — in the same canonical
 * allowlist/assert module as CoreClient — so the customer broker cannot drift onto an
 * unauthorized Core endpoint (ADR-016 D4, drift fix).
 *
 * Authorized customer endpoints:
 *   POST /api/v1/auth/login          (Core owns user auth; returns user-scoped accessToken)
 *   GET  /api/v1/organizations/:id (user-scoped org read, requires the stored Core token)
 *
 * NOTE: Contract A §12 does not yet enumerate POST /api/v1/auth/login. Flagged for
 * Founder sign-off at the next Contract A version bump (governance item, not a code change).
 */
const CUSTOMER_ALLOWED_CORE_ENDPOINTS = [
  'POST /api/v1/auth/login',
  'GET /api/v1/organizations/:id',
] as const;

export type CustomerAllowedCoreEndpoint =
  (typeof CUSTOMER_ALLOWED_CORE_ENDPOINTS)[number];

/**
 * Assert that a Core endpoint call from the CUSTOMER broker is authorized.
 * Same mechanics as assertCoreEndpointAllowed (exact + `:id` pattern match), but
 * scoped to the customer subset above.
 *
 * @throws Error (STOP) if the endpoint is not in the customer allowlist.
 */
export function assertCustomerEndpointAllowed(
  method: string,
  path: string,
): void {
  const endpoint = `${method.toUpperCase()} ${path}`;

  if (
    CUSTOMER_ALLOWED_CORE_ENDPOINTS.includes(
      endpoint as CustomerAllowedCoreEndpoint,
    )
  ) {
    return;
  }

  // Pattern match for :id params (UUID)
  const pathPattern = path.replace(/\/[a-f0-9-]{36}/gi, '/:id');
  const patternEndpoint = `${method.toUpperCase()} ${pathPattern}`;

  if (
    CUSTOMER_ALLOWED_CORE_ENDPOINTS.includes(
      patternEndpoint as CustomerAllowedCoreEndpoint,
    )
  ) {
    return;
  }

  throw new Error(
    `STOP: Unauthorized Core endpoint call for customer broker: ${endpoint}. ` +
      `Only allowed: ${CUSTOMER_ALLOWED_CORE_ENDPOINTS.join(', ')}`,
  );
}

/**
 * Get the customer-scoped allowed Core endpoints.
 */
export function getCustomerAllowedCoreEndpoints(): readonly string[] {
  return CUSTOMER_ALLOWED_CORE_ENDPOINTS;
}
