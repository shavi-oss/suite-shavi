# Gate 29 — Authorization

## Document Control

| Attribute      | Value                                       |
| -------------- | ------------------------------------------- |
| Gate Number    | 29                                          |
| Gate Name      | Web Admin Stabilization & Hardening         |
| Document Title | GATE_29_AUTHORIZATION                       |
| Repo           | Suite (Layer / Product Repo)                |
| Module         | platform-admin                              |
| Status         | ACTIVE — BINDING AUTHORIZATION              |
| Execution Mode | CODE + EVIDENCE · STRICT · GOVERNANCE-FIRST |
| Authority      | Governance Authority                        |
| Effective Date | 2026-02-10                                  |

---

## 1) Authorization Status

**STATUS**: ✅ **AUTHORIZED (CODE + EVIDENCE)**

**AUTHORITY**:

- `EXECUTION_READINESS_MATRIX.md`
- `UI_ERROR_LOADING_CONVENTIONS.md`
- `UI_FETCH_CONTRACT.md`
- `UI_CORRELATION_ID_POLICY.md`
- `MODULE_SECURITY_LAWS.md`
- `SECURITY_BASELINE.md`
- `EXECUTION_AUTHORITY.md`
- `REPO_GOVERNANCE.md`

---

## 2) Authorized Scope

The Executor is authorized to harden and stabilize the web admin UI for **organization management only**.

### 2.1 File Modification Allowlist

**MUST modify ONLY these paths**:

**Client Code**:

- `modules/platform-admin/client/src/**/*.ts`
- `modules/platform-admin/client/src/**/*.tsx`
- `modules/platform-admin/client/src/**/*.css`

**Governance Docs**:

- `modules/platform-admin/governance/GATE_29_PLAN.md`
- `modules/platform-admin/governance/GATE_29_AUTHORIZATION.md`
- `modules/platform-admin/governance/GATE_29_EXECUTION_REPORT.md`
- `modules/platform-admin/governance/GATE_29_VERIFICATION_EVIDENCE.md`

**MUST NOT modify**:

- Any file outside `client/src/**` or `governance/**`
- `package.json` or `package-lock.json`
- BFF source code (`src/**`)
- Prisma schema or migrations

---

### 2.2 Content Allowlist

**MUST include ONLY**:

- Normalized error model and safe message mapping
- Reusable UI components (Loading, Empty, Error)
- Updates to existing components to use reusable components
- Verification evidence and manual test results

**MUST NOT include**:

- New dependencies
- Routing libraries
- New screens or features
- Dashboard, settings, auth, or login UI
- Core API calls (/api/v1)
- localStorage or sessionStorage usage

---

## 3) Hard STOP Conditions

**STOP immediately and escalate if ANY of the following occur**:

### 3.1 Dependency Violations

- Any new dependencies added to `package.json`
- Any routing library added
- Any UI framework or component library added

### 3.2 Scope Violations

- Files modified outside `client/src/**` or `governance/**`
- New screens or features added
- Dashboard, settings, auth, or login UI added

### 3.3 Security Violations

- Core API calls added (/api/v1)
- localStorage or sessionStorage usage added
- Fail-open behavior introduced
- Internal error details exposed to users

### 3.4 Execution Violations

- BFF source code modified
- Prisma schema or migrations modified
- Tests run without explicit authorization

**Action on STOP**: Halt execution immediately, document violation, escalate to Governance Authority.

---

## 4) Security Requirements

**MUST enforce**:

- Fail-closed behavior on 401/403
- Safe error messages only (no internal details)
- No automatic retries
- User-driven retry only
- No localStorage/sessionStorage usage

**MUST NOT**:

- Expose stack traces or internal error details
- Display correlation IDs in UI
- Retry on 401/403
- Implement fail-open behavior

**Evidence**: UI_ERROR_LOADING_CONVENTIONS.md, UI_FETCH_CONTRACT.md, SECURITY_BASELINE.md

---

## 5) Verification Requirements

**MUST provide ALL of the following evidence**:

1. **Command Proofs**:
   - `git diff --name-only`
   - `git diff package.json`
   - `git diff package-lock.json`
   - `grep -r "/api/v1" client/src`
   - `grep -r "localStorage\|sessionStorage" client/src`

2. **Code Proofs**:
   - 401/403 handling location
   - Normalized error messages location
   - Reusable UI components file list

3. **Manual Test Results**:
   - List load success
   - Empty list
   - Detail success
   - Create success
   - Suspend/Unsuspend success
   - 401/403 deny
   - 5xx error
   - Network error

**Evidence**: GATE_29_VERIFICATION_EVIDENCE.md

---

## 6) Deviation Policy

**Any deviation from this authorization requires a new Gate.**

Examples of deviations requiring a new Gate:

- Adding new dependencies
- Adding new screens or features
- Modifying BFF source code
- Adding routing libraries
- Implementing dashboard or settings UI

**Action on deviation**: STOP immediately, create new Gate plan, request approval.

---

## 7) Acceptance Criteria

This authorization is considered ACTIVE and BINDING when ALL of the following are true:

- [x] File modification allowlist is explicit
- [x] Content allowlist is explicit
- [x] Hard STOP conditions are explicit and enforceable
- [x] Security requirements are documented
- [x] Verification requirements are documented
- [x] Deviation policy is documented

---

## 8) Signature

**Approved By**: Governance Authority  
**Date**: 2026-02-10  
**Status**: ACTIVE — BINDING AUTHORIZATION
