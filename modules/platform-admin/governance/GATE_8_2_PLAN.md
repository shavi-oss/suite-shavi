# Gate 8.2 — Integration Tests (Docs-Only Plan)

## Document Control

| Attribute      | Value                                    |
| -------------- | ---------------------------------------- |
| Gate Name      | Gate 8.2 — Integration Tests (Docs-Only) |
| Module Name    | platform-admin                           |
| Document Title | GATE_8_2_PLAN                            |
| Status         | PROPOSED — DOCS-ONLY PLAN                |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST  |
| Authority      | Governance Authority                     |
| Date           | 2026-02-07                               |

---

## 1) Purpose

**Objective:** Define Integration Tests scope for Org Mapping, deferred from Gate 8.1.

**Gate Type:** Docs-Only (Planning)

**Rationale:** Gate 8.1 completed with unit tests only. Integration tests were explicitly deferred to Gate 8.2 to maintain strict gate boundaries.

**Evidence:**

- `GATE_8_1_EXECUTION_AUTHORIZATION.md` Line 276 (Integration tests: DEFERRED to Gate 8.2)
- `GATE_8_1_COMPLETION_REPORT.md` Line 47 (Integration Tests: DEFERRED to Gate 8.2)
- `GATE_8_1_COMPLETION_REPORT.md` Line 193 (Status: DEFERRED to Gate 8.2)

---

## 2) Scope (Docs-Only)

**This Gate (8.2) Defines:**

1. Integration test scenarios (what to test)
2. Test file structure and location
3. Core isolation strategy (Mock/Stub approach)
4. PASS/STOP criteria for test execution

**This Gate Does NOT Include:**

- ❌ Writing actual test code (execution deferred to separate gate)
- ❌ Running tests
- ❌ Modifying any code files
- ❌ Modifying Prisma schema or dependencies
- ❌ Any changes outside `modules/platform-admin/governance/**`

---

## 3) Hard Lock Constraints

### 3.1 Core Endpoint (Unchanged from Gate 8.1)

**Allowed:** `GET /api/v1/organizations/:id` (ONLY)

**Evidence:** `GATE_8_1_EXECUTION_AUTHORIZATION.md` Section 2, Lines 49-79

**Forbidden:**

- ❌ Any Core endpoint beyond `GET /api/v1/organizations/:id`
- ❌ Template publish endpoints (DEFERRED per `CORE_V1_INTEGRATION_LOCK.md` Section 4.1)
- ❌ Service token endpoints (NOT AVAILABLE per `CORE_V1_INTEGRATION_LOCK.md` Section 5.1)

### 3.2 Service Tokens

**Status:** ❌ NOT AVAILABLE

**Evidence:** `CORE_V1_INTEGRATION_LOCK.md` Section 5.1, Lines 159-173

**Impact:** Integration tests MUST NOT assume or test service token flows.

### 3.3 Prisma / Dependencies

**Status:** ❌ FORBIDDEN

**Rationale:** Tables already defined in `MODULE_SCOPE_LOCK.md` Section 2.3

**Evidence:** `GATE_8_1_EXECUTION_AUTHORIZATION.md` Section 6.1, Lines 287-297

### 3.4 Scope Boundary

**Allowed Modifications (Future Execution Gate):**

- `modules/platform-admin/tests/integration/**` (test files only)
- `modules/platform-admin/governance/**` (evidence/completion docs)

**Forbidden:**

- ❌ Any changes outside `modules/platform-admin/**`
- ❌ Any changes to `src/**` (implementation complete in Gate 8.1)
- ❌ Any changes to `prisma/**`
- ❌ Any changes to `package.json`

---

## 4) Integration Test Scenarios

### 4.1 Org Mapping Creation

**Scenario 1: Core 200 → Mapping Created**

- **Given:** Valid `suiteOrgId` and `coreOrgId`, valid JWT
- **When:** POST `/api/platform-admin/org-mappings`
- **Then:**
  - Core client called with `GET /api/v1/organizations/:coreOrgId`
  - Core returns `200 OK`
  - Mapping created in Suite DB (`SuiteOrgMapping`)
  - Audit log created with `result: success`
  - Response contains mapping data

**Scenario 2: Core 404 → Mapping Rejected**

- **Given:** Valid `suiteOrgId`, non-existent `coreOrgId`, valid JWT
- **When:** POST `/api/platform-admin/org-mappings`
- **Then:**
  - Core client called with `GET /api/v1/organizations/:coreOrgId`
  - Core returns `404 Not Found`
  - **NO** mapping created in Suite DB (fail-closed)
  - Audit log created with `result: failure`, `reason: CORE_ORG_NOT_FOUND`
  - Response contains safe error code

**Scenario 3: Core 401 → Mapping Rejected**

- **Given:** Valid `suiteOrgId` and `coreOrgId`, invalid JWT
- **When:** POST `/api/platform-admin/org-mappings`
- **Then:**
  - Core client called with `GET /api/v1/organizations/:coreOrgId`
  - Core returns `401 Unauthorized`
  - **NO** mapping created in Suite DB (fail-closed)
  - Audit log created with `result: failure`, `reason: CORE_CLIENT_FAILED`
  - Response contains safe error code

**Scenario 4: Core 403 → Mapping Rejected**

- **Given:** Valid `suiteOrgId` and `coreOrgId`, JWT without permission
- **When:** POST `/api/platform-admin/org-mappings`
- **Then:**
  - Core client called with `GET /api/v1/organizations/:coreOrgId`
  - Core returns `403 Forbidden`
  - **NO** mapping created in Suite DB (fail-closed)
  - Audit log created with `result: failure`, `reason: CORE_CLIENT_FAILED`
  - Response contains safe error code

**Scenario 5: Core 5xx → Mapping Rejected**

- **Given:** Valid `suiteOrgId` and `coreOrgId`, valid JWT, Core experiencing failure
- **When:** POST `/api/platform-admin/org-mappings`
- **Then:**
  - Core client called with `GET /api/v1/organizations/:coreOrgId`
  - Core returns `500 Internal Server Error` or `503 Service Unavailable`
  - **NO** mapping created in Suite DB (fail-closed)
  - Audit log created with `result: failure`, `reason: CORE_CLIENT_FAILED`
  - Response contains safe error code

**Scenario 6: Core Timeout → Mapping Rejected**

- **Given:** Valid `suiteOrgId` and `coreOrgId`, valid JWT, Core not responding
- **When:** POST `/api/platform-admin/org-mappings`
- **Then:**
  - Core client called with `GET /api/v1/organizations/:coreOrgId`
  - Request times out
  - **NO** mapping created in Suite DB (fail-closed)
  - Audit log created with `result: failure`, `reason: CORE_CLIENT_FAILED`
  - Response contains safe error code

**Evidence:** `GATE_8_1_EXECUTION_AUTHORIZATION.md` Section 7.1, Lines 360-376

---

### 4.2 Org Mapping Lookup

**Scenario 7: Mapping Exists → Return coreOrgId**

- **Given:** Existing mapping for `suiteOrgId`, valid JWT with read permission
- **When:** GET `/api/platform-admin/org-mappings/:suiteOrgId`
- **Then:**
  - Mapping retrieved from Suite DB
  - Response contains `{ suiteOrgId, coreOrgId, createdAt, createdBy }`

**Scenario 8: Mapping Not Found → Safe Error**

- **Given:** Non-existent `suiteOrgId`, valid JWT with read permission
- **When:** GET `/api/platform-admin/org-mappings/:suiteOrgId`
- **Then:**
  - No mapping found in Suite DB
  - Audit log created with `result: failure`, `reason: MAPPING_NOT_FOUND`
  - Response contains safe error code

**Evidence:** `GATE_8_1_EXECUTION_AUTHORIZATION.md` Section 8.2, Lines 462-475

---

### 4.3 RBAC Enforcement

**Scenario 9: platform_admin → Can Create/Read**

- **Given:** JWT with `role: platform_admin`
- **When:** POST `/api/platform-admin/org-mappings` or GET `/api/platform-admin/org-mappings`
- **Then:** Request succeeds (subject to other validations)

**Scenario 10: developer_ops → Can Create/Read**

- **Given:** JWT with `role: developer_ops`
- **When:** POST `/api/platform-admin/org-mappings` or GET `/api/platform-admin/org-mappings`
- **Then:** Request succeeds (subject to other validations)

**Scenario 11: support → Can Read Only**

- **Given:** JWT with `role: support`
- **When:** GET `/api/platform-admin/org-mappings`
- **Then:** Request succeeds
- **When:** POST `/api/platform-admin/org-mappings`
- **Then:** Request denied with `403 Forbidden`

**Scenario 12: viewer → Can Read Only**

- **Given:** JWT with `role: viewer`
- **When:** GET `/api/platform-admin/org-mappings`
- **Then:** Request succeeds
- **When:** POST `/api/platform-admin/org-mappings`
- **Then:** Request denied with `403 Forbidden`

**Evidence:** `MODULE_SECURITY_LAWS.md` Section 3.2, Lines 72-83

---

### 4.4 JWT Protection

**Scenario 13: JWT Never in Responses**

- **Given:** Any request with valid JWT
- **When:** Any endpoint called
- **Then:**
  - Response body does NOT contain JWT
  - Response headers do NOT contain JWT (except `Authorization` header in request)

**Scenario 14: JWT Never in Logs**

- **Given:** Any request with valid JWT
- **When:** Any endpoint called
- **Then:**
  - Logs contain `Authorization: Bearer ***` (redacted)
  - Logs do NOT contain full JWT value

**Scenario 15: JWT Never in DB**

- **Given:** Mapping created successfully
- **When:** Querying `SuiteOrgMapping` or `PlatformAdminAuditLog` tables
- **Then:**
  - No JWT value stored in any column
  - No JWT in `metadata` JSONB field

**Evidence:** `GATE_8_1_EXECUTION_AUTHORIZATION.md` Section 8.3, Lines 479-492

---

### 4.5 Correlation ID Propagation

**Scenario 16: Correlation ID in Audit Metadata**

- **Given:** Request with `X-Correlation-Id` header
- **When:** Any mapping operation (create/lookup)
- **Then:**
  - Audit log created with `correlationId` matching request header
  - Correlation ID present in audit metadata

**Evidence:** `GATE_8_1_EXECUTION_AUTHORIZATION.md` Section 7.3, Lines 405-436

---

## 5) Test File Structure

**Proposed File:**

```
modules/platform-admin/tests/integration/org-mapping.integration.spec.ts
```

**Rationale:**

- Single file for all Org Mapping integration tests
- Follows existing test structure pattern
- Isolated from unit tests (`tests/unit/**`)

**Test Harness:**

- Use existing NestJS testing module (`@nestjs/testing`)
- Mock/Stub Core HTTP client (no real Core instance)
- Use existing test harness ONLY (NO NEW INFRA / NO NEW DEPS)

---

## 6) Core Isolation Strategy

**Approach:** Mock/Stub Core HTTP Client

**Rationale:**

- Core v1 contract is locked (`CORE_V1_INTEGRATION_LOCK.md`)
- Integration tests verify Suite behavior, not Core behavior
- No real Core instance required for Suite integration tests

**Implementation (Future Execution Gate):**

1. **Mock Core Client:**
   - Stub `core.client.ts` methods
   - Return predefined responses (200, 404, 401, 403, 500, timeout)
   - Verify Core client called with correct parameters

2. **Test Database:**
   - Use existing test harness ONLY (NO NEW INFRA / NO NEW DEPS)
   - DB strategy TBD in separate gate if new infra required
   - Seed with test data (Suite orgs)
   - Verify DB state after operations

3. **No Real Core:**
   - Do NOT run actual Core instance
   - Do NOT make real HTTP calls to Core
   - All Core responses are stubbed

**Evidence:** `CORE_V1_INTEGRATION_LOCK.md` Section 2 (Source of Truth)

---

## 7) PASS/STOP Criteria

### 7.1 PASS Criteria (Future Execution Gate)

**Integration tests PASS when:**

- [ ] All 16 scenarios implemented and passing
- [ ] Core client mocked/stubbed (no real Core calls)
- [ ] Fail-closed behavior verified (Core errors → no DB write)
- [ ] RBAC enforcement verified (all 4 roles tested)
- [ ] JWT protection verified (never logged/stored/exposed)
- [ ] Correlation ID propagation verified
- [ ] All tests run with `npx jest tests/integration/org-mapping.integration.spec.ts`
- [ ] Exit code 0 (all tests pass)
- [ ] No test skipped or marked `.todo`

### 7.2 STOP Criteria (Immediate Halt)

**STOP immediately if:**

- [ ] Real Core instance used (instead of mock/stub)
- [ ] Core endpoint beyond `GET /api/v1/organizations/:id` called
- [ ] Service token mentioned or tested
- [ ] Prisma schema modified
- [ ] New dependencies added
- [ ] Template publishing tested
- [ ] Fail-open behavior detected (Core error → mapping created)
- [ ] JWT stored in DB or logs
- [ ] JWT exposed to UI
- [ ] Any code changes outside `tests/integration/**` and `governance/**`

**Action on STOP:**

1. Halt all work immediately
2. Revert all changes
3. Escalate to Governance Authority
4. Do NOT proceed until violation resolved

---

## 8) Exit Criteria (Gate 8.2 Docs-Only)

**Gate 8.2 (Docs-Only) is complete when:**

- [x] Plan document created (`GATE_8_2_PLAN.md`)
- [x] Checklist document created (`GATE_8_2_CHECKLIST.md`)
- [x] Authorization document created (`GATE_8_2_AUTHORIZATION.md`)
- [x] All 16 integration test scenarios defined
- [x] Test file structure proposed
- [x] Core isolation strategy documented
- [x] PASS/STOP criteria explicit
- [x] No new Core claims beyond Core Contract v1
- [x] No code written (docs-only)
- [x] No tests written (docs-only)
- [x] No Prisma/deps/infra changes proposed

---

## 9) Next Steps (Future Execution Gate)

**After Gate 8.2 Approval:**

1. Create new execution gate (e.g., Gate 8.2 Execution)
2. Implement integration tests per this plan
3. Run tests and verify PASS criteria
4. Create evidence and completion report
5. Tag and close execution gate

**Approval Required:** Governance Authority must approve this plan before execution gate.

---

## 10) Signature

**Prepared By:** Governance Authority  
**Date:** 2026-02-07  
**Status:** PROPOSED — DOCS-ONLY PLAN

**Approval Status:**

- [ ] Governance Authority: **\_\_\_\_\_\_\_\_** (Date: **\_\_\_\_**)

---

**END OF GATE 8.2 PLAN**
