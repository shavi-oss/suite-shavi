import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { SessionService } from './session.service';
import { InternalUserRepository } from '../internal-users/internal-user.repository';
import { UserStatus } from '@prisma/client';
import { createSign, createPrivateKey } from 'crypto';
import { randomUUID } from 'crypto';

type Request = any;

/**
 * SessionGuard — Gate 5 write-route JWT minting
 *
 * For authenticated operator requests:
 *   READ routes (GET): no coreJwt minted — read-only remains unchanged.
 *   WRITE routes (POST/PATCH/DELETE /api/platform-admin/organizations*):
 *     - Mints a short-lived RS256 JWT (TTL 300s) using PLATFORM_ADMIN_JWT_PRIVATE_KEY_PEM_B64.
 *     - Attaches to request.coreJwt.
 *     - Fail-closed: missing env var → 401 JSON "Core write auth not configured".
 *
 * JWT Claims (proven from Core admin-jwt.strategy.ts):
 *   sub:  operatorId
 *   type: "s2s"          ← satisfies Core isS2SType check
 *   iat:  now (seconds)
 *   exp:  now + 300
 *
 * Header: { alg: "RS256", typ: "JWT", kid: PLATFORM_ADMIN_JWT_KID }
 *
 * Security Rules:
 *   - JWT never logged (not even partially).
 *   - JWT never returned to client.
 *   - Private key never logged.
 *   - Private key decoded from base64 into memory only — no disk write.
 *
 * Evidence: forensic-g5-rotation/01_JWKS_ROTATION_PLAN.md
 */

/** Write routes that require a minted coreJwt */
const WRITE_METHOD_PATTERN = /^(POST|PATCH|DELETE)$/i;
/** Extend pattern to include /org-mappings (Gate 8: POST needs coreJwt for validateOrganizationExists) */
const WRITE_PATH_PATTERN =
  /^\/api\/platform-admin\/(organizations|org-mappings)(\/|$)/i;

function b64url(buf: Buffer): string {
  return buf.toString('base64url');
}

@Injectable()
export class SessionGuard implements CanActivate {
  private readonly logger = new Logger(SessionGuard.name);

  constructor(
    private readonly sessionService: SessionService,
    private readonly internalUserRepository: InternalUserRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const sessionId = request.cookies?.sessionId;

    // Fail-closed: no session cookie → 401
    if (!sessionId) {
      throw new UnauthorizedException('Unauthorized access. Please contact your administrator.');
    }

    const userId = this.sessionService.validateSession(sessionId);

    // Fail-closed: invalid / expired session → 401
    if (!userId) {
      throw new UnauthorizedException('Unauthorized access. Please contact your administrator.');
    }

    // Gate 4: session stores operator UUID — lookup by id
    const operator = await this.internalUserRepository.findById(userId);
    if (!operator) {
      throw new UnauthorizedException('Unauthorized access. Please contact your administrator.');
    }

    // Fail-closed: deactivated operator → 401
    if (operator.status === UserStatus.deactivated) {
      throw new UnauthorizedException('Unauthorized access. Please contact your administrator.');
    }

    // Attach real operator identity from DB (role never hardcoded)
    (request as any).userId = operator.id;
    (request as any).user = {
      id: operator.id,
      role: operator.role,
      status: operator.status,
    };

    // Gate 5 — Mint short-lived RS256 coreJwt on WRITE routes only
    const method = request.method as string;
    const path   = request.path  as string;

    if (WRITE_METHOD_PATTERN.test(method) && WRITE_PATH_PATTERN.test(path)) {
      const token = this.mintAdminJwt(operator.id);
      (request as any).coreJwt = token;
    }
    // READ routes: request.coreJwt left undefined — controllers that need it
    // guard their own requirement (organization.controller.ts already does this).

    return true;
  }

  /**
   * Mint a short-lived RS256 admin JWT for Core write operations.
   * Uses PLATFORM_ADMIN_JWT_PRIVATE_KEY_PEM_B64 (base64-encoded PKCS8 PEM).
   * JWT is server-side only — never returned to client, never logged.
   *
   * Throws UnauthorizedException (401) if signing material is missing.
   */
  private mintAdminJwt(operatorId: string): string {
    const keyB64 = process.env.PLATFORM_ADMIN_JWT_PRIVATE_KEY_PEM_B64;
    const kid    = process.env.PLATFORM_ADMIN_JWT_KID;

    if (!keyB64 || !kid) {
      this.logger.warn('Core write auth not configured (PLATFORM_ADMIN_JWT_PRIVATE_KEY_PEM_B64 or PLATFORM_ADMIN_JWT_KID missing)');
      throw new UnauthorizedException('Core write auth not configured');
    }

    // Decode base64 PEM — in memory only, no disk I/O
    const pem = Buffer.from(keyB64, 'base64').toString('utf8');

    const nowSec = Math.floor(Date.now() / 1000);

    // Header
    const header = b64url(Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT', kid })));

    // Payload — proven from Core admin-jwt.strategy.ts validate():
    //   payload.type === 's2s' satisfies isS2SType check (primary path)
    //   payload.sub must be present
    const payload = b64url(Buffer.from(JSON.stringify({
      sub:  operatorId,
      type: 's2s',
      jti:  randomUUID(), // prevent replay on short-lived window
      iat:  nowSec,
      exp:  nowSec + 300,
    })));

    const signingInput = `${header}.${payload}`;

    // Sign with RSA-SHA256 (RS256) using Node built-in crypto — no deps
    const sign = createSign('RSA-SHA256');
    sign.update(signingInput);
    sign.end();

    let privateKey;
    try {
      privateKey = createPrivateKey({ key: pem, format: 'pem' });
    } catch {
      this.logger.warn('Failed to parse PLATFORM_ADMIN_JWT_PRIVATE_KEY_PEM_B64 as PEM');
      throw new UnauthorizedException('Core write auth not configured');
    }

    const sigBuf = sign.sign(privateKey);
    const sig = sigBuf.toString('base64url');

    // JWT never printed or returned to client
    return `${signingInput}.${sig}`;
  }
}
