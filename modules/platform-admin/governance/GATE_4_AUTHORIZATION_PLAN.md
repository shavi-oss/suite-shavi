# Gate 4 — Authorization & RBAC Plan (Docs-Only)

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Module Name    | platform-admin                          |
| Document Title | GATE_4_AUTHORIZATION_PLAN               |
| Repo           | Suite (Layer / Product Repo)            |
| Status         | DRAFT — DOCS-ONLY                       |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-02-07                              |

---

> [!CAUTION]
> **NO EXECUTION ALLOWED**
>
> This is a **DOCS-ONLY** gate. No code, guards, decorators, Prisma changes, dependencies, or tests are permitted.
>
> This gate defines the authorization model specification only.

---

## 1) Purpose

Gate 4 establishes the **Authorization & RBAC specification** for the `platform-admin` module.

This gate defines:

- RBAC role-to-permission mappings
- Authorization invariants
- Deny-by-default enforcement rules
- Stop conditions for authorization violations

**Evidence**: `MODULE_SECURITY_LAWS.md` Section 3.2 (RBAC Enforcement)

---

## 2) Scope (Docs-Only)

### 2.1 What Is Allowed

✅ **Documentation Only**:

- Define RBAC scope matrix
- Define authorization stop rules
- Define authorization invariants
- Define deny-by-default model
- Map roles to endpoint permissions

### 2.2 What Is Explicitly Forbidden

❌ **No Code**:

- No Guards
- No Decorators
- No Controllers
- No Services
- No DTOs

❌ **No Infrastructure**:

- No Prisma schema changes
- No migrations
- No dependencies
- No environment variables

❌ **No Tests**:

- No test files
- No test execution

**Evidence**: Prompt constraint — "ممنوع تمامًا: أي كود"

---

## 3) Gate Inputs

### 3.1 Binding Sources (MUST USE)

All claims in Gate 4 documents MUST be backed by these sources:

- `MODULE_SECURITY_LAWS.md` — RBAC matrix (Section 3.2), security invariants
- `MODULE_SCOPE_LOCK.md` — Allowed endpoints (Section 2.2), allowed roles (Section 2.5)
- `IMPLEMENTATION_PLAN_PLATFORM_ADMIN.md` — Execution flows, fail-closed checkpoints
- `PLATFORM_ADMIN_READINESS.md` — Current state, future gates

**Evidence**: `MODULE_SECURITY_LAWS.md` Section 3.2

---

### 3.2 RBAC Constraints (LOCKED)

**Allowed Roles Only**:

- `platform_admin`
- `developer_ops`
- `support`
- `viewer`

**Evidence**: `MODULE_SCOPE_LOCK.md` Section 2.5

---

**Forbidden**:

- Any additional roles
- Dynamic permissions
- Permission inference
- Default allow

**Evidence**: Prompt constraint — "ممنوع: أي دور إضافي"

---

## 4) Gate Outputs

### 4.1 Required Files

Gate 4 MUST produce these files in `modules/platform-admin/governance/`:

1. `GATE_4_AUTHORIZATION_PLAN.md` (this file)
2. `RBAC_SCOPE_MATRIX.md`
3. `AUTHORIZATION_STOP_RULES.md`
4. `GATE_4_AUTHORIZATION_DRAFT.md`

### 4.2 File Purposes

**RBAC_SCOPE_MATRIX.md**:

- Strict mapping: Endpoint/Action → Role → Allow | Deny
- All Write = Deny by default
- Read only where explicitly proven
- No shortcuts, no implicit allow

**AUTHORIZATION_STOP_RULES.md**:

- Explicit STOP rules for authorization violations
- Each rule linked to binding source
- Covers: missing role, role mismatch, write without allow, fallback logic, ambiguous permission, fail-open behavior

**GATE_4_AUTHORIZATION_DRAFT.md**:

- Authorization invariants
- Deny-by-default model
- RBAC ↔ Fail-Closed mapping
- Non-goals (what will NOT be implemented)
- Transition criteria to Gate 5

---

## 5) Verification Checklist (Docs-Only)

Gate 4 is complete when:

- [ ] All 4 required files created in `modules/platform-admin/governance/`
- [ ] All claims backed by binding sources
- [ ] RBAC matrix covers all endpoints from `MODULE_SCOPE_LOCK.md`
- [ ] All STOP rules linked to `MODULE_SECURITY_LAWS.md` or `IMPLEMENTATION_PLAN_PLATFORM_ADMIN.md`
- [ ] Deny-by-default model explicitly documented
- [ ] No code, guards, decorators, Prisma, dependencies, or tests created
- [ ] No files modified outside `modules/platform-admin/governance/`
- [ ] No assumptions or inferences beyond binding sources

---

## 6) Transition to Gate 5

Gate 4 → Gate 5 transition requires:

- All Gate 4 verification checklist items complete
- User approval of authorization specification
- Clean working tree (`git status`)
- No pending changes outside governance docs

**Evidence**: `PLATFORM_ADMIN_READINESS.md` Section 5 (Readiness Gates)

---

## 7) Signature

**Approved By**: Governance Authority  
**Date**: 2026-02-07  
**Status**: DRAFT — DOCS-ONLY
