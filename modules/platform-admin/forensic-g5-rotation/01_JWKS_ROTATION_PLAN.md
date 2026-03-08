# 01_JWKS_ROTATION_PLAN.md — Gate 5 Phase 1

## Decision: Publish admin-key-3 Only

**Rationale**: `admin-key-2` was proven mismatched — its private key is unavailable/stale.
Keeping it in JWKS provides no useful signing path and could cause confusion.
Publishing `admin-key-3` only is simpler and safer.

## Steps Executed

1. Generated RSA-2048 keypair (PKCS8 PEM) in memory → `new-admin-private.pem`, `new-admin-public.pem` (temp)
2. Derived JWK: `kid=admin-key-3, alg=RS256, use=sig` — public fields only
3. Built JWKS JSON `{ "keys": [<key3>] }` (496 bytes)
4. Base64-encoded JWKS JSON (664 char) → `ADMIN_JWKS_B64`
5. Set `ADMIN_JWKS_B64` on Railway `jwks-server` service (no quoting issues)
6. Set `PLATFORM_ADMIN_JWT_PRIVATE_KEY_PEM_B64` on Railway `web` service (base64, no echo)
7. Set `PLATFORM_ADMIN_JWT_KID=admin-key-3` on Railway `web` service
8. Redeployed `jwks-server`
9. Deleted `new-admin-private.pem`, `new-admin-public.pem`, `new-jwks.json` from disk (PEM_REMAINING=0)

## Scope

No `index.js` changes needed — `jwks-server` reads `ADMIN_JWKS_B64` from env.
No new Railway secrets besides allowed vars.
