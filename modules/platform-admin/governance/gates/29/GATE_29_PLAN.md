# Gate 29 — Web Admin Stabilization & Hardening — Plan

## Document Control

| Attribute      | Value                                       |
| -------------- | ------------------------------------------- |
| Gate Number    | 29                                          |
| Gate Name      | Web Admin Stabilization & Hardening         |
| Document Title | GATE_29_PLAN                                |
| Repo           | Suite (Layer / Product Repo)                |
| Module         | platform-admin                              |
| Status         | ACTIVE — AWAITING EXECUTION                 |
| Execution Mode | CODE + EVIDENCE · STRICT · GOVERNANCE-FIRST |
| Authority      | GATE_29_AUTHORIZATION.md                    |
| Effective Date | 2026-02-10                                  |

---

## 1) Purpose

Harden and stabilize the web admin UI for organization management with normalized error handling, consistent UI patterns, and comprehensive verification evidence.

**Gate Intent**:

- Error UX hardening
- UI consistency
- Verification evidence
- No new features

**Execution Type**: CODE + EVIDENCE

---

## 2) Explicit In-Scope

### 2.1 Error UX Hardening

**MUST implement**:

- Single normalized error model
- Standardized error messages across all screens
- Explicit 401/403 handling (fail-closed, no optimistic UI)
- Network/offline-friendly error messaging

**Evidence**: UI_ERROR_LOADING_CONVENTIONS.md, UI_FETCH_CONTRACT.md

---

### 2.2 UI Consistency

**MUST implement**:

- Reusable UI pattern for Loading / Empty / Error states
- Reusable error banner/toast style (no new dependencies)
- Consistent messaging across List / Detail / Create screens

**Evidence**: UI_ERROR_LOADING_CONVENTIONS.md

---

### 2.3 Verification Evidence

**MUST provide**:

- Manual verification script in governance evidence
- Grep-based proofs (no /api/v1, no localStorage/sessionStorage)
- Command outputs (git diff, package.json unchanged)
- Proof of 401/403 behavior in code

**Evidence**: Gate 29 verification requirements

---

## 3) Explicit Out-of-Scope

**MUST NOT**:

- Add new screens or features
- Add new dependencies
- Implement routing libraries
- Add dashboard, settings, auth, or login UI
- Call Core API directly (/api/v1)
- Use localStorage or sessionStorage
- Modify files outside `modules/platform-admin/client/**` or `modules/platform-admin/governance/**`

---

## 4) Implementation Requirements

### 4.1 Error Normalization

**MUST create**:

- `client/src/utils/errors.ts` — Normalized error model and safe message mapping

**MUST normalize errors**:

| HTTP Status | Safe Message                                              |
| ----------- | --------------------------------------------------------- |
| 400         | "Invalid request. Please check your input."               |
| 401         | "Unauthorized access. Please contact your administrator." |
| 403         | "Unauthorized access. Please contact your administrator." |
| 404         | "Resource not found."                                     |
| 500         | "An error occurred. Please try again."                    |
| Network     | "Network error. Please check your connection."            |
| Timeout     | "Request timed out. Please try again."                    |

**Evidence**: UI_ERROR_LOADING_CONVENTIONS.md Section 4.3

---

### 4.2 Reusable UI Components

**MUST create**:

- `client/src/components/LoadingState.tsx` — Reusable loading indicator
- `client/src/components/EmptyState.tsx` — Reusable empty state message
- `client/src/components/ErrorState.tsx` — Reusable error banner with retry

**MUST NOT**:

- Add component library dependencies
- Use external UI frameworks

---

### 4.3 Update Existing Components

**MUST update**:

- `client/src/api/platformAdmin.ts` — Use normalized error model
- `client/src/components/OrganizationList.tsx` — Use reusable UI components
- `client/src/components/OrganizationDetail.tsx` — Use reusable UI components
- `client/src/components/OrganizationCreate.tsx` — Use reusable UI components

**MUST preserve**:

- Existing functionality
- Fail-closed behavior on 401/403
- User-driven retry only

---

## 5) Verification Requirements

### 5.1 Command Proofs

**MUST provide**:

- `git diff --name-only` (show only allowed paths changed)
- `git diff package.json` (must be empty)
- `git diff package-lock.json` (must be empty)
- `grep -r "/api/v1" client/src` (must be empty)
- `grep -r "localStorage\|sessionStorage" client/src` (must be empty)

---

### 5.2 Code Proofs

**MUST provide**:

- Proof of 401/403 handling in `api/platformAdmin.ts` (code location)
- Proof of normalized error messages (code location)
- Proof of reusable UI components (file list)

---

### 5.3 Manual Test Script

**MUST provide manual test steps and results for**:

1. List load success
2. Empty list
3. Detail success
4. Create success
5. Suspend/Unsuspend success
6. 401/403 deny (simulated)
7. 5xx error (simulated)
8. Network error (simulated)

**Evidence**: GATE_29_VERIFICATION_EVIDENCE.md

---

## 6) Forbidden Behaviors (STOP Conditions)

**STOP immediately if**:

- Any new dependencies added
- Any routing library added
- Any files modified outside `client/**` or `governance/**`
- Any Core API calls added (/api/v1)
- Any localStorage or sessionStorage usage added
- Any new screens or features added
- Any fail-open behavior introduced

**Action on STOP**: Halt execution, document violation, escalate to Governance Authority.

---

## 7) Deliverables

**MUST deliver EXACTLY**:

1. `GATE_29_PLAN.md` (this file)
2. `GATE_29_AUTHORIZATION.md`
3. `GATE_29_EXECUTION_REPORT.md`
4. `GATE_29_VERIFICATION_EVIDENCE.md`
5. Updated client code (error normalization, reusable components)

---

## 8) Evidence Required to Close Gate 29

**MUST provide ALL of the following evidence**:

1. **File List**: All files created/modified in `client/**` and `governance/**`
2. **Command Output**: `git diff --name-only` (prove only allowed paths changed)
3. **Command Output**: `git diff package.json` (prove no dependencies modified)
4. **Command Output**: `git diff package-lock.json` (prove no dependencies modified)
5. **Grep Proof**: `/api/v1` (prove no Core calls)
6. **Grep Proof**: `localStorage|sessionStorage` (prove no insecure storage)
7. **Code Proof**: 401/403 handling location
8. **Manual Test Results**: All 8 test scenarios executed and documented

---

## 9) Acceptance Criteria

Gate 29 is considered COMPLETE when ALL of the following are true:

- [ ] Normalized error model implemented
- [ ] Reusable UI components created (Loading, Empty, Error)
- [ ] All existing components updated to use reusable components
- [ ] All error messages standardized
- [ ] 401/403 fail-closed behavior verified
- [ ] No new dependencies added
- [ ] No Core API calls added
- [ ] No localStorage/sessionStorage usage added
- [ ] All command proofs provided
- [ ] All manual test results documented
- [ ] All STOP conditions avoided

---

## 10) Signature

**Approved By**: Governance Authority  
**Date**: 2026-02-10  
**Status**: ACTIVE — AWAITING EXECUTION
