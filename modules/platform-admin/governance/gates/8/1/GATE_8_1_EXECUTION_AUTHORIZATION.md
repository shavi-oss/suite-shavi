# Gate 8.1 — Org Mapping (Execution Authorization)

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Gate Name      | Gate 8.1 — Org Mapping (Execution)      |
| Module Name    | platform-admin                          |
| Document Title | GATE_8_1_EXECUTION_AUTHORIZATION        |
| Status         | PROPOSED — EXECUTION AUTHORIZATION      |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority                    |
| Date           | 2026-02-07                              |

---

## 1) Authorization Scope (Binding)

**Gate Type:** Execution (Code + Tests)

**Objective:** Implement Suite → Core organization mapping with strict fail-closed validation

**Authorized Work:**

- Implement Org Mapping endpoints (BFF)
- Implement Org Mapping service layer
- Implement Core client integration (`GET /api/v1/organizations/:id` ONLY)
- Implement audit logging for mapping operations
- Implement unit and integration tests

**Scope Boundary:**

- **SUITE-ONLY** feature
- Within `MODULE_SCOPE_LOCK.md` Section 2.2 (BFF Endpoints) and Section 2.3 (Database Tables)
- No Prisma schema changes (tables already defined)
- No new dependencies
- No Core modifications

**Evidence:**

- `MODULE_SCOPE_LOCK.md` Section 2.2 (Org Mapping Management endpoints)
- `MODULE_SCOPE_LOCK.md` Section 2.3 (`SuiteOrgMapping` table)
- `MODULE_DATA_OWNERSHIP.md` (Suite-owned data)

---

## 2) Allowed Core Interaction (Hard Lock)

**Endpoint:** `GET /api/v1/organizations/:id` (ONLY)

**Purpose:** Validate Core organizationId exists before creating Suite mapping

**Evidence:**

- `CORE_CONTRACT_V1_EXTRACT.md` Section B.8, Lines 174-184
- Controller: `organizations.controller.ts`
- Guards: `JwtAuthGuard`, `TenantGuard`

**Request Pattern:**

```http
GET /api/v1/organizations/:id
Authorization: Bearer <user-scoped-jwt>
```

**Expected Responses:**

- `200 OK` — Core org exists (proceed with mapping)
- `404 Not Found` — Core org does not exist (fail-closed, reject mapping)
- `401 Unauthorized` — JWT invalid (fail-closed, reject mapping)
- `500 Internal Server Error` — Core failure (fail-closed, reject mapping)

**Fail-Closed Rule:**

- ANY response other than `200 OK` → REJECT mapping creation
- NO fallback behavior
- NO guessing
- NO retry loops (single attempt with timeout)

---

**Forbidden Core Endpoints:**

- ❌ `POST /api/v1/organizations` — Suite does NOT create Core orgs
- ❌ `PATCH /api/v1/organizations/:id` — Suite does NOT modify Core orgs
- ❌ `DELETE /api/v1/organizations/:id` — Suite does NOT delete Core orgs
- ❌ Any template publish endpoints (DEFERRED per `CORE_V1_INTEGRATION_LOCK.md` Section 4.1)
- ❌ Any service token endpoints (NOT AVAILABLE per `CORE_V1_INTEGRATION_LOCK.md` Section 5.1)
- ❌ Any endpoint not explicitly authorized above

**Evidence:** `CORE_CONTRACT_V1_EXTRACT.md` Section B.8

---

## 3) Auth & Token Rules (Hard Lock)

### 3.1 User-Scoped JWT Forwarding

**Mechanism:** Forward validated user-scoped JWT as-is to Core

**Flow:**

1. Suite BFF receives request with Suite-issued JWT
2. Suite validates JWT (user authentication)
3. Suite forwards JWT to Core in `Authorization: Bearer <token>` header
4. Core validates JWT using shared secret

**Evidence:**

- `CORE_CONTRACT_V1_EXTRACT.md` Section D.1, Lines 357-413
- `CORE_V1_INTEGRATION_LOCK.md` Section 3.2
- JWT claims: `sub` (User ID), `email`, `organizationId`

**MUST:**

- Forward JWT as-is (no modification)
- Include `Authorization: Bearer <token>` header in Core requests

**MUST NOT:**

- Modify JWT claims
- Strip JWT headers
- Cache JWT beyond request lifecycle
- Store JWT in Suite DB
- Log JWT value (log presence only)
- Expose JWT to UI

---

### 3.2 Service Tokens: NOT AVAILABLE

**Status:** ❌ NOT AVAILABLE

**Evidence:**

- `CORE_V1_INTEGRATION_LOCK.md` Section 5.1, Lines 159-173
- No service token contract in Core v1
- No OAuth2 client credentials flow
- No service account endpoints

**Impact:**

- Suite MUST NOT implement service token acquisition
- Suite MUST NOT assume Core service token refresh
- Suite uses user-scoped JWT for ALL Core API calls

---

### 3.3 JWT Protection Rules

**MUST NOT:**

- Store JWT in Suite DB
- Log JWT value (log `Authorization: Bearer ***` only)
- Expose JWT to UI responses
- Mint or construct Core JWTs
- Cache JWT beyond single request

**Evidence:**

- `ARCHITECTURAL_LAWS.md` LAW-5 (Token & Identity Separation)
- `MODULE_SECURITY_LAWS.md` Section 3.5 (JWT Protection)

---

## 4) Data & Tables (Hard Lock)

### 4.1 Allowed Tables

**SuiteOrgMapping** (Suite-Owned):

```typescript
{
  suiteOrgId: string (UUID, primary key, FK to SuiteOrganization)
  coreOrgId: string (external reference, unique)
  createdAt: timestamp
  updatedAt: timestamp
  createdBy: string (internal user ID)
}
```

**Evidence:**

- `MODULE_SCOPE_LOCK.md` Section 2.3, Lines 113-123
- `MODULE_DATA_OWNERSHIP.md` (Suite-owned data)

**PlatformAdminAuditLog** (Suite-Owned):

```typescript
{
  id: string (UUID, primary key)
  correlationId: string (indexed)
  entityType: enum (organization, org_mapping, internal_user)
  entityId: string
  action: enum (create, update, suspend, unsuspend, link, deactivate)
  performedBy: string (internal user ID)
  performedAt: timestamp
  result: enum (success, failure)
  metadata: jsonb (additional context, no secrets)
}
```

**Evidence:**

- `MODULE_SCOPE_LOCK.md` Section 2.3, Lines 140-154
- `MODULE_DATA_OWNERSHIP.md` (Suite-owned data)

---

### 4.2 Forbidden Data Storage

**MUST NOT store:**

- ❌ Core organization details (name, status, etc.) — Core-owned data
- ❌ Core user details — Core-owned data
- ❌ Core workflow data — Core-owned data
- ❌ JWT tokens — Security violation
- ❌ Secrets in audit logs — Security violation
- ❌ Any Core data beyond `coreOrgId` reference

**Evidence:**

- `ARCHITECTURAL_LAWS.md` LAW-8 (Module Ownership & Data Ownership)
- `MODULE_DATA_OWNERSHIP.md`

---

### 4.3 Prisma Schema Changes

**Status:** ❌ FORBIDDEN

**Rationale:** Tables already defined in `MODULE_SCOPE_LOCK.md` Section 2.3

**MUST NOT:**

- Modify `schema.prisma`
- Create new migrations
- Add new tables
- Modify existing table schemas

**Evidence:** `MODULE_SCOPE_LOCK.md` Section 2.3

---

## 5) Execution Allowed Paths

**File Creation / Modification Allowed:**

**Controllers:**

- `modules/platform-admin/src/controllers/org-mapping.controller.ts`

**Services:**

- `modules/platform-admin/src/services/org-mapping.service.ts`

**Repositories:**

- `modules/platform-admin/src/repositories/org-mapping.repository.ts`

**DTOs:**

- `modules/platform-admin/src/dto/org-mapping/create-org-mapping.dto.ts`
- `modules/platform-admin/src/dto/org-mapping/org-mapping-response.dto.ts`

**Core Client:**

- `modules/platform-admin/src/core-adapter/core.client.ts` (enhance error handling ONLY)

**Tests:**

- `modules/platform-admin/tests/unit/core-adapter/core.client.spec.ts` (enhanced with fail-closed tests)
- `modules/platform-admin/tests/unit/services/org-mapping.service.spec.ts` (pre-existing)
- `modules/platform-admin/tests/unit/repositories/org-mapping.repository.spec.ts` (pre-existing)
- `modules/platform-admin/tests/unit/controllers/org-mapping.controller.spec.ts` (pre-existing)
- Integration tests: **DEFERRED to Gate 8.2**

**Governance (Evidence):**

- `modules/platform-admin/governance/GATE_8_1_EVIDENCE.md`
- `modules/platform-admin/governance/GATE_8_1_COMPLETION_REPORT.md`

---

## 6) Explicit NO List (STOP)

### 6.1 Prisma / Migrations

**Forbidden:**

- ❌ Modify `schema.prisma`
- ❌ Create new migrations
- ❌ Run `prisma migrate`
- ❌ Add new tables

**Rationale:** Tables already defined in `MODULE_SCOPE_LOCK.md`

---

### 6.2 Dependencies

**Forbidden:**

- ❌ Add new npm packages
- ❌ Modify `package.json` dependencies
- ❌ Install new libraries

**Rationale:** All required dependencies already available

---

### 6.3 Template Publishing

**Forbidden:**

- ❌ Template publish endpoints
- ❌ Template publish UI
- ❌ Template publish logic

**Rationale:** DEFERRED per `CORE_V1_INTEGRATION_LOCK.md` Section 4.1

**Evidence:** `CORE_V1_INTEGRATION_LOCK.md` Section 4.1, Lines 138-153

---

### 6.4 Fallback / Guessing Behaviors

**Forbidden:**

- ❌ Assume `suiteOrgId === coreOrgId`
- ❌ Create mapping without Core validation
- ❌ Retry indefinitely on Core failure
- ❌ Proceed on Core `404` / `401` / `500`
- ❌ Guess Core org exists

**Rationale:** Fail-closed enforcement per `ARCHITECTURAL_LAWS.md` LAW-10

**Evidence:** `ARCHITECTURAL_LAWS.md` LAW-10, Lines 134-142

---

### 6.5 Out-of-Scope Endpoints

**Forbidden:**

- ❌ Any Core endpoint beyond `GET /api/v1/organizations/:id`
- ❌ Customer user management
- ❌ Workflow triggers
- ❌ Billing or subscription features
- ❌ Real-time notifications

**Rationale:** Outside `MODULE_SCOPE_LOCK.md` Section 2

**Evidence:** `MODULE_SCOPE_LOCK.md` Section 3 (Forbidden Scope Expansions)

---

## 7) Mandatory Invariants

### 7.1 Core Validation Before Mapping

**Invariant:** Suite MUST validate Core org exists before creating mapping

**Enforcement:**

1. Receive request: `{ suiteOrgId, coreOrgId }`
2. Call `GET /api/v1/organizations/:coreOrgId` with user JWT
3. If `200 OK` → proceed to step 4
4. If NOT `200 OK` → fail-closed:
   - Reject mapping creation
   - Return safe error code (e.g., `CORE_ORG_NOT_FOUND`, `CORE_CLIENT_FAILED`)
   - Audit log failure with correlation ID
   - Do NOT create mapping

**Evidence:** `GATE_8_PLAN.md` Section 5.1

---

### 7.2 Fail-Closed on Error

**Invariant:** ANY error → REJECT operation

**Scenarios:**

- Core returns `404` → Reject mapping (org does not exist)
- Core returns `401` → Reject mapping (JWT invalid)
- Core returns `500` → Reject mapping (Core failure)
- Core timeout → Reject mapping (network failure)
- Mapping already exists → Reject mapping (duplicate)
- Mapping lookup fails → Reject request (no mapping)

**No Fallback:**

- Do NOT create mapping on error
- Do NOT assume org exists
- Do NOT proceed without validation

**Evidence:**

- `ARCHITECTURAL_LAWS.md` LAW-10 (Fail-Closed By Default)
- `MODULE_SECURITY_LAWS.md` Section 5 (Fail-Closed Enforcement)

---

### 7.3 Audit Mandatory (Success + Failure)

**Invariant:** EVERY mapping operation MUST be audited

**Events:**

**Mapping Create Success:**

- Entity Type: `org_mapping`
- Action: `create`
- Result: `success`
- Metadata: `{ suiteOrgId, coreOrgId, correlationId }`

**Mapping Create Failure:**

- Entity Type: `org_mapping`
- Action: `create`
- Result: `failure`
- Metadata: `{ suiteOrgId, coreOrgId, correlationId, reason: "CORE_ORG_NOT_FOUND" | "CORE_CLIENT_FAILED" | "DUPLICATE_MAPPING" }`

**Mapping Lookup Failure:**

- Entity Type: `org_mapping`
- Action: `lookup`
- Result: `failure`
- Metadata: `{ suiteOrgId, correlationId, reason: "MAPPING_NOT_FOUND" }`

**Evidence:**

- `GATE_8_PLAN.md` Section 6
- `MODULE_SECURITY_LAWS.md` Section 3.4 (Audit Log Integrity)

---

## 8) Required Tests

### 8.1 Core Validation Tests

**MUST test:**

- [ ] Core returns `200 OK` → mapping created successfully
- [ ] Core returns `404 Not Found` → mapping creation rejected, no DB write
- [ ] Core returns `401 Unauthorized` → mapping creation rejected, no DB write
- [ ] Core returns `500 Internal Server Error` → mapping creation rejected, no DB write
- [ ] Core timeout → mapping creation rejected, no DB write

**Evidence Required:**

- Unit test showing Core `404` → fail-closed behavior
- Unit test showing Core `401` → fail-closed behavior
- Unit test showing fail-closed behavior on error

**Integration Tests:** DEFERRED to Gate 8.2

---

### 8.2 Mapping Lookup Tests

**MUST test:**

- [ ] Mapping exists → return `coreOrgId`
- [ ] Mapping does NOT exist → reject request, return safe error
- [ ] Duplicate mapping → reject creation, return safe error
- [ ] Ambiguous mapping (should be impossible) → reject, return safe error

**Evidence Required:**

- Unit test showing missing mapping → deny request
- Unit test showing duplicate mapping → reject creation

**Integration Tests:** DEFERRED to Gate 8.2

---

### 8.3 JWT Protection Tests

**MUST test:**

- [ ] JWT never logged (verify logs contain `Authorization: Bearer ***` only)
- [ ] JWT never stored in DB (verify no JWT in `SuiteOrgMapping` or `PlatformAdminAuditLog`)
- [ ] JWT never exposed to UI (verify response DTOs exclude JWT)

**Evidence Required:**

- Unit test verifying JWT redaction in logs
- Integration test verifying JWT not in DB
- Unit test verifying JWT not in response DTOs

---

### 8.4 RBAC Tests

**MUST test:**

- [ ] `platform_admin` → can create/read mappings
- [ ] `developer_ops` → can create/read mappings
- [ ] `support` → can read mappings, CANNOT create
- [ ] `viewer` → can read mappings, CANNOT create
- [ ] Unauthenticated → CANNOT access any endpoint

**Evidence Required:**

- Unit tests for each role showing allowed/denied operations
- Integration tests verifying RBAC enforcement

**RBAC Matrix Evidence:** `MODULE_SECURITY_LAWS.md` Section 3.2

---

### 8.5 Audit Log Tests

**MUST test:**

- [ ] Mapping create success → audit log created
- [ ] Mapping create failure → audit log created with failure reason
- [ ] Mapping lookup failure → audit log created
- [ ] Audit logs are immutable (append-only)
- [ ] Audit logs contain correlation ID

**Evidence Required:**

- Unit test verifying audit log on success (via service layer)
- Unit test verifying audit log on failure (via service layer)
- Unit test verifying audit log immutability

**Integration Tests:** DEFERRED to Gate 8.2

---

## 9) Exit Criteria (PASS / FAIL)

### 9.1 PASS Criteria

**Gate 8.1 is complete when:**

- [ ] All endpoints implemented (`POST /org-mappings`, `GET /org-mappings`, `GET /org-mappings/:suiteOrgId`)
- [ ] Core validation implemented (`GET /api/v1/organizations/:id` ONLY)
- [ ] Fail-closed behavior verified (Core `404`/`401`/`500` → no mapping)
- [ ] Audit logging implemented (success + failure)
- [ ] JWT protection verified (never logged/stored/exposed)
- [ ] RBAC enforced (per `MODULE_SECURITY_LAWS.md` Section 3.2)
- [ ] All required tests PASS (100% coverage for Org Mapping)
- [ ] Jest PASS (`npx jest` exit code 0)
- [ ] TSC PASS (`npx tsc --noEmit` exit code 0)
- [ ] Working tree clean (no uncommitted changes)
- [ ] Evidence document created (`GATE_8_1_EVIDENCE.md`)
- [ ] Completion report created (`GATE_8_1_COMPLETION_REPORT.md`)

---

### 9.2 STOP Criteria (Immediate Halt)

**STOP immediately if:**

- [ ] Any Core endpoint beyond `GET /api/v1/organizations/:id` used
- [ ] Service token mentioned or implemented
- [ ] Prisma schema modified
- [ ] New dependencies added
- [ ] Template publishing implemented
- [ ] Fallback behavior on Core error (e.g., "assume org exists")
- [ ] JWT stored in DB or logs
- [ ] JWT exposed to UI
- [ ] Fail-open behavior detected
- [ ] Scope creep beyond Org Mapping

**Action on STOP:**

1. Halt all work immediately
2. Revert all changes
3. Escalate to Governance Authority
4. Do NOT proceed until violation resolved

---

## 10) Signature

**Prepared By:** Governance Authority  
**Date:** 2026-02-07  
**Status:** PROPOSED — EXECUTION AUTHORIZATION

**Approval Status:**

- [ ] Governance Authority: **\*\***\_\_\_\_**\*\*** (Date: **\_\_\_\_**)

---

**END OF GATE 8.1 EXECUTION AUTHORIZATION**
