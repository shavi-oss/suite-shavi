import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  signSession,
  verifySession,
  decodeUnsafe,
  customerSessionSecret,
  CustomerSessionClaims,
} from './customer-jwt.util';
import { CustomerKernelBrokerService } from '../kernel/customer-kernel-broker.service';

/**
 * CustomerSessionService — issues / rotates / invalidates the Workspace Session JWT.
 *
 * Design (Contract B §2 / §4 / §5.2):
 *  - Login is KERNEL-BROKERED: Suite calls Core POST /api/v1/auth/login (Core owns user auth,
 *    Contract A §6.2). Core returns a user-scoped accessToken.
 *  - Suite mints its OWN Session JWT (HS256) wrapping { sub, email, organizationId, jti }.
 *  - The Core accessToken is stored SERVER-SIDE (keyed by jti) and NEVER leaves Suite.
 *  - Logout / expiry deletes the server-side record, so the SessionGuard denies thereafter.
 */

interface SessionRecord {
  userId: string;
  email: string;
  organizationId: string;
  kernelToken: string; // Core user-scoped accessToken — NEVER returned to client
}

@Injectable()
export class CustomerSessionService {
  private readonly logger = new Logger(CustomerSessionService.name);
  private readonly sessions = new Map<string, SessionRecord>();
  private readonly SESSION_TTL_SEC = 900; // 15 minutes

  constructor(private readonly broker: CustomerKernelBrokerService) {}

  async login(
    email: string,
    password: string,
  ): Promise<{ token: string; expiresIn: number }> {
    // Kernel-brokered auth (Contract A §6.2: Core owns user auth)
    const kernelToken = await this.broker.loginUser(email, password);
    const kernelClaims = decodeUnsafe(kernelToken);
    const organizationId = kernelClaims.organizationId;

    // Fail-closed: a Workspace user MUST have an organization context
    if (!organizationId) {
      this.logger.warn({ message: 'Kernel login returned no organizationId', email });
      throw new UnauthorizedException('User has no organization context');
    }

    const jti = randomUUID();
    this.sessions.set(jti, {
      userId: kernelClaims.sub,
      email: kernelClaims.email,
      organizationId,
      kernelToken,
    });

    const token = signSession(
      { sub: kernelClaims.sub, email: kernelClaims.email, organizationId, jti },
      customerSessionSecret(),
      this.SESSION_TTL_SEC,
    );
    return { token, expiresIn: this.SESSION_TTL_SEC };
  }

  refresh(oldToken: string): { token: string; expiresIn: number } {
    const old = verifySession(oldToken, customerSessionSecret());
    const record = this.sessions.get(old.jti);
    if (!record) {
      throw new UnauthorizedException('Session expired');
    }
    // Rotate jti so the old token can no longer be used
    this.sessions.delete(old.jti);
    const jti = randomUUID();
    this.sessions.set(jti, record);
    const token = signSession(
      { sub: record.userId, email: record.email, organizationId: record.organizationId, jti },
      customerSessionSecret(),
      this.SESSION_TTL_SEC,
    );
    return { token, expiresIn: this.SESSION_TTL_SEC };
  }

  logout(token: string): void {
    try {
      const claims = verifySession(token, customerSessionSecret());
      this.sessions.delete(claims.jti);
    } catch {
      // already invalid — idempotent
    }
  }

  /**
   * Verify a Session JWT AND confirm the server-side record still exists.
   * Throws UnauthorizedException if invalid, expired, or invalidated (logout).
   * Used by CustomerSessionGuard.
   */
  verify(token: string): CustomerSessionClaims {
    const claims = verifySession(token, customerSessionSecret());
    if (!this.sessions.has(claims.jti)) {
      throw new UnauthorizedException('Session invalidated');
    }
    return claims;
  }

  /** Server-side Kernel token lookup (for future Kernel-brokered endpoints). NEVER log it. */
  getKernelToken(jti: string): string | null {
    return this.sessions.get(jti)?.kernelToken ?? null;
  }
}
