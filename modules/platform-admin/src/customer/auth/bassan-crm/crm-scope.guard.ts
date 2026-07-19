import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { BassanCrmJwtVerifier } from './bassan-crm-jwt-verifier';
import { BassanCrmClaims, CrmPermission, hasCrmPermission } from './crm-claims';

export const CRM_SCOPE_KEY = 'crmScope';

/**
 * Header that carries the Bassan-issued crm.* RS256 JWT. Kept separate from the
 * Suite session token (Authorization: Bearer). Overridable via
 * BASSAN_CRM_TOKEN_HEADER for deployment-specific transport.
 */
export const CRM_TOKEN_HEADER = (process.env.BASSAN_CRM_TOKEN_HEADER || 'x-bassan-crm-token').toLowerCase();

/** Declare the required crm.* permission for a route handler. */
export const RequireCrmScope = (permission: CrmPermission) =>
  SetMetadata(CRM_SCOPE_KEY, permission);

/**
 * SHAVI CRM Scope Guard — verifies + enforces Bassan-issued crm.* claims.
 *
 * G-SEC-2 (2/3) delegation pattern (ADR-013 Authorization Boundary):
 *  - Verifies the Bassan RS256 JWT (scope namespace crm.leads / crm.tasks × read/write).
 *  - Enforces the per-route required crm.* permission declared via @RequireCrmScope().
 *  - Stores NO local permission rows — enforcement is purely claims-derived per request.
 *  - Preserves Admin superuser-bypass parity with Bassan permissions.guard.ts L72-74:
 *    an Admin/superuser token is granted all crm.* scopes (scope check bypassed),
 *    but the token MUST still be validly signed + unexpired (bypass is scope-only, not auth).
 *
 * Fail-closed: missing/invalid token → 401; missing scope → 403.
 */
@Injectable()
export class CrmScopeGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly verifier: BassanCrmJwtVerifier,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<CrmPermission>(CRM_SCOPE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    // Fail-closed: a route without an explicit crm.* requirement must not pass.
    if (!required) {
      throw new UnauthorizedException('crm scope requirement missing');
    }

    const req = context.switchToHttp().getRequest();
    const raw = req.headers?.[CRM_TOKEN_HEADER];
    const token = raw && raw.startsWith('Bearer ') ? raw.slice(7) : raw || null;
    if (!token) {
      throw new UnauthorizedException('Missing Bassan CRM token');
    }

    const claims: BassanCrmClaims = await this.verifier.verify(token);

    if (!hasCrmPermission(claims, required)) {
      throw new ForbiddenException(`Missing crm permission: ${required}`);
    }

    // Expose verified claims downstream (read-only; never a stored permission row).
    req.bassanCrm = claims;
    return true;
  }
}
