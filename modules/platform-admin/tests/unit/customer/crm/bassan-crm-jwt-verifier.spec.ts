import { generateKeyPairSync, createSign } from 'crypto';
import { UnauthorizedException } from '@nestjs/common';
import { BassanCrmJwtVerifier } from '../../../../src/customer/auth/bassan-crm/bassan-crm-jwt-verifier';
import { StaticBassanKeyProvider } from '../../../../src/customer/auth/bassan-crm/bassan-key-provider';
import { CRM_AUDIENCE } from '../../../../src/customer/auth/bassan-crm/crm-claims';

// ---- RS256 test fixtures (stand-in for Bassan's JWKS; no Bassan code touched) ----
function makeRsaPair() {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  return {
    privateKey: privateKey.export({ type: 'pkcs8', format: 'pem' }).toString(),
    publicKey: publicKey.export({ type: 'spki', format: 'pem' }).toString(),
  };
}

function signRs256(header: object, payload: object, privateKeyPem: string): string {
  const h = Buffer.from(JSON.stringify(header)).toString('base64url');
  const p = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signingInput = `${h}.${p}`;
  const sig = createSign('RSA-SHA256').update(signingInput).sign(privateKeyPem, 'base64url');
  return `${signingInput}.${sig}`;
}

const ISS = 'https://bassan.example';
const AUD = CRM_AUDIENCE;

describe('BassanCrmJwtVerifier — issuer pinning (G-SEC-2 remediation, ADR-013)', () => {
  const pair = makeRsaPair();

  const token = (overrides: Record<string, unknown> = {}) =>
    signRs256(
      { alg: 'RS256', typ: 'JWT' },
      { iss: ISS, aud: AUD, sub: 'u1', exp: Math.floor(Date.now() / 1000) + 3600, ...overrides },
      pair.privateKey,
    );

  it('accepts a token whose iss matches the pinned issuer', async () => {
    const verifier = new BassanCrmJwtVerifier(new StaticBassanKeyProvider(pair.publicKey), {
      issuer: ISS,
      audience: AUD,
    });
    const claims = await verifier.verify(token());
    expect(claims.sub).toBe('u1');
    expect(claims.iss).toBe(ISS);
  });

  it('rejects (401) a token whose iss does not match the pinned issuer', async () => {
    const verifier = new BassanCrmJwtVerifier(new StaticBassanKeyProvider(pair.publicKey), {
      issuer: ISS,
      audience: AUD,
    });
    await expect(verifier.verify(token({ iss: 'https://evil.example' }))).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('fails closed (401) when no issuer is pinned — refuses to trust an unpinned issuer', async () => {
    // Ensure no issuer is configured via env or constructor config.
    const saved = process.env.BASSAN_CRM_ISSUER;
    delete process.env.BASSAN_CRM_ISSUER;
    try {
      const verifier = new BassanCrmJwtVerifier(new StaticBassanKeyProvider(pair.publicKey), {
        audience: AUD,
        // deliberately omit issuer
      });
      // Even a perfectly valid RS256 token with a well-formed iss must be rejected,
      // because an unpinned issuer is a zero-trust violation (ADR-013).
      await expect(verifier.verify(token({ iss: 'https://some-issuer.example' }))).rejects.toThrow(
        UnauthorizedException,
      );
    } finally {
      if (saved !== undefined) process.env.BASSAN_CRM_ISSUER = saved;
    }
  });
});
