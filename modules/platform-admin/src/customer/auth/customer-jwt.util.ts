import { createHmac, timingSafeEqual } from 'crypto';
import { UnauthorizedException } from '@nestjs/common';

/**
 * Customer Session JWT utilities (HS256, Suite-issued).
 *
 * Contract B (INTEGRATION_CONTRACT_WORKSPACE.md) requires the Workspace to receive a
 * Session JWT issued by Suite with claims { sub, email, organizationId }. The Kernel
 * user-scoped token is NEVER exposed to the Workspace (Contract B Stop Rules).
 *
 * Secret: process.env.CUSTOMER_SESSION_SECRET (HS256). Configured in Coolify by operator.
 *
 * Verification failures throw UnauthorizedException (HTTP 401) — fail-closed by design.
 */

function b64url(buf: Buffer | string): string {
  return Buffer.from(buf).toString('base64url');
}

export interface CustomerSessionClaims {
  sub: string;
  email: string;
  organizationId: string;
  jti: string;
  iat?: number;
  exp?: number;
}

export function customerSessionSecret(): string {
  const s = process.env.CUSTOMER_SESSION_SECRET;
  if (!s) {
    throw new UnauthorizedException('Customer session auth not configured');
  }
  return s;
}

export function signSession(
  claims: CustomerSessionClaims,
  secret: string,
  ttlSec = 900,
): string {
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);
  const payload = b64url(
    JSON.stringify({ ...claims, iat: now, exp: now + ttlSec }),
  );
  const signingInput = `${header}.${payload}`;
  const sig = createHmac('sha256', secret).update(signingInput).digest('base64url');
  return `${signingInput}.${sig}`;
}

export function verifySession(token: string, secret: string): CustomerSessionClaims {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new UnauthorizedException('malformed token');
  }
  const [header, payload, sig] = parts;
  const signingInput = `${header}.${payload}`;
  const expected = createHmac('sha256', secret).update(signingInput).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new UnauthorizedException('invalid signature');
  }
  const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as CustomerSessionClaims;
  if (!claims.exp || claims.exp < Math.floor(Date.now() / 1000)) {
    throw new UnauthorizedException('expired token');
  }
  return claims;
}

/**
 * Decode a Kernel-issued JWT payload WITHOUT verifying its signature.
 * The Suite trusts the Kernel over the internal network; we only need the claims
 * (sub / email / organizationId) to mint our own Session JWT. The raw Kernel token
 * is stored server-side and NEVER returned to the client.
 */
export function decodeUnsafe(token: string): any {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new UnauthorizedException('malformed token');
  }
  return JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
}
