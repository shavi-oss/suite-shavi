# 02_JWKS_DEPLOY_EVIDENCE.md — Gate 5 Phase 1

## Live JWKS after redeploy

```
GET https://jwks-server-production.up.railway.app/.well-known/jwks.json
HTTP/1.1 200 OK
Cache-Control: public, max-age=300
Content-Type: application/json

{
  "keys": [{
    "kty": "RSA",
    "n": "uEWWZtrfEGKDVgY55G-oTlA-9YBWIB31xMvqvPORucR6epOOuSdOY7XDv1hTuibkKEzj-mSJZVmwjK3YyKqOKSRq89MEf_-qaZuhhDE7IbFVrfNBb7vW2XSim5H9mmBLiouUEB_UlaEfLQz0cNuGjh4Ff4KmNJ3Otth4OFO8cpdeVxyIwm2AuEKpSccu9ENsqslrPnD_fRVTIy8_pWyGjwAs-vMJqzSiSoVeZl9KtHDn6zm7oA_1ZXPD3OVxw0ukEu386DITfMibnv30-2YQG-sO0C_ecTIuicl_RI4ormLv8LkzAXxHRhAfdwJDxMdBkunDFUFMNYQO9OCORVieAQ",
    "e": "AQAB",
    "use": "sig",
    "kid": "admin-key-3",
    "alg": "RS256"
  }]
}
```

## Verification

- ✅ HTTP 200
- ✅ `kid=admin-key-3` present
- ✅ `n` matches derived KEY3_N from keygen step
- ✅ No private fields (`d`, `p`, `q`, etc.) in response
- ✅ `admin-key-2` retired (not present)
