import { Injectable, Logger } from '@nestjs/common';
import { AuditRepository } from './audit.repository';
import { EntityType, ActionType, ResultType } from '@prisma/client';

/**
 * Audit Service
 * 
 * Purpose: Create immutable audit logs for all administrative actions
 * Evidence: MODULE_SECURITY_LAWS.md Section 3.4
 * 
 * MUST: Create audit log for every administrative action
 * MUST: Fail action if audit log creation fails
 * Evidence: MODULE_SECURITY_LAWS.md Section 5 (Fail-Closed Enforcement)
 */

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly auditRepository: AuditRepository) {}

  /**
   * Log an administrative action
   * 
   * @param params Audit log parameters
   * @param tx Optional Prisma transaction client for atomic operations
   * @throws Error if audit log creation fails
   */
  async logAction(
    params: {
      correlationId: string;
      entityType: EntityType;
      entityId: string;
      action: ActionType;
      performedBy: string;
      result: ResultType;
      metadata?: Record<string, any>;
    },
    tx?: any
  ): Promise<void> {
    try {
      await this.auditRepository.create({
        correlationId: params.correlationId,
        entityType: params.entityType,
        entityId: params.entityId,
        action: params.action,
        performedBy: params.performedBy,
        result: params.result,
        metadata: params.metadata,
      }, tx);

      this.logger.log({
        message: 'Audit log created',
        correlationId: params.correlationId,
        entityType: params.entityType,
        action: params.action,
        result: params.result,
      });
    } catch (error) {
      this.logger.error({
        message: 'Audit log creation failed',
        correlationId: params.correlationId,
        entityType: params.entityType,
        action: params.action,
        errorCode: 'AUDIT_WRITE_FAILED',
      });

      // FAIL-CLOSED: If audit log fails, the action must fail
      throw new Error('AUDIT_WRITE_FAILED');
    }
  }

  /**
   * Query audit logs
   */
  async queryLogs(query: {
    entityType?: EntityType;
    entityId?: string;
    action?: ActionType;
    performedBy?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }) {
    return this.auditRepository.findMany(query);
  }

  /**
   * Count audit logs
   */
  async countLogs(query: {
    entityType?: EntityType;
    entityId?: string;
    action?: ActionType;
    performedBy?: string;
  }): Promise<number> {
    return this.auditRepository.count(query);
  }
}
