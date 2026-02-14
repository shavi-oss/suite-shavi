# Bassan — Runtime Risk Audit: Tenant Boundaries & Permissions Enforcement
**Date:** 2026-02-01  
**Scope:** Identify & eliminate the highest-risk execution gaps that can break real-world deployment even if specs are “aligned”.  
**Primary Risks:** (1) Tenant boundary leaks, (2) Permission enforcement drift (runtime vs docs).  
**Output:** A deterministic checklist + evidence requirements to reach “production-safe”.

---

## 0) Why this is the highest risk
Even with perfect docs alignment, the system can still fail in production if:
- tenant context is not enforced *everywhere*
- authorization is inconsistently applied (some endpoints guarded, others not)
- background jobs/webhooks bypass tenant constraints
- logs/events expose cross-tenant PII

This audit is designed to find those gaps with **code evidence** and **repeatable tests**.

---

## 1) Hard Stop Conditions (Immediate Halt)
Stop execution and open a governance incident if ANY is true:
1. Any request can access another tenant’s record by ID (IDOR / cross-tenant read/write)
2. Any endpoint with write behavior is reachable without auth guard
3. Any job/webhook processes data without verified orgId/tenant scope
4. Any “admin” or “platform” capability exists without strict separation and audit

---

## 2) Required Inputs (Workspace Paths)
Use inside LDE:
- Core code: `backend/src/**`
- Governance bundle: `backend/governance/**`
- Stage docs/artifacts: `backend/**` (Gate/Stage docs)

**Source of truth**: code behavior. Docs must mirror it.

---

## 3) Audit Deliverables (Files to produce)
Create/Update these docs in `backend/governance/`:

1) `TENANT_BOUNDARY_AUDIT.md`
- What enforces org boundary (CLS/JWT/guards)
- Where it is applied (controllers/services/repos/jobs/webhooks)
- Evidence lines + proof tests

2) `PERMISSION_ENFORCEMENT_AUDIT.md`
- Which endpoints enforce what
- Which do not
- Drift list + required docs corrections

3) `SECURITY_STOP_CONDITIONS.md`
- Canonical stop conditions (IDOR, auth bypass, tenant leak, PII leak)
- What to do when triggered

4) Update existing:
- `03_PERMISSIONS_MATRIX.md` (if runtime keys differ)
- `02_API_CONTRACTS.md` (if endpoint shapes differ)
- `06_EVENTS_AND_OBSERVABILITY.md` (if requestId/correlationId not present in core)

---

## 4) Tenant Boundary Audit (Deep Checklist)

### 4.1 Extract Tenant Context (Truth from code)
Find in code:
- JWT claims extraction (must include `organizationId`)
- CLS keys (e.g. `orgId`, `userId`)
- Middleware/guard that binds JWT → CLS

**Evidence Required**
- file paths + line ranges showing:
  - claim names
  - CLS set/get
  - request lifecycle placement

**Pass Criteria**
- Every request sets tenant context before controllers run
- tenant context is required (fail-closed if missing)

### 4.2 Database Access (Query Scoping)
Search all DB access patterns:
- Prisma queries
- repositories
- raw SQL
- service-level fetch by id

**Rules**
- Every read/write must include `organizationId = currentOrgId`
- Any `findUnique({ where: { id } })` without org filter is **suspect**

**Pass Criteria**
- No entity fetch/update/delete occurs without tenant scope
- Exceptions allowed only for truly global tables (and must be documented)

### 4.3 Controllers: Endpoint-by-Endpoint Boundary
For each controller method:
- verify guard present
- verify orgId enforced before touching DB
- verify response does not leak other tenant fields

**Pass Criteria**
- No controller can access cross-tenant resources via ID parameters

### 4.4 Background Jobs: Tenant Propagation
For every job handler:
- confirm it receives `organizationId` in payload
- confirm it sets CLS or explicitly scopes queries
- confirm retries do not lose org scope

**Pass Criteria**
- Jobs cannot run “unscoped”

### 4.5 Webhooks: External Ingress Safety
For webhook endpoints:
- validate signature
- validate timestamp/replay protection (if implemented)
- resolve tenant explicitly (by config lookup) then enforce tenant scope

**Pass Criteria**
- No webhook event can be processed without known orgId

---

## 5) Permission Enforcement Audit (Deep Checklist)

### 5.1 Identify Runtime Authorization Model
Determine truth:
- Is it RBAC roles?
- Permission keys?
- Combination?
- Which guard enforces it?

**Pass Criteria**
- A single canonical enforcement strategy exists OR layering is explicitly documented

### 5.2 Endpoint Permission Mapping
For every endpoint in runtime:
- list required permission(s)
- list guard used
- list failure behavior (403 vs 401)
- confirm docs mapping matches runtime names

**Pass Criteria**
- All write endpoints enforce explicit permission or role
- Any missing enforcement becomes a STOP CONDITION

### 5.3 Implicit Allow Risks
Search for:
- guards that always return true
- dev bypass flags
- environment toggles enabling bypass

**Pass Criteria**
- No bypass exists in production path
- If bypass exists, it must be behind a hard “dev-only” compile/runtime gate

---

## 6) Proof Tests (Minimal but High Confidence)
Run these tests using Postman/curl or integration tests:
1) **Cross-tenant read test**:
   - create record in tenant A
   - attempt to read with tenant B token by ID
   - must fail

2) **Cross-tenant write test**:
   - attempt to update/delete with tenant B token
   - must fail

3) **Missing auth test**:
   - call write endpoint without token
   - must fail

4) **Permission negative test** (if permissions exist):
   - user without permission calls endpoint
   - must fail

5) **Job scope test**:
   - enqueue job with missing orgId
   - must fail-closed (reject or DLQ)

**Pass Criteria**
- All tests fail correctly (fail-closed)

---

## 7) Fix Policy (What to change when gaps found)
Because we’re governance-first:

1) If docs claim enforcement but code doesn’t:
   - **docs must be corrected**
   - and a governance ticket opened to implement enforcement later

2) If code enforces but docs don’t mention it:
   - **docs must be updated with evidence**

3) If enforcement is missing on write endpoints:
   - **STOP** and escalate (security critical)

---

## 8) Final Production-Safe Gate
You can call the system production-safe only when:

- ✅ Tenant boundary audit passes (no cross-tenant access)
- ✅ All write endpoints have auth + authorization
- ✅ Jobs/webhooks cannot run unscoped
- ✅ Evidence is recorded in governance docs with line references
- ✅ Stop conditions documented and testable

---

## 9) Execution Script (Sonnet/LDE Friendly)
Use the following structured workflow inside LDE:

1) Generate endpoint list from controllers (paths + methods)
2) For each endpoint:
   - record guards
   - record tenant scope enforcement
   - record permission enforcement
3) Generate `TENANT_BOUNDARY_AUDIT.md` + `PERMISSION_ENFORCEMENT_AUDIT.md`
4) Patch docs:
   - 02_API_CONTRACTS.md
   - 03_PERMISSIONS_MATRIX.md
   - 06_EVENTS_AND_OBSERVABILITY.md
5) Run proof tests
6) Update audit docs with results

---

**END**
