# Gate 8.2 — Integration Tests (Authorization)

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Gate Name      | Gate 8.2 — Integration Tests            |
| Module Name    | platform-admin                          |
| Document Title | GATE_8_2_AUTHORIZATION                  |
| Status         | PROPOSED — AUTHORIZATION                |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority                    |
| Date           | 2026-02-07                              |

---

## 1) Authorization Scope (Binding)

### 1.1 Gate 8.2 (Docs-Only) — NOW

**Gate Type:** Docs-Only (Planning)

**Objective:** Define Integration Tests scope for Org Mapping

**Authorized Work (NOW):**

- Create/modify governance documentation files ONLY
- Define integration test scenarios
- Define Core isolation strategy
- Define PASS/STOP criteria

**Scope Boundary (NOW):**

- **ALLOWED:** `modules/platform-admin/governance/**` (docs only)
- **FORBIDDEN:** Any code, tests, Prisma, dependencies, or files outside governance

---

### 1.2 Future Execution Gate — LATER

**Gate Type:** Execution (Tests)

**Objective:** Implement Integration Tests per Gate 8.2 Plan

**Authorized Work (LATER, after approval):**

- Create integration test file: `modules/platform-admin/tests/integration/org-mapping.integration.spec.ts`
- Implement 16 integration test scenarios per `GATE_8_2_PLAN.md`
- Mock/Stub Core client for test isolation
- Run integration tests and verify PASS criteria
- Create evidence and completion report

**Scope Boundary (LATER):**

- **ALLOWED:** `modules/platform-admin/tests/integration/**` (test files only)
- **ALLOWED:** `modules/platform-admin/governance/**` (evidence/completion docs)
- **FORBIDDEN:** Any changes to `src/**`, `prisma/**`, `package.json`, or outside `modules/platform-admin/**`

---

## 2) Allowed Core Interaction (Hard Lock)

**Endpoint:** `GET /api/v1/organizations/:id` (ONLY)

**Purpose:** Validate Core organizationId exists (tested via mock/stub)

**Evidence:**

- `GATE_8_1_EXECUTION_AUTHORIZATION.md` Section 2, Lines 49-79
- `CORE_CONTRACT_V1_EXTRACT.md` Section B.8, Lines 174-184

**Request Pattern (Mocked in Tests):**

```http
GET /api/v1/organizations/:id
Authorization: Bearer <user-scoped-jwt>
```

**Expected Responses (Stubbed in Tests):**

- `200 OK` — Core org exists (proceed with mapping)
- `404 Not Found` — Core org does not exist (fail-closed, reject mapping)
- `401 Unauthorized` — JWT invalid (fail-closed, reject mapping)
- `403 Forbidden` — JWT lacks permission (fail-closed, reject mapping)
- `500 Internal Server Error` — Core failure (fail-closed, reject mapping)
- Timeout — Network failure (fail-closed, reject mapping)

**Fail-Closed Rule:**

- ANY response other than `200 OK` → REJECT mapping creation
- NO fallback behavior
- NO guessing
- NO retry loops

---

## 3) Forbidden Core Endpoints

**MUST NOT test or call:**

- ❌ `POST /api/v1/organizations` — Suite does NOT create Core orgs
- ❌ `PATCH /api/v1/organizations/:id` — Suite does NOT modify Core orgs
- ❌ `DELETE /api/v1/organizations/:id` — Suite does NOT delete Core orgs
- ❌ Any template publish endpoints (DEFERRED per `CORE_V1_INTEGRATION_LOCK.md` Section 4.1)
- ❌ Any service token endpoints (NOT AVAILABLE per `CORE_V1_INTEGRATION_LOCK.md` Section 5.1)
- ❌ Any endpoint not explicitly authorized above

**Evidence:** `CORE_CONTRACT_V1_EXTRACT.md` Section B.8

---

## 4) Service Tokens: NOT AVAILABLE

**Status:** ❌ NOT AVAILABLE

**Evidence:**

- `CORE_V1_INTEGRATION_LOCK.md` Section 5.1, Lines 159-173
- No service token contract in Core v1
- No OAuth2 client credentials flow
- No service account endpoints

**Impact:**

- Integration tests MUST NOT test service token acquisition
- Integration tests MUST NOT assume Core service token refresh
- All tests use user-scoped JWT (mocked/stubbed)

---

## 5) JWT Protection Rules

**MUST test:**

- [ ] JWT never stored in Suite DB
- [ ] JWT never logged (log `Authorization: Bearer ***` only)
- [ ] JWT never exposed to UI responses
- [ ] JWT forwarded as-is to Core (in mocked requests)
- [ ] JWT never cached beyond single request

**MUST NOT test:**

- ❌ JWT minting or construction
- ❌ JWT modification
- ❌ JWT storage in DB
- ❌ JWT in logs (full value)
- ❌ JWT in UI responses

**Evidence:**

- `ARCHITECTURAL_LAWS.md` LAW-5 (Token & Identity Separation)
- `MODULE_SECURITY_LAWS.md` Section 3.5 (JWT Protection)
- `GATE_8_1_EXECUTION_AUTHORIZATION.md` Section 3.3, Lines 149-163

---

## 6) RBAC Enforcement Rules

**MUST test all 4 roles:**

| Role           | Org Mappings (Create) | Org Mappings (Read) |
| -------------- | --------------------- | ------------------- |
| platform_admin | ✅ Allowed            | ✅ Allowed          |
| developer_ops  | ✅ Allowed            | ✅ Allowed          |
| support        | ❌ Denied             | ✅ Allowed          |
| viewer         | ❌ Denied             | ✅ Allowed          |

**Evidence:** `MODULE_SECURITY_LAWS.md` Section 3.2, Lines 72-83

**Test Scenarios:**

- [ ] `platform_admin` → can create/read mappings
- [ ] `developer_ops` → can create/read mappings
- [ ] `support` → can read mappings, CANNOT create
- [ ] `viewer` → can read mappings, CANNOT create
- [ ] Unauthenticated → CANNOT access any endpoint

---

## 7) Fail-Closed Enforcement Rules

**MUST test fail-closed behavior:**

- [ ] Core 404 → NO mapping created, audit log failure
- [ ] Core 401 → NO mapping created, audit log failure
- [ ] Core 403 → NO mapping created, audit log failure
- [ ] Core 500 → NO mapping created, audit log failure
- [ ] Core timeout → NO mapping created, audit log failure
- [ ] Duplicate mapping → NO mapping created, audit log failure
- [ ] Missing mapping → Request denied, audit log failure

**Evidence:**

- `ARCHITECTURAL_LAWS.md` LAW-10 (Fail-Closed By Default)
- `MODULE_SECURITY_LAWS.md` Section 5 (Fail-Closed Enforcement)
- `GATE_8_1_EXECUTION_AUTHORIZATION.md` Section 7.2, Lines 379-402

---

## 8) Audit Logging Rules

**MUST test audit logging:**

- [ ] Mapping create success → audit log with `result: success`
- [ ] Mapping create failure → audit log with `result: failure`, `reason: <error_code>`
- [ ] Mapping lookup failure → audit log with `result: failure`, `reason: MAPPING_NOT_FOUND`
- [ ] Correlation ID present in audit metadata
- [ ] No secrets in audit metadata (JWT, passwords, etc.)

**Evidence:**

- `GATE_8_1_EXECUTION_AUTHORIZATION.md` Section 7.3, Lines 405-436
- `MODULE_SECURITY_LAWS.md` Section 3.4 (Audit Log Integrity)

---

## 9) Core Isolation Strategy

**Approach:** Mock/Stub Core HTTP Client

**MUST:**

- [ ] Mock `core.client.ts` methods
- [ ] Stub Core responses (200, 404, 401, 403, 500, timeout)
- [ ] Verify Core client called with correct parameters
- [ ] Use existing test harness ONLY (NO NEW INFRA / NO NEW DEPS)
- [ ] Seed test data (Suite orgs)
- [ ] Verify DB state after operations

**MUST NOT:**

- ❌ Run real Core instance
- ❌ Make real HTTP calls to Core
- ❌ Assume Core behavior beyond Core Contract v1

**Evidence:** `CORE_V1_INTEGRATION_LOCK.md` Section 2 (Source of Truth)

---

## 10) Allowed File (Future Execution Gate)

**File Creation / Modification Allowed (LATER):**

**Integration Tests:**

- `modules/platform-admin/tests/integration/org-mapping.integration.spec.ts`

**Governance (Evidence):**

- `modules/platform-admin/governance/GATE_8_2_EXECUTION_EVIDENCE.md` (future)
- `modules/platform-admin/governance/GATE_8_2_EXECUTION_COMPLETION_REPORT.md` (future)

**MUST NOT modify:**

- ❌ Any files in `src/**` (implementation complete in Gate 8.1)
- ❌ Any files in `prisma/**`
- ❌ `package.json` or `package-lock.json`
- ❌ Any files outside `modules/platform-admin/**`

---

## 11) Explicit NO List (STOP)

### 11.1 Prisma / Migrations

**Forbidden:**

- ❌ Modify `schema.prisma`
- ❌ Create new migrations
- ❌ Run `prisma migrate`
- ❌ Add new tables

**Rationale:** Tables already defined in `MODULE_SCOPE_LOCK.md`

---

### 11.2 Dependencies

**Forbidden:**

- ❌ Add new npm packages
- ❌ Modify `package.json` dependencies
- ❌ Install new libraries

**Rationale:** All required dependencies already available

---

### 11.3 Template Publishing

**Forbidden:**

- ❌ Template publish endpoints
- ❌ Template publish tests
- ❌ Template publish logic

**Rationale:** DEFERRED per `CORE_V1_INTEGRATION_LOCK.md` Section 4.1

**Evidence:** `CORE_V1_INTEGRATION_LOCK.md` Section 4.1, Lines 138-153

---

### 11.4 Real Core Instance

**Forbidden:**

- ❌ Running real Core instance for tests
- ❌ Making real HTTP calls to Core
- ❌ Assuming Core behavior beyond Core Contract v1

**Rationale:** Integration tests verify Suite behavior, not Core behavior. Core Contract v1 is locked.

---

### 11.5 Fallback / Guessing Behaviors

**Forbidden:**

- ❌ Assume `suiteOrgId === coreOrgId`
- ❌ Create mapping without Core validation (even in tests)
- ❌ Retry indefinitely on Core failure
- ❌ Proceed on Core `404` / `401` / `500`
- ❌ Guess Core org exists

**Rationale:** Fail-closed enforcement per `ARCHITECTURAL_LAWS.md` LAW-10

**Evidence:** `ARCHITECTURAL_LAWS.md` LAW-10, Lines 134-142

---

### 11.6 New Test Infrastructure

**Forbidden:**

- ❌ Add new test database technology (SQLite, Postgres, etc.)
- ❌ Add Docker containers for testing
- ❌ Add new test infrastructure dependencies
- ❌ Specify DB technology in Gate 8.2 Execution

**Rationale:** NO NEW INFRA / NO NEW DEPS — use existing test harness only. Any new infrastructure requires separate gate.

**Evidence:** Fail-closed enforcement prevents infrastructure creep

---

## 12) Exit Criteria (PASS / FAIL)

### 12.1 PASS Criteria (Future Execution Gate)

**Gate 8.2 Execution is complete when:**

- [ ] Integration test file created (`org-mapping.integration.spec.ts`)
- [ ] All 16 scenarios implemented and passing
- [ ] Core client mocked/stubbed (no real Core calls)
- [ ] Fail-closed behavior verified (Core errors → no DB write)
- [ ] RBAC enforcement verified (all 4 roles tested)
- [ ] JWT protection verified (never logged/stored/exposed)
- [ ] Correlation ID propagation verified
- [ ] Audit logging verified (success + failure)
- [ ] All tests PASS (`npx jest tests/integration/org-mapping.integration.spec.ts` exit code 0)
- [ ] No tests skipped or marked `.todo`
- [ ] Evidence document created
- [ ] Completion report created
- [ ] Working tree clean (no uncommitted changes)

---

### 12.2 STOP Criteria (Immediate Halt)

**STOP immediately if:**

- [ ] Real Core instance used (instead of mock/stub)
- [ ] Core endpoint beyond `GET /api/v1/organizations/:id` called
- [ ] Service token mentioned or tested
- [ ] Prisma schema modified
- [ ] New dependencies added
- [ ] New test infrastructure proposed (SQLite, Postgres, Docker, etc.)
- [ ] Template publishing tested
- [ ] Fail-open behavior detected (Core error → mapping created)
- [ ] JWT stored in DB or logs
- [ ] JWT exposed to UI
- [ ] Any code changes outside `tests/integration/**` and `governance/**`
- [ ] Scope creep beyond Org Mapping integration tests

**Action on STOP:**

1. Halt all work immediately
2. Revert all changes
3. Escalate to Governance Authority
4. Do NOT proceed until violation resolved

---

## 13) Signature

**Prepared By:** Governance Authority  
**Date:** 2026-02-07  
**Status:** PROPOSED — AUTHORIZATION

**Approval Status:**

- [ ] Governance Authority: **\_\_\_\_\_\_\_\_** (Date: **\_\_\_\_**)

---

**END OF GATE 8.2 AUTHORIZATION**
