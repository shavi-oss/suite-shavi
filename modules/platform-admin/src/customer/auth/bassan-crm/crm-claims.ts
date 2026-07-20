/**
 * Bassan CRM crm.* permission namespace + claim helpers.
 *
 * G-SEC-2 (2/3): SHAVI verifies + enforces Bassan-issued RS256 JWT crm.* claims.
 * Delegation pattern (ADR-013 Authorization Boundary, §7 ratification):
 *   Bassan is the SOLE authority for crm.* permissions. SHAVI stores NO local
 *   crm.* permission rows — enforcement is purely claims-derived per request.
 */

export type CrmPermission =
  | 'crm.leads:read'
  | 'crm.leads:write'
  | 'crm.tasks:read'
  | 'crm.tasks:write';

/** The exact 4-row crm.* namespace ratified by Card t_5c30eff9. */
export const CRM_PERMISSIONS: readonly CrmPermission[] = [
  'crm.leads:read',
  'crm.leads:write',
  'crm.tasks:read',
  'crm.tasks:write',
] as const;

/** Audience SHAVI requires on Bassan-issued CRM tokens. */
export const CRM_AUDIENCE = 'urn:shavi:crm';

/** Role/claim value that grants superuser bypass parity (Bassan permissions.guard.ts L72-74). */
export const CRM_ADMIN_ROLE = 'Admin';

export interface BassanCrmClaims {
  sub?: string;
  iss?: string;
  aud?: string | string[];
  exp?: number;
  iat?: number;
  /** Space-separated crm.* keys granted to this token (Bassan minting). */
  scope?: string;
  /** Single role claim. */
  role?: string;
  /** Roles array claim. */
  roles?: string[];
  /** Superuser flag. */
  is_superuser?: boolean;
  [key: string]: unknown;
}

/**
 * Parse a space-separated `scope` claim into the set of recognized crm.* permissions.
 * Unknown/malformed tokens are ignored (defense-in-depth; only known keys grant access).
 */
export function parseCrmScope(scope: string | undefined): Set<CrmPermission> {
  const out = new Set<CrmPermission>();
  if (!scope) return out;
  const known = CRM_PERMISSIONS as readonly string[];
  for (const raw of scope.trim().split(/\s+/)) {
    if (known.includes(raw)) {
      out.add(raw as CrmPermission);
    }
  }
  return out;
}

/**
 * True if the verified Bassan claims identify a superuser (Admin) that bypasses the
 * crm.* scope check — parity with Bassan permissions.guard.ts L72-74.
 * NOTE: this only relaxes the *scope* requirement; the token must still be validly
 * signed + unexpired (auth is never bypassed).
 */
export function isCrmAdmin(claims: BassanCrmClaims): boolean {
  if (claims.is_superuser === true) return true;
  if (claims.role === CRM_ADMIN_ROLE) return true;
  if (Array.isArray(claims.roles) && claims.roles.includes(CRM_ADMIN_ROLE)) return true;
  return false;
}

/** Whether the claims satisfy a required crm.* permission (Admin => always true). */
export function hasCrmPermission(claims: BassanCrmClaims, required: CrmPermission): boolean {
  return isCrmAdmin(claims) || parseCrmScope(claims.scope).has(required);
}
