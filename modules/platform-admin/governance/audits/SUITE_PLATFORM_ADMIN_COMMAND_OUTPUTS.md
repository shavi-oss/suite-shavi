# SUITE PLATFORM-ADMIN — COMMAND OUTPUTS (RAW)

**Audit Date**: 2026-02-06  
**Audit Type**: Repository Governance Audit (Ultra-Strict)  
**Target**: modules/platform-admin/\*\*

---

## 1. Repository State

### git rev-parse --abbrev-ref HEAD

```
master
```

### git log --oneline --decorate -5

```
2756236 (HEAD -> master, tag: suite-platform-admin-gate-3) feat(platform-admin): Gate 3 org-mapping (fail-closed, no rbac/audit)
ee4c70c docs(governance): finalize Gate 2 integration readiness (docs-only)
928742e (tag: suite-platform-admin-gate-1, origin/master) gate(1.9): finalize Gate 1 verification
641d13a (tag: suite-platform-admin-gate-1.8) gate(1.8): update non-regression test to reflect Gate 1.7 controllers
9567bbd (tag: suite-platform-admin-gate-1.7) gate(1.7): close platform-admin with governance amendment
```

### git status --porcelain

```
(empty - clean working tree)
```

---

## 2. Tag Verification

### git show suite-platform-admin-gate-3 --no-patch

```
tag suite-platform-admin-gate-3
Tagger: shavi-oss <eslamabdelshafi2@gmail.com>
Date:   Fri Feb 6 11:10:24 2026 +0200

Gate 3 — Org Mapping CLOSED (No RBAC, No Audit, No Prisma, No deps). Core: GET /api/v1/organizations/:id only. Date: 2026-02-06

commit 275623656d2d7fa54dbc256ebb005ccdd4d795d5
Author: shavi-oss <eslamabdelshafi2@gmail.com>
Date:   Fri Feb 6 11:07:04 2026 +0200

    feat(platform-admin): Gate 3 org-mapping (fail-closed, no rbac/audit)
```

### git rev-parse suite-platform-admin-gate-3

```
82e298bf39b95059d219380b1d6a1e49b6d0d988
```

---

## 3. Diff Scan (Gate 3 Tag)

### git diff --name-only suite-platform-admin-gate-3^..suite-platform-admin-gate-3

```
modules/platform-admin/governance/GATE_3_COMPLETION_REPORT.md
modules/platform-admin/governance/GATE_3_EVIDENCE.md
modules/platform-admin/platform-admin.module.ts
modules/platform-admin/src/internal-users/internal-user.service.ts
modules/platform-admin/src/org-mapping/org-mapping.controller.ts
modules/platform-admin/src/org-mapping/org-mapping.service.ts
modules/platform-admin/tests/security/fail-closed.spec.ts
modules/platform-admin/tests/unit/controllers/org-mapping.controller.spec.ts
modules/platform-admin/tests/unit/core-adapter/core.client.spec.ts
modules/platform-admin/tests/unit/repositories/org-mapping.repository.spec.ts
modules/platform-admin/tests/unit/services/org-mapping.service.spec.ts
```

### git diff --stat suite-platform-admin-gate-3^..suite-platform-admin-gate-3

```
 .../governance/GATE_3_COMPLETION_REPORT.md         |  61 ++++++
 .../platform-admin/governance/GATE_3_EVIDENCE.md   | 150 +++++++++++++++
 modules/platform-admin/platform-admin.module.ts    |  18 +-
 .../src/internal-users/internal-user.service.ts    |  76 ++------
 .../src/org-mapping/org-mapping.controller.ts      |  11 +-
 .../src/org-mapping/org-mapping.service.ts         |  63 +-----
 .../tests/security/fail-closed.spec.ts             | 134 ++++++++++++-
 .../controllers/org-mapping.controller.spec.ts     | 142 ++++++++++++++
 .../tests/unit/core-adapter/core.client.spec.ts    |  72 +++++++
 .../repositories/org-mapping.repository.spec.ts    | 162 ++++++++++++++++
 .../unit/services/org-mapping.service.spec.ts      | 213 +++++++++++++++++++++
 11 files changed, 966 insertions(+), 136 deletions(-)
```

---

## 4. Forbidden Pattern Searches

### Service Token Search

**Command**: `rg -n "service token|serviceToken|x-service-token|client_credentials" modules/platform-admin`

**Results**: 119 matches found in governance documentation ONLY (no implementation)

**Critical Finding**: All matches are in governance docs discussing Core v1 limitations or Gate 3 checklist items. NO service token implementation found in src/ code.

---

### Audit Implementation Search

**Command**: `rg -n "AuditController|AuditService" modules/platform-admin`

**Results**:

- `AuditController` and `AuditService` exist in `src/audit/` directory
- Gate 3 evidence shows they were REMOVED from module wiring
- Tests still reference them (pre-Gate 3 artifacts)
- **CRITICAL**: Gate 3 tag message explicitly states "No Audit"

---

### RBAC/Guards Search

**Command**: `rg -n "UseGuards|@Roles|@Permissions|RBAC" modules/platform-admin`

**Results**:

- `RbacGuard` exists in `src/security/rbac.guard.ts`
- Applied to `OrganizationController`, `InternalUserController`, `AuditController`
- **NOT applied** to `OrgMappingController` (Gate 3 compliance)
- Gate 3 evidence confirms RBAC guards removed from org-mapping

---

### Prisma/Schema Search

**Command**: `rg -n "prisma|migrate|schema\.prisma" modules/platform-admin` (_.ts, _.js, \*.json only)

**Results**: Prisma usage found in:

- Repository layer (expected)
- Tests (expected)
- **NO schema changes** in Gate 3 diff

---

## 5. Core Endpoint Calls

### Core API Call Search

**Command**: `rg -n "api/v1/|/organizations/|CoreClient|core client|axios|fetch|HttpService" modules/platform-admin/src`

**Results**:

- **File**: `src/core-adapter/core.client.ts`
- **Endpoint**: `GET /api/v1/organizations/:id` (Line 71)
- **Method**: `fetch` (native Node.js)
- **Auth**: `Authorization: Bearer ${coreJwt}` (Line 78)
- **Contract Assertion**: Line 69 calls `assertCoreEndpointAllowed('GET', '/api/v1/organizations/${coreOrgId}')`

**Verdict**: SINGLE Core endpoint call, properly gated by contract assertion.

---

## 6. Build and Tests

### TypeScript Compilation

**Command**: `cd modules/platform-admin ; npx tsc --noEmit`

**Result**: ✅ PASS (Exit code: 0, no output)

---

### Jest Tests

**Command**: `cd modules/platform-admin ; npx jest`

**Result**: ❌ PARTIAL FAIL

**Summary**:

- **Test Suites**: 4 failed, 15 passed, 19 total
- **Tests**: 10 failed, 111 passed, 121 total

**Failed Tests**:

1. `tests/unit/db/prisma.wiring.spec.ts` (2 tests) - CORE_API_BASE_URL not configured in test env
2. `tests/unit/internal-users/internal-user.service.spec.ts` (4 tests) - AuditService removed but tests expect it

**Analysis**: Test failures are due to:

- Missing env var in test environment (infrastructure issue)
- Tests not updated after Gate 3 AuditService removal (test drift)

**Gate 3 Scope Tests**: All org-mapping tests PASS (verified in GATE_3_EVIDENCE.md: 35/35)

---

**END OF COMMAND OUTPUTS**

---

## POST-SPLIT VERIFICATION OUTPUTS

**Verification Date**: 2026-02-06 23:36:08  
**Purpose**: Verify repository state after Gate 3.1 test stabilization

### git status --porcelain

```
 M jest.config.cjs
 M modules/platform-admin/tests/non-regression/build.spec.ts
 M modules/platform-admin/tests/unit/db/prisma.wiring.spec.ts
 M modules/platform-admin/tests/unit/internal-users/internal-user.service.spec.ts
?? modules/platform-admin/governance/_audit/SUITE_PLATFORM_ADMIN_COMMAND_OUTPUTS.md
?? modules/platform-admin/governance/_audit/SUITE_PLATFORM_ADMIN_CORE_CALLS_MAP.md
?? modules/platform-admin/governance/_audit/SUITE_PLATFORM_ADMIN_FAIL_CLOSED_PROOF.md
?? modules/platform-admin/governance/_audit/SUITE_PLATFORM_ADMIN_REALITY_AUDIT.md
?? modules/platform-admin/tests/jest.setup.ts
```

**Analysis**: Uncommitted changes present (test fixes + audit docs)

---

### git log --oneline --decorate -10

```
2756236 (HEAD -> master, tag: suite-platform-admin-gate-3) feat(platform-admin): Gate 3 org-mapping (fail-closed, no rbac/audit)
ee4c70c docs(governance): finalize Gate 2 integration readiness (docs-only)
928742e (tag: suite-platform-admin-gate-1, origin/master) gate(1.9): finalize Gate 1 verification
641d13a (tag: suite-platform-admin-gate-1.8) gate(1.8): update non-regression test to reflect Gate 1.7 controllers
9567bbd (tag: suite-platform-admin-gate-1.7) gate(1.7): close platform-admin with governance amendment
c64fde1 (tag: suite-platform-admin-gate-1-partial-8of13) gate(1): unit tests for rbac, core allowlist, audit
b34a35a gate(1): organizations + org-mapping modules (8 endpoints)
55b26ba gate(1): append-only audit service + repository
6887bd5 gate(1): core adapter allowlist + safe error logging
784717f gate(1): security rbac roles + permissions + guard
```

---

### git tag --list suite-platform-admin-gate-3\* --sort=-creatordate

```
suite-platform-admin-gate-3
```

**Analysis**: Only Gate 3 tag exists (no Gate 3.1 tag yet)

---

### git show -s --oneline suite-platform-admin-gate-3

```
tag suite-platform-admin-gate-3

Gate 3 — Org Mapping CLOSED (No RBAC, No Audit, No Prisma, No deps). Core: GET /api/v1/organizations/:id only. Date: 2026-02-06
2756236 feat(platform-admin): Gate 3 org-mapping (fail-closed, no rbac/audit)
```

**Verification**: ✅ Tag points to HEAD commit `2756236`

---

### git show -s --oneline suite-platform-admin-gate-3.1

```
(no output - tag does not exist)
```

**Exit Code**: 1  
**Analysis**: Gate 3.1 tag not yet created (test fixes uncommitted)

---

### npx jest --config jest.config.cjs

**Summary**:

- **Test Suites**: 19 passed, 19 total
- **Tests**: 121 passed, 121 total
- **Snapshots**: 0 total
- **Time**: 22.532s
- **Exit Code**: 0

**Verdict**: ✅ **PASS** — All tests passing after Gate 3.1 test stabilization

---

**END OF POST-SPLIT VERIFICATION OUTPUTS**
