import { createVerify } from 'crypto';
import { Inject, Optional, UnauthorizedException } from '@nestjs/common';
import { BASSAN_CRM_KEY_PROVIDER, BassanKeyProvider } from './bassan-key-provider';
import { BassanCrmClaims, CRM_AUDIENCE } from './crm-claims';

export interface BassanCrmVerifierConfig {
  /** Expected `iss`. If unset, issuer is not enforced. */
  issuer?: string;
  /** Expected `aud` (default urn:shavi:crm). */
  audience: string;
}

/**
 * Verifies Bassan-issued RS256 JWTs carrying crm.* scope.
 *
 * Uses Node's built-in crypto (no external JWT dependency) — mirrors
 * customer-jwt.util.ts. Fail-closed: any verification/validation failure throws
 * UnauthorizedException (401). No Bassan/Kernel code is touched.
 */
export class BassanCrmJwtVerifier {
  private readonly issuer?: string;
  private readonly audience: string;

  constructor(
    @Inject(BASSAN_CRM_KEY_PROVIDER) private readonly keyProvider: BassanKeyProvider,
    @Optional() config?: Partial<BassanCrmVerifierConfig>,
  ) {
    this.issuer = config?.issuer ?? process.env.BASSAN_CRM_ISSUER;
    this.audience = config?.audience ?? process.env.BASSAN_CRM_AUDIENCE ?? CRM_AUDIENCE;
  }

  async verify(token: string): Promise<BassanCrmClaims> {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new UnauthorizedException('malformed Bassan CRM token');
    }
    const [headerB64, payloadB64, signatureB64] = parts;

    let header: any;
    try {
      header = JSON.parse(Buffer.from(headerB64, 'base64url').toString('utf8'));
    } catch {
      throw new UnauthorizedException('malformed Bassan CRM token header');
    }
    // Reject any non-RS256 alg (prevents alg-downgrade / 'none' attacks).
    if (header.alg !== 'RS256') {
      throw new UnauthorizedException('unsupported Bassan CRM token alg');
    }

    const publicKeyPem = await this.keyProvider.getPublicKey(header.kid as string | undefined);
    if (!verifyRs256(`${headerB64}.${payloadB64}`, signatureB64, publicKeyPem)) {
      throw new UnauthorizedException('invalid Bassan CRM token signature');
    }

    let claims: BassanCrmClaims;
    try {
      claims = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8')) as BassanCrmClaims;
    } catch {
      throw new UnauthorizedException('malformed Bassan CRM token payload');
    }

    if (this.issuer && claims.iss !== this.issuer) {
      throw new UnauthorizedException('unexpected Bassan CRM token issuer');
    }

    const auds = Array.isArray(claims.aud)
      ? claims.aud
      : claims.aud
        ? [claims.aud]
        : [];
    if (!auds.includes(this.audience)) {
      throw new UnauthorizedException('unexpected Bassan CRM token audience');
    }

    const now = Math.floor(Date.now() / 1000);
    if (!claims.exp || claims.exp < now) {
      throw new UnauthorizedException('expired Bassan CRM token');
    }

    return claims;
  }
}

function verifyRs256(signingInput: string, signatureB64: string, publicKeyPem: string): boolean {
  try {
    const verifier = createVerify('RSA-SHA256');
    verifier.update(signingInput);
    verifier.end();
    const sig = Buffer.from(signatureB64, 'base64url');
    return verifier.verify(publicKeyPem, sig);
  } catch {
    return false;
  }
}
