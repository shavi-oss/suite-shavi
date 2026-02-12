# Gate 49 — Checklist

## Suite Session Implementation (httpOnly Cookie-Based)

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Gate Number    | 49                                      |
| Gate Name      | Suite Session Implementation            |
| Document Title | GATE_49_CHECKLIST                       |
| Repo           | Suite (Layer / Product Repo)            |
| Module         | platform-admin                          |
| Status         | FINAL — CHECKLIST (49A DOCS-ONLY)       |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-02-12                              |

---

## Section 1: Pre-Implementation Checklist (Gate 49B Prerequisites)

**MUST be satisfied BEFORE Gate 49B starts**:

- [ ] Gate 48 locked and approved (GATE_48_DEV_AUTH_FLOW_LOCK.md exists and is FINAL)
- [ ] Runtime tag baseline exists (e.g., `suite-platform-admin-gate-48`)
- [ ] Clean working tree (`git status --porcelain` shows no unexpected changes)
- [ ] No pending diffs (`git diff --name-only` is empty or shows only expected files)
- [ ] BFF builds successfully (`npx tsc -p modules/platform-admin/tsconfig.bff.json` exit code 0)
- [ ] All unit tests pass (`npm run test:platform-admin:unit` 100% pass rate)
- [ ] CORS credentials enabled (verified in `host/main.ts` line 15: `credentials: true`)
- [ ] Gate 49A docs approved (GATE_49_PLAN.md, GATE_49_AUTHORIZATION.md, GATE_49_CHECKLIST.md, GATE_49_STOP_CONDITIONS.md)

---

## Section 2: Implementation Checklist (Gate 49B Execution)

### 2.1 Cookie Attributes (MUST)

- [ ] `httpOnly: true` (prevents JavaScript access, SECURITY_BASELINE.md 4.2)
- [ ] `secure: process.env.NODE_ENV === 'production'` (HTTPS in prod, GATE_48_DEV_AUTH_FLOW_LOCK.md Section 3.1)
- [ ] `sameSite: 'strict'` (CSRF protection, GATE_48_DEV_AUTH_FLOW_LOCK.md Section 4.1)
- [ ] `path: '/'` (site-wide)
- [ ] `maxAge: 900000` (15 minutes, SECURITY_BASELINE.md TODO #1)
- [ ] No `domain` attribute (same-origin only for dev)

### 2.2 CORS Credentials (MUST)

- [ ] `credentials: true` in CORS config (already set in `host/main.ts` line 15)
- [ ] Origin restricted to `http://localhost:3000` (dev) or `https://suite.example.com` (prod)
- [ ] No wildcard origin (`*`) used

### 2.3 CSRF Strategy (MUST)

- [ ] Using `sameSite: 'strict'` (CSRF protection via cookie attribute)
- [ ] OR implemented CSRF token validation (if `sameSite: 'lax'` or `sameSite: 'none'`)
- [ ] Documented chosen strategy in implementation gate

### 2.4 Fail-Closed Responses (MUST)

- [ ] Invalid session → 401 Unauthorized
- [ ] Missing session → 401 Unauthorized
- [ ] Expired session → 401 Unauthorized
- [ ] Safe error messages (no internal details, stack traces, or sensitive data)
- [ ] Generic error: "Unauthorized access. Please contact your administrator."

### 2.5 No Token Logs (MUST NOT)

- [ ] Session IDs NOT logged (treat as secrets)
- [ ] Passwords NOT logged
- [ ] Cookie values NOT logged
- [ ] Authorization headers NOT logged
- [ ] PII NOT logged (unless explicitly approved)

**Source**: SECURITY_BASELINE.md Section 4.7, GATE_48_DEV_AUTH_FLOW_LOCK.md Section 6

### 2.6 No UI Token Storage (MUST NOT)

- [ ] No localStorage usage for auth tokens
- [ ] No sessionStorage usage for auth tokens
- [ ] No client-side JavaScript access to session cookie (httpOnly enforced)
- [ ] Core JWT NEVER reaches UI or browser storage

**Source**: SECURITY_BASELINE.md 4.2, GATE_48_DEV_AUTH_FLOW_LOCK.md Section 2

### 2.7 Test Coverage (MUST)

- [ ] Session creation test (SessionService)
- [ ] Session validation test (SessionService)
- [ ] Session expiry test (SessionService)
- [ ] Cookie issuance test (AuthController)
- [ ] Cookie clearing test (AuthController)
- [ ] Guard fail-closed test (SessionGuard: 401 on invalid/missing session)
- [ ] Negative tests (expired session, tampered cookie, missing cookie)
- [ ] All tests pass (100% pass rate)

### 2.8 Negative Tests (MUST)

- [ ] Test expired session → 401
- [ ] Test tampered session ID → 401
- [ ] Test missing session cookie → 401
- [ ] Test invalid session ID → 401
- [ ] Test accessing protected endpoint without session → 401

---

## Section 3: Verification Checklist (Gate 49B Closure)

- [ ] TypeScript compilation passes (`npx tsc -p modules/platform-admin/tsconfig.bff.json` exit code 0)
- [ ] All unit tests pass (`npm run test:platform-admin:unit` 100% pass rate)
- [ ] Runtime smoke test passes (login → session → protected endpoint → logout)
- [ ] httpOnly cookie issued on login (verified in curl output)
- [ ] Session validated correctly (200 OK on `/auth/session`)
- [ ] Protected endpoint accessible with valid session (200 OK or 403 RBAC, NOT 401)
- [ ] Session cleared on logout (expired cookie in Set-Cookie header)
- [ ] Session invalid after logout (401 on `/auth/session`)
- [ ] `git diff --name-only` shows only allowed files
- [ ] `git diff` shows no forbidden changes
- [ ] No dependency changes (`package.json`/`package-lock.json` unchanged)

---

## Section 4: Final Acceptance (Gate 49B)

- [ ] All checklists above are satisfied
- [ ] No stop conditions triggered (see GATE_49_STOP_CONDITIONS.md)
- [ ] Evidence documented in GATE_49B_VERIFICATION_EVIDENCE.md
- [ ] Execution report created (GATE_49B_EXECUTION_REPORT.md)
- [ ] Governance Authority approval obtained

---

## Signature

**Approved By**: Governance Authority  
**Date**: 2026-02-12  
**Status**: FINAL — CHECKLIST (49A DOCS-ONLY)
