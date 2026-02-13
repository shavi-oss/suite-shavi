# Gate 6C — RBAC Activation

## Platform Admin Module

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Gate Number    | 6C                                      |
| Gate Name      | RBAC Activation                         |
| Document Title | GATE_6C_RBAC_ACTIVATION                 |
| Repo           | Suite (Layer / Product Repo)            |
| Module         | platform-admin                          |
| Status         | FINAL — PLAN                            |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-02-12                              |
| Risk Level     | P1 (Critical Security)                  |

---

## 1) Executive Summary

**Goal**: Activate RBAC permission enforcement without expanding routes or weakening fail-closed architecture

**Scope**: Permission map enforcement, `RbacGuard` integration, route-level audit

**Risk**: P1 (Critical Security) — Authorization bypass, permission drift, implicit access

**Preservation**: Global `DenyAllGuard` active, `request.user` required, fail-closed on unauthorized

**Blocker**: Role structure must be proven before execution

---

## 2) Architectural Context

**Current State** (Post-Gate 6B):

- `request.user` populated from JWT (with proven fields only)
- `RbacGuard` exists but not fully wired
- Permission map undefined
- Role-to-permission mapping unclear

**Target State**:

- Permission map defined and enforced
- `RbacGuard` wired to protected routes
- Fail-closed on missing permissions
- No new controllers, no route expansion

---

## 3) Preconditions (MUST BE VERIFIED BEFORE EXECUTION)

### 3.1 Role Structure Proof Required

**Requirement**: Role names and structure must be proven by Core contract or existing evidence

**Verification Sources**:

- Core contract extract in governance
- Existing implementation evidence
- Integration test evidence

**Forbidden**: Inventing role names (e.g., `admin`, `manager`, `viewer`) without proof

**Action**: STOP execution of Gate 6C until role structure is proven

---

### 3.2 Permission Map Derivation

**Approach**: Derive permission map from proven role structure

**Policy**: Map permissions based on whatever proven roles/claims exist in `request.user`

**Example** (if roles proven):

- If `request.user.roles` contains proven role names, map to permissions
- If roles not proven, Gate 6C cannot execute

---

## 4) Risk Classification

**Risk Level**: P1 (Critical Security)

**Risks**:

- Authorization bypass if permissions not enforced
- Permission drift (unauthorized access)
- Implicit access without explicit permission check
- Role escalation

**Mitigation**:

- Explicit permission map
- Fail-closed on missing permissions
- Route-level audit checklist
- No implicit access

---

## 5) Permission Map Enforcement

### 5.1 Permission Structure (Conceptual)

**Policy-Level Structure**:

- Permissions should map resources to actions
- Example format: `resource:action`
- Resources: organization, internal-user, org-mapping, audit
- Actions: read, create, update, delete

**Actual Permissions**: Must be derived from proven role structure

---

### 5.2 Role-to-Permission Mapping (Requires Proof)

**Approach**: Map proven roles to permissions

**If Roles Proven**: Define mapping based on proven role names

**If Roles NOT Proven**: Gate 6C cannot execute until proof provided

**Source**: Core contract or existing evidence

---

## 6) ExplicitAllowGuard Integration

### 6.1 Public Routes (No RBAC)

**Routes with `ExplicitAllowGuard`** (4 usages):

- `GET /platform-admin/health` (HealthController)
- `POST /platform-admin/auth/login` (AuthController)
- `POST /platform-admin/auth/logout` (AuthController)
- `GET /platform-admin/auth/session` (AuthController)

**RBAC**: NOT REQUIRED (public routes)

---

### 6.2 Protected Routes (RBAC Required)

**Routes without `ExplicitAllowGuard`**:

- All Organization endpoints
- All InternalUser endpoints
- All OrgMapping endpoints
- All Audit endpoints

**RBAC**: REQUIRED (fail-closed on unauthorized)

---

## 7) Route-Level Audit Checklist

### 7.1 Organization Endpoints

| Endpoint                                   | Permission Required (Conceptual) | RBAC Wired |
| ------------------------------------------ | -------------------------------- | ---------- |
| `GET /platform-admin/organizations`        | `organization:read`              | TBD        |
| `GET /platform-admin/organizations/:id`    | `organization:read`              | TBD        |
| `POST /platform-admin/organizations`       | `organization:create`            | TBD        |
| `PATCH /platform-admin/organizations/:id`  | `organization:update`            | TBD        |
| `DELETE /platform-admin/organizations/:id` | `organization:delete`            | TBD        |

**Note**: Actual permissions depend on proven role structure

---

### 7.2 InternalUser Endpoints

| Endpoint                                    | Permission Required (Conceptual) | RBAC Wired |
| ------------------------------------------- | -------------------------------- | ---------- |
| `GET /platform-admin/internal-users`        | `internal-user:read`             | TBD        |
| `GET /platform-admin/internal-users/:id`    | `internal-user:read`             | TBD        |
| `POST /platform-admin/internal-users`       | `internal-user:create`           | TBD        |
| `PATCH /platform-admin/internal-users/:id`  | `internal-user:update`           | TBD        |
| `DELETE /platform-admin/internal-users/:id` | `internal-user:delete`           | TBD        |

**Note**: Actual permissions depend on proven role structure

---

### 7.3 OrgMapping Endpoints

| Endpoint                            | Permission Required (Conceptual) | RBAC Wired |
| ----------------------------------- | -------------------------------- | ---------- |
| `GET /platform-admin/org-mappings`  | `org-mapping:read`               | TBD        |
| `POST /platform-admin/org-mappings` | `org-mapping:create`             | TBD        |

**Note**: Actual permissions depend on proven role structure

---

### 7.4 Audit Endpoints

| Endpoint                    | Permission Required (Conceptual) | RBAC Wired |
| --------------------------- | -------------------------------- | ---------- |
| `GET /platform-admin/audit` | `audit:read`                     | TBD        |

**Note**: Actual permissions depend on proven role structure

---

## 8) No New Controllers

**Frozen**: EXACTLY 6 controllers

**Verification**: `build.spec.ts` enforces strict allowlist

**Forbidden**: Adding new controllers without governance approval

---

## 9) No Route Expansion

**Frozen**: Existing routes only

**Verification**: Manual audit of controller files

**Forbidden**: Adding new routes without governance approval

---

## 10) RBAC Verification Checklist

### 10.1 Permission Map Defined

**Requirement**: Permission map defined in `RbacGuard` or separate service

**Verification**: Code review

---

### 10.2 RbacGuard Wired to Protected Routes

**Requirement**: `RbacGuard` applied to all protected routes

**Verification**: Code review + manual audit

---

### 10.3 Fail-Closed on Unauthorized

**Requirement**: `RbacGuard` throws 403 if permission missing

**Verification**: New test in `rbac.guard.spec.ts`

---

### 10.4 request.user Required

**Requirement**: `RbacGuard` fails if `request.user` undefined

**Verification**: New test in `rbac.guard.spec.ts`

---

## 11) Failure Scenarios

### 11.1 Missing Permission

**Scenario**: User lacks required permission

**Expected**: 403 Forbidden

**Verification**: New test in `rbac.guard.spec.ts`

---

### 11.2 Missing request.user

**Scenario**: `request.user` undefined (SessionGuard bypassed)

**Expected**: 401 Unauthorized

**Verification**: New test in `rbac.guard.spec.ts`

---

### 11.3 Invalid Role

**Scenario**: User has unrecognized role

**Expected**: 403 Forbidden

**Verification**: New test in `rbac.guard.spec.ts`

---

## 12) Allowed File List

**ONLY** these files may be modified:

```
modules/platform-admin/src/auth/rbac.guard.ts
modules/platform-admin/tests/unit/security/rbac.guard.spec.ts
modules/platform-admin/governance/GATE_6C_RBAC_ACTIVATION.md
modules/platform-admin/governance/GATE_6C_EXECUTION_REPORT.md
modules/platform-admin/governance/GATE_6C_VERIFICATION_EVIDENCE.md
```

**Total**: 1 production file, 1 test file, 3 governance files

---

## 13) Explicit Forbidden List

**MUST NOT** modify:

- `platform-admin.module.ts` (controller/provider list)
- `deny-all.guard.ts`
- `explicit-allow.guard.ts`
- `session.guard.ts`
- Any controller files
- Any service files
- `package.json` or `package-lock.json`
- Prisma schema

**MUST NOT**:

- Disable `DenyAllGuard`
- Add new controllers
- Add new routes
- Expand `ExplicitAllowGuard` usage
- Introduce implicit permissions

---

## 14) Acceptance Criteria

### 14.1 Permission Map Defined

**Requirement**: Permission map defined and enforced based on proven roles

**Verification**: Code review

---

### 14.2 RbacGuard Wired

**Requirement**: `RbacGuard` applied to all protected routes

**Verification**: Code review + manual audit

---

### 14.3 Fail-Closed on Unauthorized

**Requirement**: `RbacGuard` throws 403 if permission missing

**Verification**: New test in `rbac.guard.spec.ts`

---

### 14.4 All Tests Pass

**Requirement**: 26/26 suites, 228+ tests (existing 225 + new 3 minimum)

**Verification**: Use commands from `RELEASE_QUALIFICATION_MATRIX_V2.md`

**Primary Command**: `npm test`

---

## 15) Verification Commands

**Pre-Flight**:

```bash
git status --porcelain
git diff --name-only
npm test
```

**Post-Execution**:

```bash
git diff --name-only
npm test
git diff package.json
git diff package-lock.json
```

**Expected**:

- `git diff --name-only`: ONLY 5 files (1 prod, 1 test, 3 governance)
- `npm test`: All tests pass (26/26 suites minimum, 228+ tests)
- `git diff package.json`: Empty
- `git diff package-lock.json`: Empty

**Note**: Use commands exactly as listed in `RELEASE_QUALIFICATION_MATRIX_V2.md`

---

## 16) Failure Conditions

**STOP if**:

- Role structure not proven
- Any test fails
- Dependency changes detected
- Files outside allowlist modified
- `DenyAllGuard` disabled or weakened
- Controller count changes
- `ExplicitAllowGuard` usage count changes
- Permission map undefined

**Action**: Rollback all changes, report failure

---

## 17) Rollback Strategy

**If failure detected**:

1. `git reset --hard HEAD`
2. Verify clean working tree: `git status --porcelain`
3. Verify tests pass: `npm test`
4. Report failure with error details

**No partial commits**: All changes must pass verification before commit

---

## 18) Governance Compliance Statement

This gate complies with:

- `ARCHITECTURAL_LAWS.md` (Fail-closed by default, least privilege)
- `SECURITY_BASELINE.md` (RBAC enforcement, no implicit access)
- `modules/platform-admin/governance/PRODUCTION_READINESS_BASELINE_V2.md` (RBAC guard topology)
- `modules/platform-admin/governance/MODULE_SCOPE_LOCK.md` (No scope expansion)
- `modules/platform-admin/governance/STAGE_6_RUNTIME_STRATEGY.md` (RBAC activation sequence)

**Preservation Guarantees**:

- Global `DenyAllGuard` active
- No new controllers
- No route expansion
- Fail-closed on unauthorized
- Explicit permission enforcement

---

## 19) Detected Conflicts (Must Resolve Before Execution)

### Conflict 1: Role Structure Unknown

**Issue**: Cannot define permission map without knowing role structure

**Resolution Required**: Prove role names and structure from Core contract or existing evidence

**Action**: STOP execution until role structure is proven

---

### Conflict 2: Permission Mapping Undefined

**Issue**: Cannot map roles to permissions without proven role structure

**Resolution Required**: Define permission mapping based on proven roles

**Action**: Requires prior "Role Structure Proof" step (docs-only) before execution

---

## 20) Signature

**Approved By**: Governance Authority  
**Date**: 2026-02-12  
**Status**: FINAL — PLAN  
**Risk Level**: P1 (Critical Security)
