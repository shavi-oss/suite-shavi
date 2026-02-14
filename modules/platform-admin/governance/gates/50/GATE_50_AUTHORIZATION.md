# Gate 50 — Authorization

## BFF → Core JWT Forwarding (Server-Side Only)

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Gate Number    | 50                                      |
| Gate Name      | BFF → Core JWT Forwarding               |
| Document Title | GATE_50_AUTHORIZATION                   |
| Repo           | Suite (Layer / Product Repo)            |
| Module         | platform-admin                          |
| Status         | FINAL — AUTHORIZATION (50A DOCS-ONLY)   |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-02-12                              |

---

## 1) Gate 50A Authorization (Active Now)

**ALLOWED** (Docs-Only):

Create the following 4 files ONLY under `modules/platform-admin/governance/`:

1. `GATE_50_PLAN.md`
2. `GATE_50_AUTHORIZATION.md`
3. `GATE_50_STOP_CONDITIONS.md`
4. `GATE_50_CHECKLIST.md`

**Total**: 4 files

**NO IMPLEMENTATION AUTHORIZED IN GATE 50A**

---

## 2) Gate 50B Pre-Authorization Blueprint (NOT Active Yet)

**Status**: NOT AUTHORIZED (requires separate Gate 50B authorization)

**When Gate 50B is authorized, the following file allowlist will apply**:

### Files to Create (Gate 50B)

```
modules/platform-admin/src/auth/jwt-storage.service.ts
modules/platform-admin/tests/unit/auth/jwt-storage.service.spec.ts
```

### Files to Modify (Gate 50B)

```
modules/platform-admin/src/core-adapter/core.client.ts
modules/platform-admin/src/auth/session.guard.ts (or create new guard)
modules/platform-admin/tests/unit/core-adapter/core.client.spec.ts
modules/platform-admin/platform-admin.module.ts
```

**Changes Allowed**:

- Add `JwtStorageService` to providers array in `platform-admin.module.ts`
- Add `coreJwt` parameter to `CoreClient.validateOrganization()` method
- Set `Authorization: Bearer ${coreJwt}` header in CoreClient
- Extract Core JWT from JwtStorageService in SessionGuard
- Attach Core JWT to request context (server-side only)
- Add JWT forwarding tests to `core.client.spec.ts`

**Total Files**: 2 new, 4-5 modified

---

## 3) Forbidden Actions (Hard Stop)

**FORBIDDEN in Gate 50A and Gate 50B**:

- Modifying any file outside the allowlist
- Creating any file outside the allowlist
- Modifying any dependency file (package.json, package-lock.json)
- Modifying Core (Bassan.os is immutable, ARCHITECTURAL_LAWS.md LAW-2)
- Exposing Core JWT to UI (cookies, localStorage, sessionStorage, response body)
- Implementing refresh tokens (NOT AVAILABLE in Core v1, INTEGRATION_CONTRACT_CORE.md 5.1)
- Implementing service tokens (NOT AVAILABLE in Core v1, INTEGRATION_CONTRACT_CORE.md 5.1)
- Adding retry logic on 401/403 (forbidden, INTEGRATION_CONTRACT_CORE.md 5.1 line 137)
- Weakening fail-closed behavior (401/403 must be enforced)
- Logging Core JWT (forbidden, SECURITY_BASELINE.md 4.7)
- Removing correlation ID propagation
- Creating silent fallback behaviors on auth failures

---

## 4) Stop Conditions Escalation Protocol

**If ANY stop condition is triggered** (see GATE_50_STOP_CONDITIONS.md):

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

## 5) Evidence Requirements (Gate 50B)

**MUST provide before Gate 50B closure**:

1. `git diff --name-only` output (verify only allowed files)
2. `git diff` output (verify no forbidden changes)
3. `npx tsc -p modules/platform-admin/tsconfig.bff.json` output (exit code 0)
4. `npx jest -c jest.config.cjs modules/platform-admin/tests/unit` output (all pass)
5. Runtime smoke test outputs (Core API call logs showing JWT header, no UI exposure)

**MUST NOT show**:

- Dependency changes
- Core modifications
- UI JWT exposure
- Files outside allowlist

---

## 6) Signature

**Approved By**: Governance Authority  
**Date**: 2026-02-12  
**Status**: FINAL — AUTHORIZATION (50A DOCS-ONLY, 50B PENDING)
