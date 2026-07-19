import { Injectable, Logger } from '@nestjs/common';
import { assertCoreEndpointAllowed } from '../../../core-adapter/core.contract.assert';
import { S2sTokenService } from '../../../auth/s2s-token.service';
import { CrmPermission } from './crm-claims';

/** Normalized verdict of a crm.* authorization decision. */
export type CrmAuditDecision = 'allow' | 'deny_403' | 'admin_bypass';

/** Resulting HTTP state of the decision. */
export type CrmAuditOutcome =
  | 'allowed'
  | 'forbidden'
  | 'unauthorized'
  | 'bypass_granted';

/** Audit rule tag (Contract A §16.4). Optional for plain allow. */
export type CrmAuditRule =
  | 'CRM_SCOPE_MISSING'
  | 'CRM_TOKEN_MISSING'
  | 'CRM_SCOPE_DENIED'
  | 'CRM_ADMIN_BYPASS';

/**
 * NON-PII crm.* decision event emitted to Bassan Kernel central audit
 * (Contract A §16.4). Only opaque identifiers (`sub`, optional `orgId`) may be
 * carried — NEVER email / name / phone / address.
 */
export interface CrmAuditEvent {
  eventType: 'authorization.decision';
  domain: 'crm';
  decision: CrmAuditDecision;
  outcome: CrmAuditOutcome;
  requiredPermission: CrmPermission | 'crm:*';
  granted: boolean;
  source: 'shavi:crm-scope-guard';
  policyVersion: 'core-audit-emission-v1';
  correlationId: string;
  actor: {
    subject: string;
    orgId?: string;
    isAdminBypass: boolean;
  };
  resource: string;
  emittedAt: string;
  metadata: {
    rule?: CrmAuditRule;
    bypassReason?: 'crm-admin-superuser-parity';
  };
}

const AUDIT_ENDPOINT_PATH = '/api/v2/admin/audit/events';

/**
 * BassanCrmAuditSink — emits every crm.* authorization decision from
 * `CrmScopeGuard` to the Bassan Kernel central audit sink.
 *
 * Contract A §16 (ratified v3):
 *   - Transport: HTTPS/S2S POST to `POST /api/v2/admin/audit/events`.
 *   - Auth: Suite S2S RS256 JWT (reuse Model B via `S2sTokenService`).
 *   - Fail-closed: audit delivery is best-effort. `emitCrmDecision` RESOLVES and
 *     NEVER throws — an audit failure MUST NOT flip deny→allow, add latency, or
 *     surface to the client (§16.5).
 *   - Constraints: NO Bassan/Kernel code touched; NO new npm dependency;
 *     NO local crm.* permission rows; MUST NOT emit to SHAVI-local AuditService.
 */
@Injectable()
export class BassanCrmAuditSink {
  private readonly logger = new Logger(BassanCrmAuditSink.name);
  private readonly coreBaseUrl: string;

  constructor(private readonly s2sTokenService: S2sTokenService) {
    // Do NOT throw here (unlike CoreClient): a missing base URL must only skip
    // emission, never break the guard's decision (fail-closed).
    this.coreBaseUrl = process.env.CORE_API_BASE_URL || '';
  }

  /**
   * Emit a crm.* decision to Kernel central audit.
   * Fire-and-forget from the caller; this method itself resolves on any failure.
   */
  async emitCrmDecision(event: CrmAuditEvent): Promise<void> {
    // Drift guard — if the endpoint is not in the allowlist, STOP the emit.
    // Wrapped so a misconfiguration is logged + skipped, never thrown upstream.
    try {
      assertCoreEndpointAllowed('POST', AUDIT_ENDPOINT_PATH);
    } catch {
      this.logger.error({
        message: 'CRM audit emit aborted: endpoint not in allowlist (fail-closed maintained)',
        correlationId: event.correlationId,
        errorCode: 'CRM_AUDIT_EMIT_FAILED',
      });
      return;
    }

    // Fail-closed: missing signing material → skip emission, do not throw.
    const coreJwt = this.s2sTokenService.mintS2sJwt('shavi-audit-sink');
    if (!coreJwt) {
      this.logger.warn({
        message: 'CRM audit emit skipped (S2S signing material missing)',
        correlationId: event.correlationId,
      });
      return;
    }

    // Fail-closed: missing Core base URL → skip emission, do not throw.
    if (!this.coreBaseUrl) {
      this.logger.warn({
        message: 'CRM audit emit skipped (CORE_API_BASE_URL missing)',
        correlationId: event.correlationId,
      });
      return;
    }

    try {
      const response = await fetch(`${this.coreBaseUrl}${AUDIT_ENDPOINT_PATH}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${coreJwt}`,
          'X-Correlation-Id': event.correlationId,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        // 4xx/5xx from Kernel on the audit endpoint = audit-pipeline fault,
        // NOT an auth fault. Log only — never surface to the crm decision.
        this.logger.error({
          message: 'CRM audit emit failed (fail-closed maintained)',
          correlationId: event.correlationId,
          errorCode: 'CRM_AUDIT_EMIT_FAILED',
        });
      }
    } catch {
      // Network/timeout. Fail-closed: log only. NO JWT, NO PII, NO error-object dump.
      this.logger.error({
        message: 'CRM audit emit failed (fail-closed maintained)',
        correlationId: event.correlationId,
        errorCode: 'CRM_AUDIT_EMIT_FAILED',
      });
    }
  }
}
