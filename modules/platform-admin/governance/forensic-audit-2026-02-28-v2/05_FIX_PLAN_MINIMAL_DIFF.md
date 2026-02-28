# 05 — MINIMAL-DIFF FIX PLAN (Proposal Only)

> **Status:** Items marked ✅ DONE are already applied in PR-2 (`3eebe0f`).
> Items marked 🟡 PENDING require action or verification.
> **User must approve execution of any PENDING items before they are executed.**

---

## Stage 1 — Suite Docker + Runtime (Already Applied in PR-2)

| #    | Change                                                                     | File                                  | Status            |
| ---- | -------------------------------------------------------------------------- | ------------------------------------- | ----------------- |
| S1.1 | `RUN npx vite build --config modules/platform-admin/client/vite.config.ts` | `Dockerfile`                          | ✅ Done (3eebe0f) |
| S1.2 | `builder: DOCKERFILE` (remove NIXPACKS + buildCommand)                     | `railway.json`                        | ✅ Done (3eebe0f) |
| S1.3 | `app.listen(port, '0.0.0.0')`                                              | `modules/platform-admin/host/main.ts` | ✅ Done (3eebe0f) |

**Scope Lock**: Only `Dockerfile`, `railway.json`, `main.ts`.
**Stop Conditions**: Any security model change. Any wildcard CORS. Any API route returning HTML.
**Verification**:

```bash
curl -si https://web-production-6f02f6.up.railway.app/api/platform-admin/health
# Expected: HTTP/1.1 200 OK, Content-Type: application/json
# Contains: {"status":"ok"}

curl -si https://web-production-6f02f6.up.railway.app/api/platform-admin/organizations
# Expected: HTTP/1.1 401 Unauthorized, Content-Type: application/json
# NOT HTML
```

---

## Stage 2 — JWKS Domain Verification (Manual — Pending)

**Problem**: JWKS domain has not been confirmed live. If wrong, Suite→Core S2S calls fail.

**Procedure** (manual — no code change):

1. Railway Dashboard → Bassan.os project → `jwks-server` service → Deployments Settings → copy Public Domain.
2. Run: `curl -si https://<jwks-domain>/.well-known/jwks.json`
   - Expected: **200**, `Content-Type: application/json`, body `{"keys":[{"kty":"RSA",...}]}`
3. Run: `curl -si https://<jwks-domain>/health`
   - Expected: `200`, body `{"status":"ok"}`
4. In Core service env: confirm `ADMIN_JWKS_URL = https://<jwks-domain>` (no trailing slash).

**Stop Conditions**: STOP if response contains private key fields (`d`, `p`, `q`, `dp`, `dq`, `qi`, `k`).

**Status**: 🟡 PENDING — Manual verification required.

---

## Stage 3 — Core Health Endpoint (Proposal Only — Needs Approval)

**Problem**: Core has no `/health` endpoint. Railway may use internal healthcheck; external monitoring will get 404.

**Proposed minimal change** (Core repo, needs user approval):

```typescript
// backend/src/app.controller.ts (NEW FILE — 10 lines)
import { Controller, Get } from "@nestjs/common";
@Controller()
export class AppController {
  @Get("health")
  health() {
    return { status: "ok" };
  }
}
```

**Scope Lock**: New file `backend/src/app.controller.ts`, modify `backend/src/app.module.ts` to add `controllers: [AppController]`.
**Stop Conditions**: Any change to auth guards, middleware, or existing routes.

**Status**: 📋 PROPOSED — Requires explicit user approval.

---

## Stage 4 — TenantMiddleware Audit for Admin Routes (Investigation Only)

**Problem**: `TenantMiddleware` on `path: '*'` may reject admin S2S calls.

**Investigation needed** (read-only):

- Read `backend/src/shared/middleware/tenant.middleware.ts`
- Determine if it calls next() when no tenant context, or fails closed
- If it fails closed → add route exclusion: `.exclude({path: 'api/v2/admin', method: RequestMethod.ALL})`

**Status**: 📋 INVESTIGATION NEEDED — Read `tenant.middleware.ts` first.

---

## Verification Command Matrix (All Stages)

| Check                | Command                                                                      | Expected                                  |
| -------------------- | ---------------------------------------------------------------------------- | ----------------------------------------- |
| Suite SPA loads      | `curl -si https://web-production-6f02f6.up.railway.app/`                     | `200 text/html`, `<!doctype html>`        |
| Suite health (JSON)  | `curl -si .../api/platform-admin/health`                                     | `200 application/json`, `{"status":"ok"}` |
| Suite API auth guard | `curl -si .../api/platform-admin/organizations`                              | `401 application/json`                    |
| Suite PATCH guard    | `curl -si -X PATCH .../api/platform-admin/organizations/x/suspend`           | `401 application/json`                    |
| Core auth guard      | `curl -si https://core-admin-mount-production.up.railway.app/api/v1/auth/me` | `401 application/json`                    |
| Core admin guard     | `curl -si -X POST .../api/v2/admin/organizations`                            | `401 application/json`                    |
| JWKS live            | `curl -si https://<jwks-domain>/.well-known/jwks.json`                       | `200 application/json`, `{"keys":[...]}`  |
