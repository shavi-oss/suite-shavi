import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { SessionService } from './session.service';
import { JwtStorageService } from './jwt-storage.service';

type Request = any;

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private readonly sessionService: SessionService,
    private readonly jwtStorageService: JwtStorageService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const sessionId = request.cookies?.sessionId;

    // Fail-closed: missing session → 401
    if (!sessionId) {
      throw new UnauthorizedException('Unauthorized access. Please contact your administrator.');
    }

    const userId = this.sessionService.validateSession(sessionId);

    // Fail-closed: invalid/expired session → 401
    if (!userId) {
      throw new UnauthorizedException('Unauthorized access. Please contact your administrator.');
    }

    // Attach userId to request for downstream use
    (request as any).userId = userId;

    // Attach user object so RbacGuard can check role + status.
    // Role is fixed to platform_admin until real user DB lookup is integrated
    // (future gate: look up InternalUser by userId, read their stored role).
    // Evidence: forensic-core-jwt Phase 2 — RbacGuard req.user fix.
    (request as any).user = {
      id: userId,
      role: 'platform_admin',   // temporary: grants full READ access
      status: 'active',
    };

    // Retrieve Core JWT from server-side storage
    const coreJwt = this.jwtStorageService.get(userId);

    // Fail-closed: missing Core JWT → 401
    if (!coreJwt) {
      throw new UnauthorizedException('Unauthorized access. Please contact your administrator.');
    }

    // Attach Core JWT to request context (server-side only, NEVER in response)
    (request as any).coreJwt = coreJwt;

    return true;
  }
}
