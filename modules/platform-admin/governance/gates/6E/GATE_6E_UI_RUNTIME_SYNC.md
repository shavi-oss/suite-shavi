# Gate 6E — UI Runtime Sync

## Platform Admin Module

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Gate Number    | 6E                                      |
| Gate Name      | UI Runtime Sync                         |
| Document Title | GATE_6E_UI_RUNTIME_SYNC                 |
| Repo           | Suite (Layer / Product Repo)            |
| Module         | platform-admin                          |
| Status         | FINAL — PLAN                            |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-02-12                              |
| Risk Level     | P2 (Operational)                        |

---

## 1) Executive Summary

**Goal**: Sync UI with runtime for Organizations module only, without scope expansion

**Scope**: Organizations-only activation, proxy validation, error semantics alignment

**Risk**: P2 (Operational) — UI/backend mismatch, proxy misconfiguration, error handling drift

**Preservation**: No scope expansion, no new features, Organizations module only

**Blocker**: Proxy config must be verified before execution

---

## 2) Architectural Context

**Current State**:

- UI partially connected (proxy mode)
- Runtime ready (Gates 6A-6D complete)
- Organizations module exists in backend
- UI may not be fully synced with runtime

**Target State**:

- UI fully synced with Organizations runtime
- Proxy validated (dev/staging/production)
- Error semantics aligned (401/403/500)
- No scope expansion beyond Organizations

---

## 3) Preconditions (MUST BE VERIFIED BEFORE EXECUTION)

### 3.1 Proxy Config Verification Required

**Requirement**: Proxy config must match current Vite config in repo

**Verification**: Read `modules/platform-admin/client/**` config files

**Forbidden**: Assuming proxy targets without evidence

**Action**: STOP execution until proxy config is verified from repo

---

### 3.2 Evidence Required Checklist

**Before Execution**:

- [ ] Confirm current proxy target from Vite config
- [ ] Confirm current proxy port from Vite config
- [ ] Confirm CORS configuration
- [ ] Confirm SSL/TLS settings (staging/production)

---

## 4) Risk Classification

**Risk Level**: P2 (Operational)

**Risks**:

- UI/backend mismatch (API contract drift)
- Proxy misconfiguration (CORS, routing)
- Error handling drift (UI shows wrong messages)
- Scope creep (expanding beyond Organizations)

**Mitigation**:

- Organizations-only activation
- Proxy validation checklist
- Error semantics alignment
- Safe rollout sequencing

---

## 5) Organizations-Only Activation First

### 5.1 Scope

**Allowed**: Organizations module only

**Endpoints**:

- `GET /platform-admin/organizations`
- `GET /platform-admin/organizations/:id`
- `POST /platform-admin/organizations`
- `PATCH /platform-admin/organizations/:id`
- `DELETE /platform-admin/organizations/:id`

---

### 5.2 Forbidden

**Deferred to Future Gates**:

- InternalUser module
- OrgMapping module
- Audit module
- Roles module (if applicable)

**Rationale**: Minimize risk, validate runtime before expansion

---

## 6) No Scope Expansion

**Frozen**: Organizations module only

**Forbidden**:

- Adding new modules
- Adding new endpoints
- Adding new features
- Expanding UI beyond Organizations

**Verification**: Manual audit of UI code

---

## 7) Proxy Validation Model

### 7.1 Policy-Level Requirements

**Requirement**: Proxy config must match current repo config

**Verification**: Read Vite config from `modules/platform-admin/client/**`

**No Assumptions**: Do not hardcode proxy targets

---

### 7.2 Environment-Specific Validation

**Dev Environment**:

- Proxy target: From Vite config
- CORS: Enabled for dev
- SSL: Not required

**Staging Environment**:

- Proxy target: From Vite config
- CORS: Configured for staging domain
- SSL: Required

**Production Environment**:

- Proxy target: From Vite config
- CORS: Configured for production domain
- SSL: Required (strict)

---

## 8) UI Error Semantics Alignment

### 8.1 401 Unauthorized

**Backend Response**:

```json
{
  "statusCode": 401,
  "message": "Unauthorized access. Please contact your administrator."
}
```

**UI Action**: Redirect to login page

**Verification**: Manual test (browser)

---

### 8.2 403 Forbidden

**Backend Response**:

```json
{
  "statusCode": 403,
  "message": "Forbidden. Insufficient permissions."
}
```

**UI Action**: Show "Access Denied" message

**Verification**: Manual test (browser)

---

### 8.3 500 Internal Server Error

**Backend Response**:

```json
{
  "statusCode": 500,
  "message": "An error occurred. Please contact support."
}
```

**UI Action**: Show "Something went wrong" message

**Verification**: Manual test (browser)

---

## 9) Runtime-to-UI Contract Boundaries

### 9.1 API Contract (Policy-Level)

**Endpoints**: Organizations CRUD endpoints

**Request/Response**: As defined by backend controllers

**Verification**: Manual test (browser DevTools)

---

### 9.2 UI Contract (Policy-Level)

**UI Components**:

- Organizations list page
- Organization detail page
- Organization create form
- Organization edit form

**UI Actions**:

- Fetch organizations list
- Fetch organization by ID
- Create organization
- Update organization
- Delete organization

**Verification**: Manual test (browser)

---

## 10) Safe Rollout Sequencing

### 10.1 Phase 1: Dev Environment

**Objective**: Validate UI/runtime sync in dev

**Steps**:

1. Verify proxy config from Vite config
2. Test Organizations list
3. Test Organization create
4. Test Organization update
5. Test Organization delete
6. Verify error handling (401/403/500)

**Verification**: Manual test (browser)

---

### 10.2 Phase 2: Staging Environment

**Objective**: Validate UI/runtime sync in staging

**Steps**:

1. Verify proxy config from Vite config
2. Repeat Phase 1 tests
3. Verify CORS configuration
4. Verify SSL/TLS

**Verification**: Manual test (browser)

---

### 10.3 Phase 3: Production Environment

**Objective**: Deploy to production

**Steps**:

1. Verify proxy config from Vite config
2. Monitor error rates
3. Monitor performance
4. Rollback if issues detected

**Verification**: Observability (logging, monitoring)

---

## 11) Allowed File List

**ONLY** these files may be modified:

```
modules/platform-admin/client/**  (UI code)
modules/platform-admin/governance/GATE_6E_UI_RUNTIME_SYNC.md
modules/platform-admin/governance/GATE_6E_EXECUTION_REPORT.md
modules/platform-admin/governance/GATE_6E_VERIFICATION_EVIDENCE.md
```

**Total**: UI files (variable), 3 governance files

---

## 12) Explicit Forbidden List

**MUST NOT** modify:

- `platform-admin.module.ts`
- Any guard files
- Any controller files
- Any service files
- `package.json` or `package-lock.json` (backend)
- Prisma schema

**MUST NOT**:

- Add new modules
- Add new endpoints
- Expand beyond Organizations
- Disable fail-closed architecture

---

## 13) Acceptance Criteria

### 13.1 Proxy Validated

**Requirement**: Proxy working in dev/staging/production

**Verification**: Manual test (browser DevTools)

---

### 13.2 Error Semantics Aligned

**Requirement**: UI handles 401/403/500 correctly

**Verification**: Manual test (browser)

---

### 13.3 Organizations CRUD Working

**Requirement**: Create/Read/Update/Delete organizations working

**Verification**: Manual test (browser)

---

### 13.4 No Scope Expansion

**Requirement**: Only Organizations module active

**Verification**: Manual audit of UI code

---

## 14) Verification Commands

**Pre-Flight**:

```bash
git status --porcelain
git diff --name-only
cat modules/platform-admin/client/vite.config.ts  # Verify proxy config
```

**Post-Execution**:

```bash
git diff --name-only
npm test  # Backend tests should still pass
```

**Expected**:

- `git diff --name-only`: UI files + 3 governance files
- `npm test`: All backend tests pass (26/26 suites minimum)

**Note**: Use commands exactly as listed in `RELEASE_QUALIFICATION_MATRIX_V2.md`

---

## 15) Failure Conditions

**STOP if**:

- Proxy config not verified
- Proxy not working
- Error handling broken
- Organizations CRUD not working
- Scope expansion detected

**Action**: Rollback UI changes, report failure

---

## 16) Rollback Strategy

**If failure detected**:

1. `git reset --hard HEAD`
2. Verify clean working tree: `git status --porcelain`
3. Verify backend tests pass: `npm test`
4. Report failure with error details

**No partial commits**: All changes must pass verification before commit

---

## 17) Governance Compliance Statement

This gate complies with:

- `ARCHITECTURAL_LAWS.md` (UI never talks to Core directly)
- `modules/platform-admin/governance/MODULE_SCOPE_LOCK.md` (Organizations only, no expansion)
- `modules/platform-admin/governance/PRODUCTION_READINESS_BASELINE_V2.md` (Runtime posture preservation)
- `modules/platform-admin/governance/STAGE_6_RUNTIME_STRATEGY.md` (UI runtime sync constraints)

**Preservation Guarantees**:

- No scope expansion
- Organizations module only
- No new features
- Fail-closed architecture preserved

---

## 18) Detected Conflicts (Must Resolve Before Execution)

### Conflict 1: Proxy Config Unknown

**Issue**: Cannot configure proxy without knowing current Vite config

**Resolution Required**: Read `modules/platform-admin/client/vite.config.ts` before execution

**Action**: STOP execution until proxy config is verified

---

## 19) Signature

**Approved By**: Governance Authority  
**Date**: 2026-02-12  
**Status**: FINAL — PLAN  
**Risk Level**: P2 (Operational)
