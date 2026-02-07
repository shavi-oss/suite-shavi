# Gate 8 — Org Mapping (Governance-Only)

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Gate Name      | Gate 8 — Org Mapping (Docs-Only)        |
| Module Name    | platform-admin                          |
| Document Title | GATE_8_PLAN                             |
| Status         | PROPOSED — GOVERNANCE PACKAGE           |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority                    |
| Date           | 2026-02-07                              |

---

## 1) Purpose

This document defines the **governance-only** scope for Gate 8 — Org Mapping. This gate establishes the **legal and contractual foundation** for future implementation of Suite → Core organization mapping, without executing any code changes.

**Objective:** Create binding documentation that defines:

- Org Mapping contract (Suite-only behavior)
- Core touchpoints (read-only validation)
- Token rules (user-scoped JWT forwarding only)
- Fail-closed invariants
- Explicit out-of-scope boundaries

---

## 2) Scope (Docs-Only)

### 2.1 What Will Be Documented

**Org Mapping Contract (Suite-Only):**

- One-to-one mapping: `SuiteOrgMapping.suiteOrgId` ↔ `SuiteOrgMapping.coreOrgId`
- No guessing / No fallback
- Fail-closed on missing or invalid mapping

**Core Touchpoints:**

- `GET /api/v1/organizations/:id` — Validate Core org exists before creating mapping
- Evidence: `CORE_CONTRACT_V1_EXTRACT.md` Section B.8, Lines 174-184

**Token Rules:**

- Forward validated user-scoped JWT (from Suite auth) to Core
- Service tokens: **NOT AVAILABLE** (per `CORE_V1_INTEGRATION_LOCK.md` Section 5.1)

**Audit Hooks:**

- Mandatory audit log on mapping create
- Mandatory audit log on mapping validation failure

**STOP Conditions:**

- Any Core claim not proven by canonical sources = STOP
- Any assumption about Core behavior = STOP
- Any scope creep beyond Org Mapping = STOP

---

### 2.2 What Will NOT Be Documented

**Out of Scope:**

- Controllers implementation (`OrgMappingController`)
- Services implementation (`OrgMappingService`)
- Repositories implementation (`OrgMappingRepository`)
- Prisma schema changes or migrations
- RBAC implementation details
- Any additional Core endpoints beyond `GET /api/v1/organizations/:id`
- Service token acquisition (NOT AVAILABLE)
- Template publishing (DEFERRED per `CORE_V1_INTEGRATION_LOCK.md` Section 4.1)

---

## 3) Core Touchpoints (Binding)

### 3.1 Allowed Core Endpoint

**Endpoint:** `GET /api/v1/organizations/:id`

**Purpose:** Validate that Core organizationId exists before creating Suite mapping

**Evidence:**

- `CORE_CONTRACT_V1_EXTRACT.md` Section B.8, Lines 174-184
- Controller: `organizations.controller.ts`
- Guards: `JwtAuthGuard`, `TenantGuard`

**Request:**

```http
GET /api/v1/organizations/:id
Authorization: Bearer <user-scoped-jwt>
```

**Expected Responses:**

- `200 OK` — Core org exists (proceed with mapping creation)
- `404 Not Found` — Core org does not exist (fail-closed, reject mapping)
- `401 Unauthorized` — JWT invalid (fail-closed, reject mapping)

**Fail-Closed Rule:**

- If Core returns anything other than `200 OK`, Suite MUST reject mapping creation
- No fallback / No guessing

---

### 3.2 Forbidden Core Endpoints

**NOT AVAILABLE:**

- ❌ `POST /api/v1/organizations` — Suite does NOT create Core orgs
- ❌ `PATCH /api/v1/organizations/:id` — Suite does NOT modify Core orgs
- ❌ `DELETE /api/v1/organizations/:id` — Suite does NOT delete Core orgs
- ❌ Any template publish endpoints (DEFERRED per `CORE_V1_INTEGRATION_LOCK.md` Section 4.1)
- ❌ Any service token endpoints (NOT AVAILABLE per `CORE_V1_INTEGRATION_LOCK.md` Section 5.1)

**Evidence:** `CORE_CONTRACT_V1_EXTRACT.md` Section B.8 lists only 2 endpoints: `POST` and `GET :id`

---

## 4) Token Rules (Binding)

### 4.1 Allowed Token Type

**User-Scoped JWT (Suite-Issued):**

- Suite validates user authentication
- Suite issues JWT with user claims
- Suite forwards JWT to Core in `Authorization: Bearer <token>` header
- Core validates JWT using shared secret (per `CORE_CONTRACT_V1_EXTRACT.md` Section D.1)

**Evidence:**

- `CORE_CONTRACT_V1_EXTRACT.md` Section D.1, Lines 357-413
- JWT claims: `sub` (User ID), `email`, `organizationId`

---

### 4.2 Forbidden Token Types

**Service Tokens: NOT AVAILABLE**

**Evidence:**

- `CORE_V1_INTEGRATION_LOCK.md` Section 5.1, Lines 159-173
- No service token contract in Core v1
- No OAuth2 client credentials flow
- No service account endpoints

**Impact:**

- Suite MUST NOT implement service token acquisition
- Suite MUST NOT assume Core service token refresh mechanism
- Suite uses user-scoped JWT for all Core API calls

---

## 5) Fail-Closed Invariants (Binding)

### 5.1 Mapping Creation

**Invariant:** Suite MUST validate Core org exists before creating mapping

**Enforcement:**

1. Suite receives request to create mapping: `{ suiteOrgId, coreOrgId }`
2. Suite calls `GET /api/v1/organizations/:coreOrgId` with user JWT
3. If Core returns `200 OK`, proceed to step 4
4. If Core returns anything else (`404`, `401`, `500`, etc.), fail-closed:
   - Reject mapping creation
   - Return safe error to client (no Core error details)
   - Audit log failure with correlation ID

**No Fallback:**

- Do NOT create mapping if Core validation fails
- Do NOT guess or assume Core org exists
- Do NOT retry indefinitely

---

### 5.2 Mapping Lookup

**Invariant:** Suite MUST fail-closed if mapping does not exist

**Enforcement:**

1. Suite receives request requiring Core org ID
2. Suite queries `SuiteOrgMapping` table for `suiteOrgId`
3. If mapping exists, use `coreOrgId`
4. If mapping does NOT exist, fail-closed:
   - Reject request
   - Return safe error to client
   - Audit log failure

**No Fallback:**

- Do NOT assume `suiteOrgId === coreOrgId`
- Do NOT create mapping on-the-fly
- Do NOT proceed without valid mapping

---

## 6) Audit Hooks (Binding)

### 6.1 Mandatory Audit Events

**Mapping Create Success:**

- Entity Type: `org_mapping`
- Action: `create`
- Result: `success`
- Metadata: `{ suiteOrgId, coreOrgId, correlationId }`

**Mapping Create Failure:**

- Entity Type: `org_mapping`
- Action: `create`
- Result: `failure`
- Metadata: `{ suiteOrgId, coreOrgId, correlationId, reason: "CORE_ORG_NOT_FOUND" | "CORE_CLIENT_FAILED" }`

**Mapping Lookup Failure:**

- Entity Type: `org_mapping`
- Action: `lookup`
- Result: `failure`
- Metadata: `{ suiteOrgId, correlationId, reason: "MAPPING_NOT_FOUND" }`

---

## 7) STOP Conditions (Binding)

**STOP immediately if:**

- Any Core claim not proven by canonical sources (`CORE_CONTRACT_V1_EXTRACT.md`, `CORE_CONTRACT_V1_LOCK_DECLARATION.md`, `CORE_V1_INTEGRATION_LOCK.md`)
- Any assumption about Core behavior (e.g., "Core probably supports X")
- Service token mentioned or assumed
- Any Core endpoint beyond `GET /api/v1/organizations/:id` added
- Scope creep beyond Org Mapping (e.g., template publish, workflow triggers)
- Any implementation code or tests created (Gate 8 is docs-only)

---

## 8) Out of Scope (Explicit)

**Forbidden in Gate 8:**

- ❌ Controllers / Services / Repositories implementation
- ❌ Prisma schema changes or migrations
- ❌ RBAC implementation
- ❌ Unit tests or integration tests
- ❌ Any Core endpoint beyond `GET /api/v1/organizations/:id`
- ❌ Service token acquisition (NOT AVAILABLE)
- ❌ Template publishing (DEFERRED)
- ❌ Workflow triggers
- ❌ Customer user management
- ❌ Billing or subscription features

---

## 9) Acceptance Criteria

Gate 8 is complete when:

- [x] `GATE_8_PLAN.md` created (this document)
- [x] `GATE_8_CHECKLIST.md` created
- [x] `GATE_8_AUTHORIZATION.md` created
- [x] All Core claims backed by evidence from canonical sources
- [x] Fail-closed invariants explicitly documented
- [x] Out-of-scope items explicitly listed
- [x] No implementation code or tests created

---

## 10) Signature

**Prepared By:** Governance Authority  
**Date:** 2026-02-07  
**Status:** PROPOSED — GOVERNANCE PACKAGE

---

**END OF GATE 8 PLAN**
