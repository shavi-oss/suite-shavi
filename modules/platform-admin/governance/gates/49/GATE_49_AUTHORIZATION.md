# Gate 49 — Authorization

## Suite Session Implementation (httpOnly Cookie-Based)

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Gate Number    | 49                                      |
| Gate Name      | Suite Session Implementation            |
| Document Title | GATE_49_AUTHORIZATION                   |
| Repo           | Suite (Layer / Product Repo)            |
| Module         | platform-admin                          |
| Status         | FINAL — AUTHORIZATION (49A DOCS-ONLY)   |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-02-12                              |

---

## 1) Gate 49A Authorization (Active Now)

**ALLOWED** (Docs-Only):

Create the following 4 files ONLY under `modules/platform-admin/governance/`:

1. `GATE_49_PLAN.md`
2. `GATE_49_AUTHORIZATION.md`
3. `GATE_49_CHECKLIST.md`
4. `GATE_49_STOP_CONDITIONS.md`

**Total**: 4 files

**NO IMPLEMENTATION AUTHORIZED IN GATE 49A**

---

## 2) Gate 49B Pre-Authorization Blueprint (NOT Active Yet)

**Status**: NOT AUTHORIZED (requires separate Gate 49B authorization)

**When Gate 49B is authorized, the following file allowlist will apply**:

### Files to Create (Gate 49B)

```
modules/platform-admin/src/auth/session.service.ts
modules/platform-admin/src/auth/auth.controller.ts
modules/platform-admin/src/auth/session.guard.ts
modules/platform-admin/src/auth/dto/login.dto.ts
modules/platform-admin/src/auth/dto/session-response.dto.ts
modules/platform-admin/tests/unit/auth/session.service.spec.ts
modules/platform-admin/tests/unit/auth/auth.controller.spec.ts
modules/platform-admin/tests/unit/auth/session.guard.spec.ts
```

### Files to Modify (Gate 49B)

```
modules/platform-admin/platform-admin.module.ts
```

**Changes Allowed**:

- Add `AuthController` to controllers array
- Add `SessionService` to providers array
- Wire `SessionGuard` to protected endpoints

**Total Files**: 8 new, 1 modified

---

## 3) Forbidden Actions (Hard Stop)

**FORBIDDEN in Gate 49A and Gate 49B**:

- Modifying any file outside the allowlist
- Creating any file outside the allowlist
- Modifying any dependency file (package.json, package-lock.json)
- Modifying Core (Bassan.os is immutable, ARCHITECTURAL_LAWS.md LAW-2)
- Modifying UI to store tokens (localStorage/sessionStorage forbidden, SECURITY_BASELINE.md 4.2)
- Allowing UI → Core direct calls (forbidden, ARCHITECTURAL_LAWS.md LAW-3)
- Implementing refresh tokens (NOT AVAILABLE in Core v1, INTEGRATION_CONTRACT_CORE.md 5.1)
- Implementing service tokens (NOT AVAILABLE in Core v1, INTEGRATION_CONTRACT_CORE.md 5.1)
- Adding "dev bypass" or "temporary skip" auth shortcuts
- Weakening fail-closed behavior (401/403 must be enforced)
- Logging secrets/PII (forbidden, SECURITY_BASELINE.md 4.7)
- Storing Core JWT in UI (forbidden, GATE_48_DEV_AUTH_FLOW_LOCK.md Section 2.2)

---

## 4) Stop Conditions Escalation Protocol

**If ANY stop condition is triggered** (see GATE_49_STOP_CONDITIONS.md):

1. **HALT** all work immediately
2. **DOCUMENT** the violation with:
   - Stop condition ID
   - File(s) involved
   - Timestamp
   - Correlation ID (if applicable)
3. **REVERT** any changes made after the violation
4. **ESCALATE** to Governance Authority
5. **WAIT** for explicit approval before resuming

**NO EXCEPTIONS**. Stop conditions are non-negotiable.

---

## 5) Evidence Requirements (Gate 49B)

**MUST provide before Gate 49B closure**:

1. `git diff --name-only` output (verify only allowed files)
2. `git diff` output (verify no forbidden changes)
3. `npx tsc -p modules/platform-admin/tsconfig.bff.json` output (exit code 0)
4. `npm run test:platform-admin:unit` output (all pass)
5. Runtime smoke test outputs (curl commands + responses showing httpOnly cookie issuance)

**MUST NOT show**:

- Dependency changes
- Core modifications
- UI token storage
- Files outside allowlist

---

## 6) Signature

**Approved By**: Governance Authority  
**Date**: 2026-02-12  
**Status**: FINAL — AUTHORIZATION (49A DOCS-ONLY, 49B PENDING)
