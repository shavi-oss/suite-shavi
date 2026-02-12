import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
  SetMetadata,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Resource, Action, hasPermission } from './permissions.map';
import { UserRole, isValidRole } from './roles.enum';
import { randomUUID } from 'crypto';

/**
 * RBAC Guard
 * 
 * Purpose: Enforce 4-role RBAC on all platform-admin endpoints
 * Evidence: MODULE_SECURITY_LAWS.md Section 3.2
 * 
 * MUST: Deny-by-default authorization
 * MUST NOT: Allow unauthenticated access
 * MUST: Audit authorization violations per AUTHORIZATION_STOP_RULES.md Section 4.1
 * Evidence: ARCHITECTURAL_LAWS.md LAW-10 (Fail-Closed By Default)
 */

export const RBAC_METADATA_KEY = 'rbac';

export interface RbacRequirement {
  resource: Resource;
  action: Action;
}

/**
 * Decorator to specify RBAC requirements for an endpoint
 */
export const RequirePermission = (resource: Resource, action: Action) =>
  SetMetadata(RBAC_METADATA_KEY, { resource, action } as RbacRequirement);

@Injectable()
export class RbacGuard implements CanActivate {
  private readonly logger = new Logger(RbacGuard.name);

  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get RBAC requirement from decorator
    const requirement = this.reflector.get<RbacRequirement>(
      RBAC_METADATA_KEY,
      context.getHandler(),
    );

    // If no RBAC requirement, deny by default (fail-closed)
    if (!requirement) {
      throw new UnauthorizedException('Unauthorized');
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Fail-closed: No user = deny (STOP Rule 10)
    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }

    // Fail-closed: No role = deny (STOP Rule 1)
    if (!user.role) {
      throw new UnauthorizedException('Unauthorized');
    }

    // Fail-closed: Deactivated user = deny (STOP Rule 9)
    if (user.status === 'deactivated') {
      await this.auditViolation(request, 'STOP_RULE_9', user.role, requirement, 'User is deactivated');
      throw new UnauthorizedException('Unauthorized');
    }

    // Fail-closed: Invalid role = deny (STOP Rule 2)
    if (!isValidRole(user.role)) {
      await this.auditViolation(request, 'STOP_RULE_2', user.role, requirement, 'Invalid role');
      throw new ForbiddenException('Forbidden');
    }

    // Check permission
    const allowed = hasPermission(
      user.role as UserRole,
      requirement.resource,
      requirement.action,
    );

    // Fail-closed: Role mismatch or write without allow = deny (STOP Rule 3/4)
    if (!allowed) {
      const rule = requirement.action === Action.WRITE ? 'STOP_RULE_4' : 'STOP_RULE_3';
      await this.auditViolation(request, rule, user.role, requirement, 'Insufficient permissions');
      throw new ForbiddenException('Forbidden');
    }

    return true;
  }

  /**
   * Audit authorization violation
   * Per AUTHORIZATION_STOP_RULES.md Section 4.1
   */
  private async auditViolation(
    request: any,
    rule: string,
    role: string,
    requirement: RbacRequirement,
    reason: string,
  ): Promise<void> {
    try {
      const auditService = request.app?.get?.('AuditService');
      if (!auditService) {
        // AuditService not available in request context, skip audit but remain fail-closed
        return;
      }

      const correlationId = request.headers?.['x-correlation-id'] || randomUUID();
      const userId = request.user?.id || 'unknown';
      const endpoint = `${request.method} ${request.url}`;

      await auditService.logAction({
        correlationId,
        entityType: 'authorization_violation' as any,
        entityId: userId,
        action: 'deny_access' as any,
        performedBy: userId,
        result: 'failure' as any,
        metadata: {
          rule,
          endpoint,
          method: request.method,
          role,
          resource: requirement.resource,
          requiredAction: requirement.action,
          reason,
        },
      });
    } catch (error) {
      // Audit failure must not prevent denial of access (fail-closed)
      // Log error server-side but do not expose details
      this.logger.error('Authorization violation audit failed (fail-closed maintained)', {
        rule,
        errorCode: 'RBAC_AUDIT_FAILED',
      });
    }
  }
}
