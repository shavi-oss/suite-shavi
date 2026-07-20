import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { CustomerSessionService } from './customer-session.service';

/**
 * CustomerSessionGuard — protects /api/customer/* routes.
 *
 * Fail-closed rules (Contract B §4.2 / §10):
 *  - Missing/invalid/expired Session JWT → 401 DENY.
 *  - Missing server-side session record (logout/expiry) → 401 DENY.
 *  - Tenant (organizationId) is taken from the JWT CLAIM ONLY.
 *    NEVER from a client-supplied X-Organization-Id / X-Tenant-Id header.
 *  - The Kernel token is NEVER attached to the request object visible to the client.
 *
 * Route reachability: controllers pair this with @ExplicitAllow() so the global
 * DenyAllGuard (APP_GUARD) permits the route, then this guard enforces the session.
 */

@Injectable()
export class CustomerSessionGuard implements CanActivate {
  private readonly logger = new Logger(CustomerSessionGuard.name);

  constructor(private readonly sessionService: CustomerSessionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const auth = req.headers?.authorization;
    const token = auth && auth.startsWith('Bearer ') ? auth.slice(7) : null;

    // Fail-closed: no token → deny
    if (!token) {
      throw new UnauthorizedException('Missing customer session token');
    }

    // verify() throws 401 if invalid/expired/invalidated
    const claims = await this.sessionService.verify(token);

    // Tenant from JWT claim ONLY (Contract B §4.1)
    (req as any).user = {
      sub: claims.sub,
      email: claims.email,
      organizationId: claims.organizationId,
    };
    (req as any).customerJti = claims.jti;
    (req as any).customerToken = token;
    return true;
  }
}
