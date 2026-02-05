import { EntityType, ActionType, ResultType } from '@prisma/client';

/**
 * Audit Log Response DTO
 * 
 * Purpose: Shape audit log responses to UI
 * Evidence: MODULE_SECURITY_LAWS.md Section 3.4
 */

export class AuditLogResponseDto {
  id!: string;
  correlationId!: string;
  entityType!: EntityType;
  entityId!: string;
  action!: ActionType;
  performedBy!: string;
  performedAt!: Date;
  result!: ResultType;
  metadata?: Record<string, any>;
}

/**
 * Audit Log Query DTO
 * 
 * Purpose: Filter audit logs
 */
export class AuditLogQueryDto {
  entityType?: EntityType;
  entityId?: string;
  action?: ActionType;
  performedBy?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}
