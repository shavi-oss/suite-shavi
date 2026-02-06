import {
  Controller,
  Get,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { AuditService } from './audit.service';
import { RbacGuard, RequirePermission } from '../security/rbac.guard';
import { Resource, Action } from '../security/permissions.map';
import { EntityType, ActionType } from '@prisma/client';

/**
 * Audit Controller
 * 
 * Scope: LOCKED per MODULE_SCOPE_LOCK.md Section 2.2
 * Endpoints: 1 ONLY (GET /api/platform-admin/audit-logs)
 * Evidence: GATE_4_10_FINAL_Scope.md Phase 8
 * 
 * MUST: Enforce RBAC on all endpoints
 * MUST: Fail-closed validation on all query parameters
 */

@Controller('api/platform-admin/audit-logs')
@UseGuards(RbacGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  /**
   * GET /api/platform-admin/audit-logs
   * Query audit logs with filters
   */
  @Get()
  @RequirePermission(Resource.AUDIT_LOGS, Action.READ)
  async queryLogs(
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('action') action?: string,
    @Query('performedBy') performedBy?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limitStr?: string,
    @Query('offset') offsetStr?: string,
  ) {
    // Validate limit
    const limit = limitStr ? parseInt(limitStr, 10) : 100;
    if (isNaN(limit) || limit < 1 || limit > 1000) {
      throw new BadRequestException('limit must be between 1 and 1000');
    }

    // Validate offset
    const offset = offsetStr ? parseInt(offsetStr, 10) : 0;
    if (isNaN(offset) || offset < 0) {
      throw new BadRequestException('offset must be >= 0');
    }

    // Validate and parse dates
    let parsedStartDate: Date | undefined;
    let parsedEndDate: Date | undefined;

    if (startDate) {
      parsedStartDate = new Date(startDate);
      if (isNaN(parsedStartDate.getTime())) {
        throw new BadRequestException('startDate must be a valid ISO 8601 date');
      }
    }

    if (endDate) {
      parsedEndDate = new Date(endDate);
      if (isNaN(parsedEndDate.getTime())) {
        throw new BadRequestException('endDate must be a valid ISO 8601 date');
      }
    }

    // Validate date range
    if (parsedStartDate && parsedEndDate && parsedStartDate > parsedEndDate) {
      throw new BadRequestException('startDate must be <= endDate');
    }

    // Validate entityType enum
    let validatedEntityType: EntityType | undefined;
    if (entityType) {
      if (!Object.values(EntityType).includes(entityType as EntityType)) {
        throw new BadRequestException('entityType must be one of: organization, org_mapping, internal_user');
      }
      validatedEntityType = entityType as EntityType;
    }

    // Validate action enum
    let validatedAction: ActionType | undefined;
    if (action) {
      if (!Object.values(ActionType).includes(action as ActionType)) {
        throw new BadRequestException('action must be one of: create, update, suspend, unsuspend, link, deactivate');
      }
      validatedAction = action as ActionType;
    }

    // Call service
    return this.auditService.queryLogs({
      entityType: validatedEntityType,
      entityId,
      action: validatedAction,
      performedBy,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      limit,
      offset,
    });
  }
}
