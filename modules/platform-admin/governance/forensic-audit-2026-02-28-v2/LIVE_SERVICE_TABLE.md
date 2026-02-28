# LIVE SERVICE TABLE

**Verification date:** 2026-02-28T06:32Z
**Verified by:** Railway CLI + curl probes (verify-only — no code changes)

---

| Service          | Domain                                               | Health Path                         | Health Result                           |
| ---------------- | ---------------------------------------------------- | ----------------------------------- | --------------------------------------- |
| Suite BFF        | `https://web-production-6f02f6.up.railway.app`       | `/api/platform-admin/health`        | ⚠️ 200 text/html (old binary deploying) |
| Core Admin Mount | `https://core-admin-mount-production.up.railway.app` | `/health`                           | ⚠️ 404 JSON (rebuild pending)           |
| Core Workflow    | `https://core-workflow-production.up.railway.app`    | `/health`                           | ⚠️ 404 JSON (rebuild pending)           |
| JWKS Server      | `https://jwks-server-production.up.railway.app`      | `/.well-known/jwks.json`, `/health` | ✅ 200 JSON                             |

---

## Railway Project Summary

```
railway whoami: eslam abdelshafi (eslam.abdelshafi41@gmail.com)

Suite project (d107e5cc):
  Service: web / suite-shavi-staging
  Domain:  web-production-6f02f6.up.railway.app
  Branch:  master (auto-deploy on push)

Core project (e56fd682):
  core-admin-mount → core-admin-mount-production.up.railway.app
  core-workflow    → core-workflow-production.up.railway.app
  jwks-server      → jwks-server-production.up.railway.app
```

---

## Suite Env Vars (names only — no values)

| Variable               | Status                                            |
| ---------------------- | ------------------------------------------------- |
| `CORE_API_BASE_URL`    | ✅ PRESENT                                        |
| `ADMIN_JWKS_URL`       | ✅ PRESENT                                        |
| `CORS_ORIGIN`          | ✅ PRESENT                                        |
| `CORS_ALLOWED_ORIGINS` | ❌ ABSENT (old name — not set)                    |
| `DATABASE_URL`         | ✅ PRESENT                                        |
| `NODE_ENV`             | ✅ PRESENT                                        |
| `PORT`                 | ❌ ABSENT (Railway injects at runtime — expected) |

> **Note**: `CORS_ORIGIN` is the active var (confirmed via Railway CLI). The `main.ts` fix in `06bdc43` reads `CORS_ALLOWED_ORIGINS || CORS_ORIGIN` — so current production reads `CORS_ORIGIN` correctly once the new binary deploys.
