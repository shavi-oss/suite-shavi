import { createPublicKey } from 'crypto';

/**
 * Provider of Bassan's RSA public key(s) for RS256 verification of crm.* tokens.
 *
 * Mirrors the existing S2S convention (ADMIN_JWT_PUBLIC_KEY / ADMIN_JWKS_URL):
 *   - Prefer a static PEM (BASSAN_CRM_JWT_PUBLIC_KEY) — no runtime network dependency.
 *   - Otherwise fetch + parse JWKS from BASSAN_CRM_JWKS_URL, matched by `kid`.
 */
export const BASSAN_CRM_KEY_PROVIDER = 'BASSAN_CRM_KEY_PROVIDER';

export interface BassanKeyProvider {
  /** Returns the RSA public key as a PEM string. */
  getPublicKey(kid?: string): Promise<string>;
}

/** Test / fixture double: serves a static PEM (e.g. a locally generated RS256 key). */
export class StaticBassanKeyProvider implements BassanKeyProvider {
  constructor(private readonly pem: string) {}
  async getPublicKey(_kid?: string): Promise<string> {
    return this.pem;
  }
}

export class EnvBassanKeyProvider implements BassanKeyProvider {
  private cache: { pem: string; expiresAt: number } | null = null;

  constructor(
    private readonly jwksUrl = process.env.BASSAN_CRM_JWKS_URL || '',
    private readonly staticPem = process.env.BASSAN_CRM_JWT_PUBLIC_KEY || '',
    private readonly ttlMs = 60 * 60 * 1000,
  ) {}

  async getPublicKey(kid?: string): Promise<string> {
    if (this.staticPem) return this.staticPem;
    if (!this.jwksUrl) {
      throw new Error(
        'Bassan CRM key not configured (set BASSAN_CRM_JWT_PUBLIC_KEY or BASSAN_CRM_JWKS_URL)',
      );
    }
    if (this.cache && this.cache.expiresAt > Date.now()) return this.cache.pem;
    const pem = await this.fetchJwksPem(kid);
    this.cache = { pem, expiresAt: Date.now() + this.ttlMs };
    return pem;
  }

  private async fetchJwksPem(kid?: string): Promise<string> {
    const res = await fetch(this.jwksUrl, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`Bassan JWKS fetch failed: ${res.status}`);
    const jwks = (await res.json()) as { keys?: Array<Record<string, unknown>> };
    const keys = jwks.keys || [];
    const key = kid ? keys.find((k) => k.kid === kid) : keys[0];
    if (!key) throw new Error('Bassan JWKS: no matching key');
    // Node converts an RFC 7517 JWK into a PEM public key.
    const pub = createPublicKey({ key: key as any, format: 'jwk' });
    return pub.export({ type: 'spki', format: 'pem' }).toString();
  }
}
