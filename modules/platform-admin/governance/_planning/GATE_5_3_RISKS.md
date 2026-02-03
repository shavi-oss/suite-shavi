# Gate 5.3 Risks — Template Publishing

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Module Name    | platform-admin                          |
| Document Title | GATE_5_3_RISKS                          |
| Repo           | Suite (Layer / Product Repo)            |
| Status         | DRAFT — PLANNING ONLY                   |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-01-31                              |

---

## 1) Purpose

This document identifies risks, blockers, and dependencies for Gate 5.3: Template Publishing. It highlights what could cause STOP and proposes mitigation strategies.

---

## 2) Critical Blocker: Core Integration Contract

### 2.1 Risk Description

**Risk**: Core template publish endpoint does NOT exist in Core v1; therefore Gate 5.3 implementation that depends on Core publish is BLOCKED until Core v2 contract lock.

**Impact**: Gate 5.3 implementation CANNOT proceed without Core v2 contract lock.

**Severity**: **CRITICAL BLOCKER**

### 2.2 Current Status

**INTEGRATION_CONTRACT_CORE.md Section 12.1** states:

> **TODO**: Define exact list of Core API endpoints that Suite BFF is authorized to call, including:
>
> - Endpoint URL
> - HTTP method
> - Purpose
> - Required headers (e.g., Authorization, X-Organization-Id, X-Correlation-Id)
> - Request/response schema (reference or inline)
> - Expected status codes
> - Idempotency support

**MODULE_INTEGRATION_PLAN.md Section 3.1** states:

> **Template Publishing**:
>
> **Template Publishing: DEFERRED**
>
> Template Publishing is **NOT AVAILABLE** in Core v1.
>
> - No Core endpoint exists for template publishing
> - Service tokens do NOT exist in Core v1
> - Tenant context via JWT claim `organizationId` only (no `X-Organization-Id` header)
> - Correlation ID is Suite-only (Core does not guarantee echo)
>
> **Action**: Feature is BLOCKED until Core v2 with new contract lock.

**STOP RULE**: **No Core endpoint calls unless endpoint is explicitly authorized in INTEGRATION_CONTRACT_CORE.md.**

### 2.3 Mitigation Strategy

**Proposed Action**: Create **Gate 5.3A: Contract Finalization** (docs-only gate) BEFORE Gate 5.3 implementation.

**Gate 5.3A Deliverables**:

1. **Update INTEGRATION_CONTRACT_CORE.md Section 12.1**:
   - Document: Core template publish endpoint is NOT AVAILABLE in Core v1 (DEFERRED to Core v2 contract lock).
   - Endpoint URL: N/A in Core v1 (no endpoint exists).
   - Request/Response schema: N/A in Core v1 (no endpoint exists).
   - Idempotency: N/A for publish in v1 (re-evaluate after Core v2 contract lock).

2. **Obtain Approvals**:
   - Governance Authority approval
   - Core team confirmation (if Core team exists)

3. **Tag Contract Update**:
   - Create git tag: `suite-integration-contract-v2`

4. **Update MODULE_INTEGRATION_PLAN.md**:
   - Remove TODO markers for template publishing endpoint
   - Reference INTEGRATION_CONTRACT_CORE.md for exact details

**Gate 5.3A Exit Criteria**:

- [ ] INTEGRATION_CONTRACT_CORE.md explicitly states: Core template publish endpoint does NOT exist in Core v1 and is DEFERRED to Core v2 contract lock.
- [ ] Template publishing remains DEFERRED in v1.
- [ ] Governance Authority has approved contract update
- [ ] Git tag `suite-integration-contract-v2` exists
- [ ] Gate 5.3 (Core publish) remains BLOCKED until Core v2 contract lock; Suite-only publish-request recording (no Core call) may proceed only under a separate authorized gate.

**Timeline**: Gate 5.3A MUST be completed BEFORE Gate 5.3 implementation begins.

---

## 3) Risk: Scope Creep

### 3.1 Risk Description

**Risk**: During implementation, there may be temptation to add features outside MODULE_SCOPE_LOCK.md (e.g., custom template creation, template editing, template versioning).

**Impact**: Scope creep violates governance, triggers STOP rule, requires scope change approval.

**Severity**: **HIGH**

### 3.2 Mitigation Strategy

**Prevention**:

- Strictly adhere to MODULE_SCOPE_LOCK.md Section 2.2 (BFF Endpoints)
- Do NOT implement any publish endpoint that implies Core publishing in v1.
- If a Suite endpoint exists, it MUST only record a DEFERRED publish request (no Core call), and return a safe 'DEFERRED' response.
- Do NOT implement template creation, editing, or versioning in Gate 5.3

**Verification**:

- Run `git diff --name-only` to verify only allowed files modified
- Code review to confirm no out-of-scope features
- Reject any PR that adds features not in MODULE_SCOPE_LOCK.md

**STOP Condition**: If out-of-scope features are detected → STOP, revert, escalate.

---

## 4) Risk: Core Service Token Exposure

### 4.1 Risk Description

**Risk**: Core service token accidentally exposed to UI, logged, or included in error messages.

**Impact**: Security violation, token leakage, potential unauthorized Core access.

**Severity**: **RISK REMOVED** (Feature Not Implemented in Core v1)

### 4.2 Mitigation Strategy

**Prevention**:

- Do NOT implement Service Token logic (Not Available)
- Use correlation IDs for debugging instead

**Verification**:

- Security tests verify token never in UI/logs
- Code review to confirm token handling is server-only
- Grep codebase for token leakage: `grep -r "core.*token" modules/platform-admin/src/`

**STOP Condition**: If token exposure detected → STOP, fix immediately, escalate.

---

## 5) Risk: Fail-Open Behavior

### 5.1 Risk Description

**Risk**: Missing org mapping (suiteOrgId → coreOrgId) handled with fail-open behavior (e.g., guessing coreOrgId, proceeding without mapping).

**Impact**: Tenant isolation breach, security violation.

**Severity**: **CRITICAL**

### 5.2 Mitigation Strategy

**Prevention**:

- Fail-closed enforcement: missing mapping → deny request
- Return safe error to UI: "Organization mapping not found. Please link this organization to Core first."
- Log failure with correlation ID
- Do NOT guess or infer coreOrgId

**Verification**:

- Unit tests verify fail-closed behavior (missing mapping → deny)
- Integration tests verify safe error returned to UI
- Security tests verify no fail-open behavior

**STOP Condition**: If fail-open behavior detected → STOP, fix immediately, escalate.

---

## 6) Risk: RBAC Bypass

### 6.1 Risk Description

**Risk**: RBAC enforcement skipped or bypassed, allowing unauthorized roles (e.g., `support`, `viewer`) to submit publish request (DEFERRED).

**Impact**: Security violation, privilege escalation.

**Severity**: **HIGH**

### 6.2 Mitigation Strategy

**Prevention**:

- Apply RBAC guard to `POST /api/platform-admin/templates/publish-request`
- Only allow `platform_admin` and `developer_ops` roles (per MODULE_SECURITY_LAWS.md Section 3.2)
- Deny all other roles
- This endpoint records a DEFERRED request only; it MUST NOT call Core in v1.

**Verification**:

- Unit tests verify RBAC enforcement (platform_admin → allow, support → deny)
- Security tests verify privilege escalation attempts are denied

**STOP Condition**: If RBAC bypass detected → STOP, fix immediately, escalate.

---

## 7) Risk: Audit Logging Skipped

### 7.1 Risk Description

**Risk**: Audit log entry not created for submit publish request (DEFERRED) attempts (success or failure).

**Impact**: Compliance violation, lack of audit trail.

**Severity**: **HIGH**

### 7.2 Mitigation Strategy

**Prevention**:

- Create audit log entry for every submit publish request (DEFERRED) attempt
- Include: correlationId, entityType (template_publish), entityId (templateId), action (publish), performedBy (userId), performedAt (timestamp), metadata (coreOrgId, success/failure)
- Audit log is append-only (no updates or deletes)

**Verification**:

- Unit tests verify audit log creation (success and failure)
- Integration tests verify audit log entries exist
- Security tests verify audit immutability

**STOP Condition**: If audit logging skipped → STOP, fix immediately, escalate.

---

## 8) Risk: Test Failures Ignored

### 8.1 Risk Description

**Risk**: Lint, build, or test failures ignored during verification phase.

**Impact**: Broken code merged, regressions introduced, gate exit criteria not met.

**Severity**: **HIGH**

### 8.2 Mitigation Strategy

**Prevention**:

- Follow GATE_5_3_EXECUTION_CHECKLIST.md Phase 3 (Verify) strictly
- Do NOT proceed to Phase 4 (Evidence) until all tests pass
- Do NOT commit changes until all verification steps pass

**Verification**:

- Run `npm run lint` → must pass
- Run `npm run build` → must pass
- Run `npm run test` → all tests must pass

**STOP Condition**: If any test fails → STOP, fix errors, re-run verification.

---

## 9) Risk: Forbidden Files Modified

### 9.1 Risk Description

**Risk**: Files outside `modules/platform-admin/**` are modified (e.g., Core files, Prisma schema, dependencies).

**Impact**: Governance violation, scope violation, triggers STOP rule.

**Severity**: **CRITICAL**

### 9.2 Mitigation Strategy

**Prevention**:

- Only modify files in `modules/platform-admin/src/`, `modules/platform-admin/tests/`, `modules/platform-admin/governance/`
- Do NOT touch files in `src/`, `prisma/`, `.github/`, `package.json`, `package-lock.json`

**Verification**:

- Run `git diff --name-only suite-platform-admin-gate5.2-complete HEAD`
- Verify output contains ONLY `modules/platform-admin/**` files
- Run `git diff --name-only suite-platform-admin-gate5.2-complete HEAD | grep -E '^(src/|prisma/|\.github/|package\.json|package-lock\.json)'`
- Verify output is EMPTY (no matches)

**STOP Condition**: If forbidden files modified → STOP, revert changes, escalate.

---

## 10) Risk: Core Endpoint Not Idempotent

### 10.1 Risk Description

Template Publishing is DEFERRED in Core v1.
There is no Core publish endpoint, therefore publish idempotency risks are N/A for v1.
Re-evaluate only after Core v2 contract is locked.

### 10.2 Mitigation Strategy

N/A — Template Publishing is DEFERRED in Core v1.

---

## 11) Risk: Correlation ID Not Propagated

### 11.1 Risk Description

**Risk**: Correlation ID not propagated from UI → BFF → Core, making debugging difficult.

**Impact**: Reduced observability, difficult to trace requests across systems.

**Severity**: **MEDIUM**

### 11.2 Mitigation Strategy

**Prevention**:

- Generate correlation ID in BFF (or accept from UI if provided)
- Include `X-Correlation-Id: <id>` header in all Core API calls
- Include correlation ID in all log entries
- Include correlation ID in audit log entries

**Verification**:

- Integration tests verify correlation ID in logs
- Integration tests verify correlation ID in Core API calls (mock verification)

**STOP Condition**: If correlation ID not propagated → fix before closing gate.

---

## 12) Risk Summary Table

| Risk                          | Severity | Blocker? | Mitigation                                     | STOP Condition                       |
| ----------------------------- | -------- | -------- | ---------------------------------------------- | ------------------------------------ |
| Core endpoint not authorized  | CRITICAL | YES      | Create Gate 5.3A (Contract Finalization)       | Cannot proceed without authorization |
| Scope creep                   | HIGH     | NO       | Strict adherence to MODULE_SCOPE_LOCK.md       | Out-of-scope features → STOP, revert |
| Core token exposure           | REMOVED  | NO       | Feature Not Available                          | N/A                                  |
| Fail-open behavior            | CRITICAL | NO       | Fail-closed enforcement, unit/security tests   | Fail-open detected → STOP, fix       |
| RBAC bypass                   | HIGH     | NO       | RBAC guards, unit/security tests               | RBAC bypass → STOP, fix              |
| Audit logging skipped         | HIGH     | NO       | Mandatory audit logging, unit/security tests   | Audit skipped → STOP, fix            |
| Test failures ignored         | HIGH     | NO       | Strict verification phase, do not proceed      | Test failure → STOP, fix, re-run     |
| Forbidden files modified      | CRITICAL | NO       | Scope verification, git diff checks            | Forbidden files → STOP, revert       |
| Core endpoint not idempotent  | MEDIUM   | NO       | Idempotency keys (if supported), no retry POST | Document risk, adjust retry policy   |
| Correlation ID not propagated | MEDIUM   | NO       | Include correlation ID in headers/logs         | Fix before closing gate              |

---

## 13) Recommended Action Plan

### 13.1 Immediate Actions

1. **Verify INTEGRATION_CONTRACT_CORE.md Status**:
   - Check if Core template publishing endpoint is explicitly authorized
   - If TODO → proceed to Step 2
   - If authorized → proceed to Gate 5.3 implementation

2. **If Blocked (Core Endpoint TODO)**:
   - Create Gate 5.3A: Contract Finalization (docs-only)
   - Update INTEGRATION_CONTRACT_CORE.md Section 12.1
   - Obtain approvals
   - Tag as `suite-integration-contract-v2`
   - Then proceed to Gate 5.3 implementation

3. **If Unblocked (Core Endpoint Authorized)**:
   - Proceed with Gate 5.3 implementation
   - Follow GATE_5_3_EXECUTION_CHECKLIST.md strictly
   - Verify all risks are mitigated during implementation

### 13.2 Ongoing Monitoring

- Review git diff before each commit to verify scope
- Run all verification steps (lint, build, tests) before closing gate
- Document any new risks discovered during implementation
- Escalate any STOP condition immediately

---

## 14) Acceptance Criteria

This risk document is considered COMPLETE when:

- [ ] All critical risks are identified and documented
- [ ] All blockers are identified (Core endpoint authorization)
- [ ] All mitigation strategies are defined
- [ ] All STOP conditions are explicit
- [ ] Risk summary table is complete
- [ ] Recommended action plan is clear
- [ ] No contradictions exist with GATE_5_3_DRAFT_AUTHORIZATION.md or GATE_5_3_EXECUTION_CHECKLIST.md

---

## 15) Signature

**Status**: DRAFT — PLANNING ONLY  
**Prepared By**: Execution Assistant (Sonnet 4.5)  
**Date**: 2026-01-31  
**Approval Status**: PENDING GOVERNANCE AUTHORITY REVIEW

---

## Changelog

- **2026-02-02**: Removed residual Core v2 assumptions (service token headers, X-Organization-Id headers, invented publish endpoint examples).
- **2026-02-02**: Aligned strictly to Core Contract v1 + Gate 5.3A Decision A.
- Removed residual execution guidance for Template Publishing (DEFERRED in Core v1).
- Eliminated contradictions about authorizing non-existent Core publish endpoints.
- Marked publish idempotency risks as N/A in v1 (Core v2 only).
