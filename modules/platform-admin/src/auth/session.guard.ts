import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { SessionService } from './session.service';
import { InternalUserRepository } from '../internal-users/internal-user.repository';
import { UserStatus } from '@prisma/client';

type Request = any;

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private readonly sessionService: SessionService,
    private readonly internalUserRepository: InternalUserRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const sessionId = request.cookies?.sessionId;

    // Fail-closed: missing session cookie → 401
    if (!sessionId) {
      throw new UnauthorizedException('Unauthorized access. Please contact your administrator.');
    }

    const userId = this.sessionService.validateSession(sessionId);

    // Fail-closed: invalid or expired session → 401
    if (!userId) {
      throw new UnauthorizedException('Unauthorized access. Please contact your administrator.');
    }

    // Gate 4: session now stores operator UUID (since auth.controller validates creds and
    // stores operatorId returned by AuthService). Look up by UUID (findById).
    // Gate 2 Evidence: replaces hardcoded platform_admin with real DB-derived role.
    const operator = await this.internalUserRepository.findById(userId);
    if (!operator) {
      throw new UnauthorizedException('Unauthorized access. Please contact your administrator.');
    }

    // Fail-closed: deactivated operator → 401
    if (operator.status === UserStatus.deactivated) {
      throw new UnauthorizedException('Unauthorized access. Please contact your administrator.');
    }

    // Attach real operator identity — role derived from DB, never hardcoded.
    (request as any).userId = operator.id;
    (request as any).user = {
      id: operator.id,
      role: operator.role,     // real UserRole: platform_admin | developer_ops | support | viewer
      status: operator.status,
    };

    return true;
  }
}
