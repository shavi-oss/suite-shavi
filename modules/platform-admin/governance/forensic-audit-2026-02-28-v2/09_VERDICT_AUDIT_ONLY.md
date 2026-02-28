# 09 — AUDIT VERDICT (Phase 1)

**Date:** 2026-02-28T05:15Z
**Auditor:** Full forensic audit per user spec (Phase 1 — Audit Only)

---

## Decision: APPROVE WITH CONDITIONS

Phase 2 (execution) may proceed ONLY after the conditions below are verified.

---

## Evidence Confirming Correct Architecture

| Item                                          | Status       | Evidence                                                      |
| --------------------------------------------- | ------------ | ------------------------------------------------------------- |
| DenyAllGuard as APP_GUARD (deny-by-default)   | ✅ CONFIRMED | `platform-admin.module.ts` L54-56                             |
| SessionGuard + RbacGuard on all org endpoints | ✅ CONFIRMED | `organization.controller.ts` L31                              |
| adminJwtAuthGuard on all Core admin routes    | ✅ CONFIRMED | `admin.controller.ts` L34                                     |
| Core JWT never in browser response            | ✅ CONFIRMED | `JwtStorageService.get()` — server-side only                  |
| CoreClient allowlist runtime assertion        | ✅ CONFIRMED | `core.contract.assert.ts` ALLOWED_CORE_ENDPOINTS              |
| All 5 Suite↔Core endpoints wired correctly    | ✅ CONFIRMED | CoreClient + OrganizationController                           |
| JWKS private key leak protection              | ✅ CONFIRMED | `index.js` L84-93 hard-exit on private field                  |
| Suite SPA serves correctly on `/`             | ✅ CONFIRMED | Live probe: 200 HTML, `<title>Platform Admin Console</title>` |
| Core API guards active                        | ✅ CONFIRMED | Live probes: 401 JSON on auth/me and admin/organizations      |

---

## Conditions for Phase 2 Approval

### Condition 1 — Suite API Routes Must Return JSON (Priority: CRITICAL)

**Verify after PR-2 (`3eebe0f`) Railway Docker rebuild:**

```bash
curl -si https://web-production-6f02f6.up.railway.app/api/platform-admin/health
# MUST: 200 application/json {"status":"ok"}
# MUST NOT: 200 text/html

curl -si https://web-production-6f02f6.up.railway.app/api/platform-admin/organizations
# MUST: 401 application/json
# MUST NOT: 200 text/html
```

**Status:** 🟡 PENDING — PR-2 pushed, Railway rebuild triggered, not yet verified.

### Condition 2 — JWKS Domain Verified (Priority: HIGH)

**Manual step:**

1. Railway Dashboard → jwks-server service → public domain.
2. `curl -si https://<jwks-domain>/.well-known/jwks.json` → must be `200 application/json {"keys":[...]}`.
3. Confirm `ADMIN_JWKS_URL` in Core service env = `https://<jwks-domain>` (no trailing slash).
4. Re-test Core admin endpoint with a valid admin JWT → must get 201/200 (not 401).

**Status:** 🟡 PENDING — Domain unknown from automated probes.

### Condition 3 — TenantMiddleware Audit (Priority: MEDIUM)

**Read:** `backend/src/shared/middleware/tenant.middleware.ts`

- If it calls `next()` when no tenant context → safe for S2S admin calls.
- If it throws/rejects when no tenant context → must add route exclusion for `/api/v2/admin/*`.

**Status:** 🟡 PENDING — File not yet read.

---

## What Is NOT Required for Phase 2

| Item                         | Reason                                       |
| ---------------------------- | -------------------------------------------- |
| Core health endpoint         | Low priority — Railway TCP check may suffice |
| Multi-stage Docker build     | Nice to have, not a blocker                  |
| Node 18 → 20 upgrade in Core | Works fine on 18, not a blocker              |
| Suite UI end-to-end test     | Phase 2 verification, not a precondition     |

---

## Phase 2 Proposed Scope Lock

If Phase 2 is approved (pending verification of conditions above):

| Stage | Files Allowed                                                      | Change                                        |
| ----- | ------------------------------------------------------------------ | --------------------------------------------- |
| P2-A  | Verify only                                                        | Post-PR-2 curl probes (no code change)        |
| P2-B  | Manual                                                             | JWKS domain verification in Railway Dashboard |
| P2-C  | `backend/src/shared/middleware/tenant.middleware.ts` (read only)   | Audit TenantMiddleware                        |
| P2-D  | `backend/src/app.controller.ts` (NEW), `backend/src/app.module.ts` | Core health endpoint (if approved)            |

---

## Final Compliance Check

| Governance Rule                 | Status                                |
| ------------------------------- | ------------------------------------- |
| Fail-closed always              | ✅ DenyAllGuard + fail-exits in JWKS  |
| Minimal diff, no refactors      | ✅ All changes are < 10 lines each    |
| Security model unchanged        | ✅ Guards not touched                 |
| JWT never in browser            | ✅ JwtStorageService server-side only |
| API routes must not return HTML | 🟡 PENDING — awaiting PR-2 deployment |
| Dockerfile = runtime truth      | ✅ railway.json now DOCKERFILE        |
