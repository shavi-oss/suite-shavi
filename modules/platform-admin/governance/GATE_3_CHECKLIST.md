# Gate 3 Checklist — platform-admin

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Module Name    | platform-admin                          |
| Document Title | GATE_3_CHECKLIST                        |
| Repo           | Suite (Layer / Product Repo)            |
| Status         | DRAFT — GATE 3 CHECKLIST                |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-01-27                              |

---

## 1. Pre-Implementation Preconditions

The following MUST be true before writing the first line of code:

- [ ] Gate 2 is FINAL and CLOSED (tag: `suite-platform-admin-gate2-final`)
- [ ] `GATE_3_AUTHORIZATION.md` is APPROVED and LOCKED
- [ ] `IMPLEMENTATION_STRUCTURE.md` is APPROVED
- [ ] All Gate 2 governance documents are IMMUTABLE (no modifications allowed)
- [ ] Module scope is LOCKED (no scope expansion permitted)
- [ ] Forbidden capabilities list is REVIEWED and UNDERSTOOD
- [ ] Required invariants are REVIEWED and UNDERSTOOD
- [ ] STOP conditions are REVIEWED and UNDERSTOOD
- [ ] Git working directory is CLEAN (no uncommitted changes)
- [ ] All prior governance documents are ACCESSIBLE and READABLE

---

## 2. Implementation Scope Compliance

### 2.1 Authorized Capabilities Only

- [ ] Organization management capability implemented (create, retrieve, suspend/unsuspend)
- [ ] OrgId mapping capability implemented (create, retrieve, resolve)
- [ ] Internal user management capability implemented (create, retrieve, deactivate)
- [ ] Template publishing capability implemented (publish command, list query)
- [ ] Audit logging capability implemented (write, query)
- [ ] Core integration adapter implemented (token handling, correlation, idempotency)
- [ ] RBAC enforcement implemented (role-based authorization)
- [ ] Fail-closed validation implemented (mapping, authentication, authorization)
- [ ] Correlation ID generation and propagation implemented

### 2.2 Forbidden Scope Not Touched

- [ ] NO workflow builder or visual editor implemented
- [ ] NO custom template creation or modification implemented
- [ ] NO customer user management implemented
- [ ] NO customer-facing authentication or authorization implemented
- [ ] NO billing, subscriptions, or payment processing implemented
- [ ] NO real-time dashboards or analytics implemented
- [ ] NO CRM or Omnichannel features implemented
- [ ] NO MFA for internal users implemented
- [ ] NO external identity provider integration implemented
- [ ] NO audit log export implemented
- [ ] NO tables created beyond MODULE_SCOPE_LOCK.md list
- [ ] NO UI screens created beyond MODULE_SCOPE_LOCK.md list
- [ ] NO Core interactions beyond INTEGRATION_ADAPTER_SPEC.md list

---

## 3. Structural Compliance

### 3.1 Folder Structure Compliance

- [ ] All implementation files are within `modules/platform-admin/src/`
- [ ] All test files are within `modules/platform-admin/tests/`
- [ ] `adapters/core/` directory exists and contains Core integration code ONLY
- [ ] `domain/` directory exists and contains domain services ONLY
- [ ] `repositories/` directory exists and contains Suite DB access code ONLY
- [ ] `audit/` directory exists and contains audit logging code ONLY
- [ ] `rbac/` directory exists and contains authorization code ONLY
- [ ] `mapping/` directory exists and contains mapping resolution code ONLY
- [ ] `validation/` directory exists and contains fail-closed validation code ONLY
- [ ] `correlation/` directory exists and contains correlation ID code ONLY
- [ ] `errors/` directory exists and contains error handling code ONLY
- [ ] NO files exist outside approved directory structure

### 3.2 Boundary Enforcement Checks

- [ ] UI layer does NOT import from `adapters/`, `repositories/`, or `domain/`
- [ ] Domain services do NOT import from UI layer
- [ ] Repositories do NOT import from `adapters/`
- [ ] Adapters do NOT import from `repositories/`
- [ ] NO cross-layer import violations detected

### 3.3 Adapter Isolation Checks

- [ ] Core integration code is ONLY in `adapters/core/` directory
- [ ] Core service token handling is ONLY in `adapters/core/` directory
- [ ] NO Core API client imports outside `adapters/core/`
- [ ] NO Core service token references outside `adapters/core/`
- [ ] Adapter is the ONLY code path to Core (verified via import analysis)

---

## 4. Fail-Closed Enforcement Checks

### 4.1 Mapping Enforcement

- [ ] All Core API calls are preceded by mapping resolution
- [ ] Mapping resolver denies when Suite orgId has no Core orgId
- [ ] Mapping resolver denies when mapping is ambiguous (multiple matches)
- [ ] NO hardcoded Core orgId values exist
- [ ] NO default or fallback Core orgId when mapping missing
- [ ] NO Core API calls without mapping resolution (verified via code review)

### 4.2 RBAC Enforcement

- [ ] All domain service operations check RBAC before execution
- [ ] RBAC service denies when user role is missing
- [ ] RBAC service denies when user role is insufficient for operation
- [ ] NO operations proceed when RBAC check fails
- [ ] NO default to ALLOW when role is missing or insufficient

### 4.3 Audit Failure Behavior

- [ ] All write operations write audit log entry (success or failure)
- [ ] Operations FAIL when audit log write fails (fail-closed)
- [ ] Operations ROLLBACK when audit log write fails
- [ ] NO operations proceed when audit log write fails
- [ ] Audit repository has NO update or delete methods (interface-level enforcement)

### 4.4 Core Failure Behavior

- [ ] Operations FAIL when Core API returns 4xx (fail-closed)
- [ ] Operations FAIL when Core API returns 5xx (fail-closed)
- [ ] Operations FAIL when Core API times out (fail-closed)
- [ ] Operations FAIL when retry limit exceeded (fail-closed)
- [ ] NO operations proceed when Core API call fails
- [ ] NO default or fallback behavior when Core API fails

---

## 5. Security Gates

### 5.1 Token Separation Checks

- [ ] Core service token is stored ONLY in `adapters/core/` directory
- [ ] Core service token is NEVER exposed to UI
- [ ] Core service token is NEVER logged (value sanitized in all logs)
- [ ] Core service token is NEVER included in error messages
- [ ] Core service token is NEVER passed as parameter to domain services
- [ ] Suite UI token is NEVER forwarded to Core
- [ ] Token separation verified via code review and security tests

### 5.2 UI → Core Prevention Checks

- [ ] NO UI code imports Core API client
- [ ] NO UI code constructs Core API requests
- [ ] NO UI code includes Core service token
- [ ] NO direct network calls from UI to Core (verified via network analysis)
- [ ] All Core interactions are mediated by BFF and adapter

### 5.3 No Shared DB Checks

- [ ] Suite code accesses ONLY Suite database
- [ ] Core code accesses ONLY Core database (no changes to Core)
- [ ] NO shared tables between Suite and Core
- [ ] NO shared connection pools between Suite and Core
- [ ] Database separation verified via connection string analysis

### 5.4 No Core DB Access Checks

- [ ] Suite code does NOT import Core database client
- [ ] Suite code does NOT construct Core database queries
- [ ] Suite code does NOT access Core database tables
- [ ] NO Core database connection strings in Suite code
- [ ] Core DB isolation verified via code review and import analysis

---

## 6. Testing Gates

### 6.1 Unit Test Requirements

**All Services**:

- [ ] All domain services have unit tests with mocked dependencies
- [ ] All repositories have unit tests with mocked database
- [ ] All adapters have unit tests with mocked Core API
- [ ] All audit logic has unit tests with mocked audit repository
- [ ] All RBAC logic has unit tests covering all roles
- [ ] All validation logic has unit tests covering all failure scenarios

**Coverage Areas**:

- [ ] RBAC enforcement tested (all roles, all operations)
- [ ] Mapping resolution tested (success, missing, ambiguous)
- [ ] Fail-closed validation tested (all preconditions)
- [ ] Audit logging tested (success, failure, sanitization)
- [ ] Correlation ID generation tested (UUID v4 format)
- [ ] Error handling tested (all error types)

### 6.2 Integration Test Requirements

**Fail-Closed Scenarios**:

- [ ] Missing mapping scenario tested (operation denied)
- [ ] Invalid Suite UI token scenario tested (operation denied)
- [ ] Insufficient RBAC role scenario tested (operation denied)
- [ ] Core API failure scenario tested (operation denied, no retry on 4xx)
- [ ] Core API timeout scenario tested (operation denied)
- [ ] Audit log write failure scenario tested (operation rollback)

**Core Integration**:

- [ ] Core integration adapter tested with mocked Core responses (success, 4xx, 5xx, timeout)
- [ ] Correlation ID propagation tested end-to-end (BFF → adapter → Core)
- [ ] Idempotency key inclusion tested (template publish operations)
- [ ] Retry logic tested (max 2 retries, network/5xx only)

**Audit Logging**:

- [ ] Audit log write tested for all write operations (success and failure)
- [ ] Audit log query tested with RBAC enforcement
- [ ] Audit log immutability tested (no update or delete)
- [ ] Audit log sanitization tested (no tokens, no credentials)

### 6.3 Security Test Requirements

**Token Separation**:

- [ ] Core service token never reaches UI (verified via test)
- [ ] Core service token never logged (verified via log inspection)
- [ ] Core service token never in error messages (verified via error inspection)

**RBAC Enforcement**:

- [ ] Insufficient role denied (verified via test for each role)
- [ ] Missing role denied (verified via test)

**Mapping Enforcement**:

- [ ] Missing mapping denied (verified via test)
- [ ] Ambiguous mapping denied (verified via test)

**Audit Immutability**:

- [ ] Audit log update not possible (verified via interface test)
- [ ] Audit log delete not possible (verified via interface test)

---

## 7. Audit & Observability Gates

### 7.1 Audit Completeness Checks

- [ ] All write operations log audit entry (create, update, suspend, deactivate, publish)
- [ ] All audit entries include correlation ID
- [ ] All audit entries include performedBy (if authenticated)
- [ ] All audit entries include entityType
- [ ] All audit entries include entityId
- [ ] All audit entries include metadata (sanitized)
- [ ] All audit entries include timestamp
- [ ] All audit entries include event type (from enumerated list)

### 7.2 Correlation Propagation Checks

- [ ] Correlation ID generated at BFF entry point (UUID v4)
- [ ] Correlation ID stored in request-scoped context
- [ ] Correlation ID propagated to adapter (included in Core API `X-Correlation-Id` header)
- [ ] Correlation ID propagated to audit (included in all audit log entries)
- [ ] Correlation ID propagated to error logs (included in all error messages)
- [ ] Correlation ID propagation verified end-to-end via integration test

### 7.3 Log Sanitization Checks

- [ ] Core service token value NEVER logged
- [ ] Suite UI token value NEVER logged (only token ID or hash)
- [ ] User credentials NEVER logged
- [ ] Sensitive metadata sanitized in audit logs
- [ ] Error messages sanitized (no tokens, no credentials)
- [ ] Log sanitization verified via log inspection and security tests

---

## 8. Release Readiness Criteria

### 8.1 What MUST Be True to Merge Code

**Governance Compliance**:

- [ ] All items in Section 2 (Implementation Scope Compliance) are CHECKED
- [ ] All items in Section 3 (Structural Compliance) are CHECKED
- [ ] All items in Section 4 (Fail-Closed Enforcement Checks) are CHECKED
- [ ] All items in Section 5 (Security Gates) are CHECKED
- [ ] All items in Section 6 (Testing Gates) are CHECKED
- [ ] All items in Section 7 (Audit & Observability Gates) are CHECKED

**Code Quality**:

- [ ] All linting checks PASS (no errors, no warnings)
- [ ] All type checks PASS (no TypeScript errors)
- [ ] All unit tests PASS (100% of tests)
- [ ] All integration tests PASS (100% of tests)
- [ ] All security tests PASS (100% of tests)

**Code Review**:

- [ ] Code review completed by Governance Authority or authorized reviewer
- [ ] All STOP conditions verified as NOT triggered
- [ ] All invariants verified as HELD
- [ ] All forbidden patterns verified as ABSENT

**Documentation**:

- [ ] All code changes documented (inline comments for complex logic)
- [ ] All test coverage documented (test plan or summary)
- [ ] All known limitations documented (if any)

**Git Hygiene**:

- [ ] All changes committed with descriptive messages
- [ ] Git working directory is CLEAN (no uncommitted changes)
- [ ] No merge conflicts exist

### 8.2 What MUST Be True to Declare Gate 3 PASSED

**All Release Readiness Criteria Met**:

- [ ] All items in Section 8.1 are CHECKED

**Evidence Provided**:

- [ ] Unit test results documented (all tests pass)
- [ ] Integration test results documented (all tests pass)
- [ ] Security test results documented (all tests pass)
- [ ] Code review approval documented
- [ ] Audit log samples provided (demonstrating completeness and sanitization)
- [ ] Correlation ID propagation demonstrated (end-to-end trace)

**Governance Artifacts Created**:

- [ ] Gate 3 completion report created (summary of work, evidence, compliance)
- [ ] Gate 3 final lock declaration created (formal closure of Gate 3)

**No STOP Conditions Triggered**:

- [ ] All items in Section 9 (STOP & ROLLBACK Rules) verified as NOT triggered

---

## 9. STOP & ROLLBACK Rules

### 9.1 Conditions That Require Immediate Halt

**Architectural Violations** (STOP IMMEDIATELY):

- [ ] UI → Core direct call detected
- [ ] Core service token found in UI code or browser storage
- [ ] Suite UI token forwarded to Core
- [ ] Suite code accesses Core DB directly
- [ ] Shared database detected between Suite and Core

**Token Violations** (STOP IMMEDIATELY):

- [ ] Core service token logged (value not sanitized)
- [ ] Core service token included in error message
- [ ] Core service token exposed to UI

**Fail-Closed Violations** (STOP IMMEDIATELY):

- [ ] Operation proceeds when mapping resolution fails
- [ ] Operation proceeds when RBAC check fails
- [ ] Operation proceeds when audit log write fails
- [ ] Default to ALLOW when context is missing

**Scope Violations** (STOP IMMEDIATELY):

- [ ] Implementation of forbidden capability detected
- [ ] Creation of table not listed in MODULE_SCOPE_LOCK.md
- [ ] Creation of UI screen not listed in MODULE_SCOPE_LOCK.md
- [ ] Core interaction not listed in INTEGRATION_ADAPTER_SPEC.md

**Governance Violations** (STOP IMMEDIATELY):

- [ ] Code written before Gate 3 authorization
- [ ] Modification of governance documents without approval
- [ ] Bypass of required gates or checklists

### 9.2 Conditions That Require Rollback

**Rollback Required When**:

- [ ] Any STOP condition is triggered (see Section 9.1)
- [ ] Security test fails (token separation, RBAC, mapping enforcement)
- [ ] Audit immutability test fails (update or delete possible)
- [ ] Fail-closed test fails (operation proceeds when precondition fails)
- [ ] Code review identifies critical violation

**Rollback Procedure**:

- [ ] Revert all commits since last known-good state
- [ ] Document violation in governance incident report
- [ ] Escalate to Governance Authority
- [ ] Re-review GATE_3_AUTHORIZATION.md and IMPLEMENTATION_STRUCTURE.md
- [ ] Obtain explicit approval before resuming work

### 9.3 Required Actions on STOP

**Immediate Actions**:

1. [ ] HALT all work immediately (no further commits)
2. [ ] Document STOP condition triggered (which rule, what evidence)
3. [ ] Notify Governance Authority (escalate immediately)
4. [ ] Preserve current state (do not delete or modify evidence)

**Investigation Actions**: 5. [ ] Root cause analysis (why did violation occur) 6. [ ] Impact assessment (what other code may be affected) 7. [ ] Remediation plan (how to fix violation)

**Resolution Actions**: 8. [ ] Obtain Governance Authority approval for remediation plan 9. [ ] Execute remediation (rollback or fix) 10. [ ] Re-verify all gates (repeat relevant sections of this checklist) 11. [ ] Document resolution in governance incident report 12. [ ] Obtain explicit approval to resume work

---

## 10. Signature

**Prepared By**: Principal Software Architect & Governance Authority  
**Date**: 2026-01-27  
**Status**: DRAFT — GATE 3 CHECKLIST
