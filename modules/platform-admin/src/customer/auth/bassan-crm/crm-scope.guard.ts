import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { randomUUID } from 'crypto';
import { BassanCrmJwtVerifier } from './bassan-crm-jwt-verifier';
import { BassanCrmClaims, CrmPermission, hasCrmPermission, isCrmAdmin } from './crm-claims';
import {
  BassanCrmAuditSink,
  CrmAuditDecision,
  CrmAuditEvent,
  CrmAuditOutcome,
} from './bassan-crm-audit';

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
 * SHAVI CRM Scope Guard — verifies + enforces Bassan-issued crm.* claims, and
 * emits every decision to Bassan Kernel central audit (Contract A §16).
 *
 * G-SEC-2 (2/3) delegation pattern (ADR-013 Authorization Boundary):
 *  - Verifies the Bassan RS256 JWT (scope namespace crm.leads / crm.tasks × read/write).
 *  - Enforces the per-route required crm.* permission declared via @RequireCrmScope().
 *  - Stores NO local permission rows — enforcement is purely claims-derived per request.
 *  - Preserves Admin superuser-bypass parity with Bassan permissions.guard.ts L72-74:
 *    an Admin/superuser token is granted all crm.* scopes (scope check bypassed),
 *    but the token MUST still be validly signed + unexpired (bypass is scope-only, not auth).
 *
 * Audit (Contract A §16.5): after the authorization decision is FINALIZED, the
 * guard emits a NON-PII crm.* decision event as a FIRE-AND-FORGET call
 * (`void audit.emitCrmDecision(...).catch(() => {})`). The emit is NEVER awaited;
 * audit failure MUST NOT flip deny→allow, add latency, or surface to the client.
 *
 * Fail-closed: missing/invalid token → 401; missing scope → 403.
 */
@Injectable()
export class CrmScopeGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly verifier: BassanCrmJwtVerifier,
    private readonly audit: BassanCrmAuditSink,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<CrmPermission>(CRM_SCOPE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const req = context.switchToHttp().getRequest();
    const correlationId = this.resolveCorrelationId(req);
    const resource = `${req.method ?? 'GET'} ${req.url ?? ''}`.trim();

    // Fail-closed: a route without an explicit crm.* requirement must not pass.
    if (!required) {
      this.emitDecision(correlationId, resource, {
        decision: 'deny_403',
        outcome: 'unauthorized',
        requiredPermission: 'crm:*',
        granted: false,
        actor: { subject: 'anonymous', isAdminBypass: false },
        metadata: { rule: 'CRM_SCOPE_MISSING' },
      });
      throw new UnauthorizedException('crm scope requirement missing');
    }

    const raw = req.headers?.[CRM_TOKEN_HEADER];
    const token = raw && raw.startsWith('Bearer ') ? raw.slice(7) : raw || null;
    if (!token) {
      this.emitDecision(correlationId, resource, {
        decision: 'deny_403',
        outcome: 'unauthorized',
        requiredPermission: required,
        granted: false,
        actor: { subject: 'anonymous', isAdminBypass: false },
        metadata: { rule: 'CRM_TOKEN_MISSING' },
      });
      throw new UnauthorizedException('Missing Bassan CRM token');
    }

    const claims: BassanCrmClaims = await this.verifier.verify(token);

    if (!hasCrmPermission(claims, required)) {
      this.emitDecision(correlationId, resource, {
        decision: 'deny_403',
        outcome: 'forbidden',
        requiredPermission: required,
        granted: false,
        actor: { subject: claims.sub || 'anonymous', isAdminBypass: false },
        metadata: { rule: 'CRM_SCOPE_DENIED' },
      });
      throw new ForbiddenException(`Missing crm permission: ${required}`);
    }

    // ALLOW (covers both normal allow and Admin scope-bypass).
    const isAdmin = isCrmAdmin(claims);
    this.emitDecision(correlationId, resource, {
      decision: isAdmin ? 'admin_bypass' : 'allow',
      outcome: isAdmin ? 'bypass_granted' : 'allowed',
      requiredPermission: required,
      granted: true,
      actor: { subject: claims.sub || 'anonymous', isAdminBypass: isAdmin },
      metadata: isAdmin
        ? { rule: 'CRM_ADMIN_BYPASS', bypassReason: 'crm-admin-superuser-parity' }
        : {},
    });

    // Expose verified claims downstream (read-only; never a stored permission row).
    req.bassanCrm = claims;
    return true;
  }

  /** Resolve a correlation id from the request, falling back to a generated UUID. */
  private resolveCorrelationId(req: any): string {
    const header = req?.headers?.['x-correlation-id'];
    if (typeof header === 'string' && header.trim()) {
      return header.trim();
    }
    return randomUUID();
  }

  /**
   * Fire-and-forget audit emit. NEVER awaited for the auth response. Audit
   * failure is swallowed by `.catch(() => {})` so it can never flip deny→allow
   * or throw from the guard (Contract A §16.5).
   */
  private emitDecision(
    correlationId: string,
    resource: string,
    partial: {
      decision: CrmAuditDecision;
      outcome: CrmAuditOutcome;
      requiredPermission: CrmPermission | 'crm:*';
      granted: boolean;
      actor: CrmAuditEvent['actor'];
      metadata: CrmAuditEvent['metadata'];
    },
  ): void {
    const event: CrmAuditEvent = {
      eventType: 'authorization.decision',
      domain: 'crm',
      source: 'shavi:crm-scope-guard',
      policyVersion: 'core-audit-emission-v1',
      correlationId,
      resource,
      emittedAt: new Date().toISOString(),
      ...partial,
    };
    void this.audit.emitCrmDecision(event).catch(() => {});
  }
}
