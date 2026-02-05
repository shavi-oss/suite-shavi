import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Resource, Action, hasPermission } from './permissions.map';
import { UserRole } from './roles.enum';

/**
 * RBAC Guard
 * 
 * Purpose: Enforce 4-role RBAC on all platform-admin endpoints
 * Evidence: MODULE_SECURITY_LAWS.md Section 3.2
 * 
 * MUST: Deny-by-default authorization
 * MUST NOT: Allow unauthenticated access
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
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get RBAC requirement from decorator
    const requirement = this.reflector.get<RbacRequirement>(
      RBAC_METADATA_KEY,
      context.getHandler(),
    );

    // If no RBAC requirement, deny by default (fail-closed)
    if (!requirement) {
      throw new UnauthorizedException(
        'Unauthorized: No RBAC requirement defined',
      );
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Fail-closed: No user = deny
    if (!user) {
      throw new UnauthorizedException('Unauthorized: No user context');
    }

    // Fail-closed: No role = deny
    if (!user.role) {
      throw new UnauthorizedException('Unauthorized: No role assigned');
    }

    // Check permission
    const allowed = hasPermission(
      user.role as UserRole,
      requirement.resource,
      requirement.action,
    );

    if (!allowed) {
      throw new UnauthorizedException(
        `Unauthorized: Insufficient permissions for ${requirement.action} on ${requirement.resource}`,
      );
    }

    return true;
  }
}
