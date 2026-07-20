import { Injectable, Logger } from '@nestjs/common';
import { createSign, createPrivateKey, randomUUID } from 'crypto';

function b64url(buf: Buffer): string {
  return buf.toString('base64url');
}

/**
 * S2sTokenService — mints short-lived RS256 S2S JWTs for outbound Suite→Kernel
 * calls, reusing the EXISTING `PLATFORM_ADMIN_JWT_* ` signing material.
 *
 * Single source of truth for S2S minting (previously duplicated inside
 * `SessionGuard.mintAdminJwt`). Used by `BassanCrmAuditSink` (Contract A §16.3)
 * and available to any future S2S caller — NO new key material, NO new dependency.
 *
 * Security rules (mirror SessionGuard):
 *   - Never logs the private key or the minted JWT.
 *   - Private key decoded from base64 into memory only.
 *
 * Fail-closed: if signing material is missing/malformed, returns `null` so the
 * caller can skip emission without throwing (the caller's decision is unchanged).
 */
@Injectable()
export class S2sTokenService {
  private readonly logger = new Logger(S2sTokenService.name);

  /**
   * Mint a short-lived (300s) RS256 S2S JWT.
   * @param sub fixed emitter principal (e.g. `'shavi-audit-sink'`), NOT a user id.
   * @returns the signed JWT, or `null` if signing material is unset/malformed.
   */
  mintS2sJwt(sub: string): string | null {
    const keyB64 = process.env.PLATFORM_ADMIN_JWT_PRIVATE_KEY_PEM_B64;
    const kid = process.env.PLATFORM_ADMIN_JWT_KID;

    if (!keyB64 || !kid) {
      this.logger.warn(
        'S2S signing material missing (PLATFORM_ADMIN_JWT_PRIVATE_KEY_PEM_B64 / PLATFORM_ADMIN_JWT_KID)',
      );
      return null;
    }

    const pem = Buffer.from(keyB64, 'base64').toString('utf8');

    const nowSec = Math.floor(Date.now() / 1000);
    const header = b64url(
      Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT', kid })),
    );
    const payload = b64url(
      Buffer.from(
        JSON.stringify({
          sub,
          type: 's2s',
          jti: randomUUID(), // replay defense on short-lived window
          iat: nowSec,
          exp: nowSec + 300,
        }),
      ),
    );

    const signingInput = `${header}.${payload}`;

    let privateKey;
    try {
      privateKey = createPrivateKey({ key: pem, format: 'pem' });
    } catch {
      this.logger.warn('Failed to parse PLATFORM_ADMIN_JWT_PRIVATE_KEY_PEM_B64 as PEM');
      return null;
    }

    const sig = createSign('RSA-SHA256').update(signingInput).sign(privateKey);
    return `${signingInput}.${sig.toString('base64url')}`;
  }
}
