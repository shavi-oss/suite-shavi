# Gate 50 — Checklist

## BFF → Core JWT Forwarding (Server-Side Only)

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Gate Number    | 50                                      |
| Gate Name      | BFF → Core JWT Forwarding               |
| Document Title | GATE_50_CHECKLIST                       |
| Repo           | Suite (Layer / Product Repo)            |
| Module         | platform-admin                          |
| Status         | FINAL — CHECKLIST (50A DOCS-ONLY)       |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-02-12                              |

---

## Section 1: Pre-Implementation Checklist (Gate 50B Prerequisites)

**MUST be satisfied BEFORE Gate 50B starts**:

- [ ] Gate 49B locked and approved (Suite session implementation complete)
- [ ] Runtime tag baseline exists (e.g., `suite-platform-admin-gate-49b`)
- [ ] Clean working tree (`git status --porcelain` shows no unexpected changes)
- [ ] No pending diffs (`git diff --name-only` is empty or shows only expected files)
- [ ] BFF builds successfully (`npx tsc -p modules/platform-admin/tsconfig.bff.json` exit code 0)
- [ ] All unit tests pass (`npx jest -c jest.config.cjs modules/platform-admin/tests/unit` 100% pass rate)
- [ ] Gate 50A docs approved (GATE_50_PLAN.md, GATE_50_AUTHORIZATION.md, GATE_50_STOP_CONDITIONS.md, GATE_50_CHECKLIST.md)
- [ ] INTEGRATION_CONTRACT_CORE.md reviewed (Core v1 user-scoped JWT constraints understood)

---

## Section 2: Implementation Checklist (Gate 50B Execution)

### 2.1 JWT Storage (Server-Side Only)

- [ ] JwtStorageService created with in-memory Map<userId, coreJwt>
- [ ] JWT storage ONLY on BFF server-side (no cookies, localStorage, sessionStorage)
- [ ] JWT retrieval by userId
- [ ] JWT clearing on logout
- [ ] No JWT exposure to UI (response body, headers, cookies)

**Source**: SECURITY_BASELINE.md 3.3, GATE_48_DEV_AUTH_FLOW_LOCK.md Section 2.2

### 2.2 CoreClient JWT Forwarding

- [ ] `coreJwt` parameter added to `CoreClient.validateOrganization()` method
- [ ] `Authorization: Bearer ${coreJwt}` header set in Core API calls
- [ ] Existing correlation ID logic preserved (`X-Correlation-Id` header)
- [ ] Existing error handling preserved (401/403 fail-closed)
- [ ] No retry on 401/403 (fail-closed immediately)

**Source**: INTEGRATION_CONTRACT_CORE.md 5.1, 7.1

### 2.3 Fail-Closed Behavior (MUST)

- [ ] Missing Core JWT → 401 Unauthorized
- [ ] Invalid Core JWT (401 from Core) → 401 to UI immediately
- [ ] Forbidden (403 from Core) → 403 to UI immediately
- [ ] No retry on 401/403
- [ ] Safe error messages (no JWT, no stack traces, no internal details)
- [ ] Generic error: "Unauthorized access. Please contact your administrator."

**Source**: INTEGRATION_CONTRACT_CORE.md 5.1 line 137, SECURITY_BASELINE.md 5.3

### 2.4 Logging Discipline (MUST)

**MUST Log**:

- [ ] Core API call metadata (endpoint, method, status code, duration)
- [ ] Correlation ID for all Core API calls
- [ ] Tenant context (organizationId from JWT claim)
- [ ] Authentication failures (401/403, no JWT value)

**MUST NOT Log**:

- [ ] Core JWT value
- [ ] Authorization header value
- [ ] Passwords or credentials
- [ ] PII (unless explicitly approved)

**Source**: SECURITY_BASELINE.md 4.7, INTEGRATION_CONTRACT_CORE.md 8.2

### 2.5 Correlation ID Propagation (MUST)

- [ ] Existing correlation ID flow preserved (UI → BFF → Core)
- [ ] `X-Correlation-Id` header included in Core API calls
- [ ] Correlation ID logged in all log entries
- [ ] No correlation ID removal

**Source**: INTEGRATION_CONTRACT_CORE.md 8.1

### 2.6 Test Coverage (MUST)

- [ ] JwtStorageService tests (store, retrieve, clear)
- [ ] CoreClient JWT forwarding tests (Authorization header set)
- [ ] 401 fail-closed test (no retry, immediate 401 to UI)
- [ ] 403 fail-closed test (no retry, immediate 403 to UI)
- [ ] Missing JWT test (401 to UI)
- [ ] Correlation ID propagation test
- [ ] Negative tests (invalid JWT, expired JWT, missing JWT)
- [ ] All tests pass (100% pass rate)

### 2.7 Negative Tests (MUST)

- [ ] Test missing Core JWT → 401
- [ ] Test invalid Core JWT (401 from Core) → 401 to UI
- [ ] Test forbidden (403 from Core) → 403 to UI
- [ ] Test no retry on 401/403
- [ ] Test safe error messages (no JWT exposure)

---

## Section 3: Verification Checklist (Gate 50B Closure)

- [ ] TypeScript compilation passes (`npx tsc -p modules/platform-admin/tsconfig.bff.json` exit code 0)
- [ ] All unit tests pass (`npx jest -c jest.config.cjs modules/platform-admin/tests/unit` 100% pass rate)
- [ ] Runtime smoke test passes (Core API called with JWT header, no UI exposure)
- [ ] Core API called with `Authorization: Bearer <jwt>` header (verified in logs)
- [ ] 401/403 fail-closed behavior verified (no retry, immediate denial)
- [ ] Correlation ID propagated to Core API calls (verified in logs)
- [ ] No JWT exposed to UI (verified in response body, headers, cookies)
- [ ] `git diff --name-only` shows only allowed files
- [ ] `git diff` shows no forbidden changes
- [ ] No dependency changes (`package.json`/`package-lock.json` unchanged)

---

## Section 4: Final Acceptance (Gate 50B)

- [ ] All checklists above are satisfied
- [ ] No stop conditions triggered (see GATE_50_STOP_CONDITIONS.md)
- [ ] Evidence documented in GATE_50B_VERIFICATION_EVIDENCE.md
- [ ] Execution report created (GATE_50B_EXECUTION_REPORT.md)
- [ ] Governance Authority approval obtained

---

## Signature

**Approved By**: Governance Authority  
**Date**: 2026-02-12  
**Status**: FINAL — CHECKLIST (50A DOCS-ONLY)
