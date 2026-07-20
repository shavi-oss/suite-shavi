import { Injectable, UnauthorizedException, Logger, Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  signSession,
  verifySession,
  decodeUnsafe,
  customerSessionSecret,
  CustomerSessionClaims,
} from './customer-jwt.util';
import { CustomerKernelBrokerService } from '../kernel/customer-kernel-broker.service';
import { SessionRecord, SessionStore } from './customer-session-store.interface';

/**
 * CustomerSessionService — issues / rotates / invalidates the Workspace Session JWT.
 *
 * Design (Contract B §2 / §4 / §5.2):
 *  - Login is KERNEL-BROKERED: Suite calls Core POST /api/v1/auth/login (Core owns user auth,
 *    Contract A §6.2). Core returns a user-scoped accessToken.
 *  - Suite mints its OWN Session JWT (HS256) wrapping { sub, email, organizationId, jti }.
 *  - The Core accessToken is stored SERVER-SIDE (keyed by jti) and NEVER leaves Suite.
 *  - Logout / expiry deletes the server-side record, so the SessionGuard denies thereafter.
 *
 * F1 remediation: the server-side record lives in a pluggable SessionStore
 * (Redis when REDIS_URL is set — shared + TTL; in-memory + TTL sweep otherwise).
 * See customer.module.ts for the provider selection.
 */

@Injectable()
export class CustomerSessionService {
  private readonly logger = new Logger(CustomerSessionService.name);
  private readonly SESSION_TTL_SEC = 900; // 15 minutes

  constructor(
    private readonly broker: CustomerKernelBrokerService,
    @Inject('SESSION_STORE') private readonly store: SessionStore,
  ) {}

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
    const record: SessionRecord = {
      userId: kernelClaims.sub,
      email: kernelClaims.email,
      organizationId,
      kernelToken,
    };
    await this.store.set(jti, record, this.SESSION_TTL_SEC);

    const token = signSession(
      { sub: kernelClaims.sub, email: kernelClaims.email, organizationId, jti },
      customerSessionSecret(),
      this.SESSION_TTL_SEC,
    );
    return { token, expiresIn: this.SESSION_TTL_SEC };
  }

  async refresh(oldToken: string): Promise<{ token: string; expiresIn: number }> {
    const old = verifySession(oldToken, customerSessionSecret());
    const record = await this.store.get(old.jti);
    if (!record) {
      throw new UnauthorizedException('Session expired');
    }
    // Rotate jti so the old token can no longer be used
    await this.store.delete(old.jti);
    const jti = randomUUID();
    await this.store.set(jti, record, this.SESSION_TTL_SEC);
    const token = signSession(
      { sub: record.userId, email: record.email, organizationId: record.organizationId, jti },
      customerSessionSecret(),
      this.SESSION_TTL_SEC,
    );
    return { token, expiresIn: this.SESSION_TTL_SEC };
  }

  async logout(token: string): Promise<void> {
    try {
      const claims = verifySession(token, customerSessionSecret());
      await this.store.delete(claims.jti);
    } catch {
      // already invalid — idempotent
    }
  }

  /**
   * Verify a Session JWT AND confirm the server-side record still exists.
   * Throws UnauthorizedException if invalid, expired, or invalidated (logout).
   * Used by CustomerSessionGuard.
   */
  async verify(token: string): Promise<CustomerSessionClaims> {
    const claims = verifySession(token, customerSessionSecret());
    const record = await this.store.get(claims.jti);
    if (!record) {
      throw new UnauthorizedException('Session invalidated');
    }
    return claims;
  }

  /**
   * Server-side Kernel token lookup (for future Kernel-brokered endpoints). NEVER log it.
   */
  async getKernelToken(jti: string): Promise<string | null> {
    return (await this.store.get(jti))?.kernelToken ?? null;
  }
}
