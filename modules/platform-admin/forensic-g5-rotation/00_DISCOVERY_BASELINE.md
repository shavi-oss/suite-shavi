# 00_DISCOVERY_BASELINE.md — Gate 5 Phase 0

**Date**: 2026-03-08

## 1. Live JWKS at time of gate start

```
GET https://jwks-server-production.up.railway.app/.well-known/jwks.json
HTTP/1.1 200 OK
{"keys":[{"kty":"RSA","n":"2dJl85fIqWpuHeitAOuvalzdFlo8QXOf5...","e":"AQAB","use":"sig","kid":"admin-key-2","alg":"RS256"}]}
```

`kid=admin-key-2` served.

## 2. Derived public key from JWKS_ADMIN_PRIVATE (jwks-server Railway env)

```
DERIVED_N=yojyjuvGcMzuqFf5xVLxzwKNc3e5MeTt3GiVhfiYl5pgNMPIJhZ...
DERIVED_E=AQAB
```

## 3. Comparison

| Field      | Live JWKS (admin-key-2) | Derived from JWKS_ADMIN_PRIVATE |
| ---------- | ----------------------- | ------------------------------- |
| `n` prefix | `2dJl85fIqW...`         | `yojyjuvGcM...`                 |
| Match      | ❌ **NO**               | —                               |

## Conclusion

`JWKS_ADMIN_PRIVATE` is stale. It does NOT match the published public key.
`admin-key-2` signing path is **unusable**. Rotation to `admin-key-3` is required.
