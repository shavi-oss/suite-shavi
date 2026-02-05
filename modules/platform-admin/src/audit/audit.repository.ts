import { Injectable } from '@nestjs/common';
import { PrismaService } from '../db/prisma.service';
import { EntityType, ActionType, ResultType, Prisma } from '@prisma/client';
import { AuditLogQueryDto } from './dto/audit-log.response.dto';

/**
 * Audit Repository
 * 
 * Purpose: Append-only audit log storage
 * Evidence: MODULE_SECURITY_LAWS.md Section 3.4
 * 
 * MUST: Append-only (no updates or deletes)
 * MUST NOT: Store secrets in audit logs
 */

@Injectable()
export class AuditRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create audit log entry (append-only)
   */
  async create(data: {
    correlationId: string;
    entityType: EntityType;
    entityId: string;
    action: ActionType;
    performedBy: string;
    result: ResultType;
    metadata?: Record<string, any>;
  }) {
    return this.prisma.platformAdminAuditLog.create({
      data: {
        correlationId: data.correlationId,
        entityType: data.entityType,
        entityId: data.entityId,
        action: data.action,
        performedBy: data.performedBy,
        result: data.result,
        metadata: data.metadata ? (data.metadata as Prisma.JsonObject) : undefined,
      },
    });
  }

  /**
   * Query audit logs (read-only)
   */
  async findMany(query: AuditLogQueryDto) {
    const where: Prisma.PlatformAdminAuditLogWhereInput = {};

    if (query.entityType) {
      where.entityType = query.entityType;
    }

    if (query.entityId) {
      where.entityId = query.entityId;
    }

    if (query.action) {
      where.action = query.action;
    }

    if (query.performedBy) {
      where.performedBy = query.performedBy;
    }

    if (query.startDate || query.endDate) {
      where.performedAt = {};
      if (query.startDate) {
        where.performedAt.gte = query.startDate;
      }
      if (query.endDate) {
        where.performedAt.lte = query.endDate;
      }
    }

    return this.prisma.platformAdminAuditLog.findMany({
      where,
      orderBy: { performedAt: 'desc' },
      take: query.limit || 100,
      skip: query.offset || 0,
    });
  }

  /**
   * Count audit logs
   */
  async count(query: AuditLogQueryDto): Promise<number> {
    const where: Prisma.PlatformAdminAuditLogWhereInput = {};

    if (query.entityType) {
      where.entityType = query.entityType;
    }

    if (query.entityId) {
      where.entityId = query.entityId;
    }

    if (query.action) {
      where.action = query.action;
    }

    if (query.performedBy) {
      where.performedBy = query.performedBy;
    }

    return this.prisma.platformAdminAuditLog.count({ where });
  }
}
