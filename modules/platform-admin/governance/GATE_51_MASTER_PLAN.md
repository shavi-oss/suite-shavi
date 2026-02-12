# Gate 51 — Master Plan

## Coordinated Hardening Phase (Multi-Phase Execution)

## Document Control

| Attribute      | Value                                           |
| -------------- | ----------------------------------------------- |
| Gate Number    | 51                                              |
| Gate Name      | Coordinated Hardening Phase                     |
| Document Title | GATE_51_MASTER_PLAN                             |
| Repo           | Suite (Layer / Product Repo)                    |
| Module         | platform-admin                                  |
| Status         | FINAL — MASTER PLAN (REVISED)                   |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST         |
| Authority      | Governance Authority (Layer)                    |
| Effective Date | 2026-02-12                                      |
| Revision       | 2 (Controllers removed, Core client restricted) |

---

## 1) Architectural Intent

**Why Gate 51 Exists**:
Gate 51 hardens the authorization boundary established in Gates 49B (Suite session) and 50B (Core JWT forwarding) by enforcing consistent fail-closed semantics in guards, adding runtime contract assertions, and validating cross-layer integration paths through comprehensive tests.

**Architectural Risk Mitigated**:

- **Inconsistent fail-closed enforcement** in SessionGuard may allow silent authorization bypass
- **Missing runtime contract assertions** (session presence, JWT presence, correlation ID) may propagate undetected violations
- **Untested integration paths** between Suite session → Core JWT → Core API leave fail-closed behavior unproven in cross-layer scenarios

**Why After Gate 50B**:
Gate 50B established JWT forwarding infrastructure. Gate 51 hardens the contract enforcement layer at the guard/runtime boundary ONLY, without touching controllers or public API surface. This ensures authorization failures exhibit consistent, predictable, fail-closed behavior before production use.

---

## 2) Phase Definitions

### Phase 51A — Contract Semantics Tightening (Guards Only)

**Goal**: Normalize 401/403 authorization failure semantics in SessionGuard to ensure consistent fail-closed behavior. NO controller changes, NO CoreClient changes.

**Strict Allowlist** (Exact File Paths):

```
modules/platform-admin/src/auth/session.guard.ts
modules/platform-admin/tests/unit/auth/session.guard.spec.ts
```

**Forbidden List**:

- `modules/platform-admin/src/core-adapter/core.client.ts` (deferred to 51B)
- `modules/platform-admin/src/organizations/organization.controller.ts`
- `modules/platform-admin/src/internal-users/internal-user.controller.ts`
- `modules/platform-admin/src/org-mapping/org-mapping.controller.ts`
- `modules/platform-admin/src/audit/audit.controller.ts`
- `modules/platform-admin/platform-admin.module.ts`
- `package.json` / `package-lock.json`
- `tsconfig.*.json`
- `.env` / environment files
- Any file in `src/db/`, `src/policy/`, `guards/` (except `src/auth/session.guard.ts`)

**Stop Conditions** (Phase-Specific):

- **SC-51A-1**: Any dependency modification detected (`package.json` or `package-lock.json` changed)
- **SC-51A-2**: Controller file modified (API surface change forbidden)
- **SC-51A-3**: CoreClient modified (deferred to 51B)
- **SC-51A-4**: Error message format changed (breaking UI contract)
- **SC-51A-5**: 401/403 semantics weakened (e.g., returning 200 on auth failure)
- **SC-51A-6**: New `process.env` usage added
- **SC-51A-7**: JWT or session ID logged
- **SC-51A-8**: File outside allowlist modified

**Verification Commands** (Exact):

```bash
git diff --name-only
npx tsc -p modules/platform-admin/tsconfig.bff.json
npx jest -c jest.config.cjs modules/platform-admin/tests/unit/auth/session.guard.spec.ts
npx jest -c jest.config.cjs modules/platform-admin/tests/unit
git diff package.json
git diff package-lock.json
```

**Evidence Files Required**:

- `modules/platform-admin/governance/GATE_51A_EXECUTION_REPORT.md`
- `modules/platform-admin/governance/GATE_51A_VERIFICATION_EVIDENCE.md`

**Rollback Steps** (Tag-Realistic):

```bash
git reset --hard suite-platform-admin-gate-50B
git clean -fd
```

**Commit Message + Tag Name**:

```bash
git commit -m "gate(51A): contract semantics tightening (guards only)"
git tag suite-platform-admin-gate-51A
```

**Approval Checkpoint**:
⚠️ **STOP and request approval before executing Phase 51A**

---

### Phase 51B — Runtime Assertions Layer

**Goal**: Add runtime boundary assertions to SessionGuard and CoreClient to detect and fail-closed on contract violations (missing session, missing JWT, missing correlation ID). CoreClient changes ONLY for assertions, NO behavior changes.

**Strict Allowlist** (Exact File Paths):

```
modules/platform-admin/src/auth/session.guard.ts
modules/platform-admin/src/core-adapter/core.client.ts
modules/platform-admin/tests/unit/auth/session.guard.spec.ts
modules/platform-admin/tests/unit/core-adapter/core.client.spec.ts
```

**Forbidden List**:

- Controllers (all)
- `platform-admin.module.ts`
- DTOs
- Repositories
- Services (except CoreClient for assertions only)
- `package.json` / `package-lock.json`
- `tsconfig.*.json`
- `.env` / environment files

**Stop Conditions** (Phase-Specific):

- **SC-51B-1**: New dependency added
- **SC-51B-2**: Assertion logic bypasses fail-closed (e.g., `|| true`)
- **SC-51B-3**: Assertion removed or weakened
- **SC-51B-4**: Logging added that exposes JWT/session ID
- **SC-51B-5**: Try-catch added that silences assertion failures
- **SC-51B-6**: CoreClient behavior changed (only assertions allowed)
- **SC-51B-7**: Controller modified
- **SC-51B-8**: New `process.env` usage added

**Verification Commands** (Exact):

```bash
git diff --name-only
npx tsc -p modules/platform-admin/tsconfig.bff.json
npx jest -c jest.config.cjs modules/platform-admin/tests/unit/auth/session.guard.spec.ts
npx jest -c jest.config.cjs modules/platform-admin/tests/unit/core-adapter/core.client.spec.ts
npx jest -c jest.config.cjs modules/platform-admin/tests/unit
grep -r "logger.log.*jwt" modules/platform-admin/src/auth/
grep -r "logger.log.*sessionId" modules/platform-admin/src/auth/
grep -r "console.log" modules/platform-admin/src/auth/
grep -r "console.log" modules/platform-admin/src/core-adapter/
```

**Evidence Files Required**:

- `modules/platform-admin/governance/GATE_51B_EXECUTION_REPORT.md`
- `modules/platform-admin/governance/GATE_51B_VERIFICATION_EVIDENCE.md`

**Rollback Steps** (Tag-Realistic):

```bash
git reset --hard suite-platform-admin-gate-51A
git clean -fd
```

**Commit Message + Tag Name**:

```bash
git commit -m "gate(51B): runtime contract verification layer"
git tag suite-platform-admin-gate-51B
```

**Approval Checkpoint**:
⚠️ **STOP and request approval before executing Phase 51B**

---

### Phase 51C — Integration Hardening Tests

**Goal**: Add cross-layer integration tests validating positive and negative authorization paths (session → JWT → Core) using strict mocking. NO production code changes.

**Strict Allowlist** (Exact File Paths):

```
modules/platform-admin/tests/unit/integration/auth-flow.integration.spec.ts (NEW)
```

**Forbidden List**:

- All production code (`src/**`)
- `package.json` / `package-lock.json`
- Existing test files (only NEW integration test file allowed)
- Any file outside `tests/unit/integration/`

**Stop Conditions** (Phase-Specific):

- **SC-51C-1**: Production code modified (`src/**`)
- **SC-51C-2**: New dependency added
- **SC-51C-3**: Integration test creates external side effects (network calls, file writes)
- **SC-51C-4**: Real Core API calls made (strict mocking required)
- **SC-51C-5**: Positive-only tests (negative paths mandatory)
- **SC-51C-6**: Test file created outside `tests/unit/integration/`

**Verification Commands** (Exact):

```bash
git diff --name-only
git diff src/
npx tsc -p modules/platform-admin/tsconfig.bff.json
npx jest -c jest.config.cjs modules/platform-admin/tests/unit/integration/auth-flow.integration.spec.ts
npx jest -c jest.config.cjs modules/platform-admin/tests/unit
```

**Evidence Files Required**:

- `modules/platform-admin/governance/GATE_51C_EXECUTION_REPORT.md`
- `modules/platform-admin/governance/GATE_51C_VERIFICATION_EVIDENCE.md`

**Rollback Steps** (Tag-Realistic):

```bash
git reset --hard suite-platform-admin-gate-51B
git clean -fd
```

**Commit Message + Tag Name**:

```bash
git commit -m "gate(51C): integration hardening tests"
git tag suite-platform-admin-gate-51C
```

**Approval Checkpoint**:
⚠️ **STOP and request approval before executing Phase 51C**

---

## 3) Diff Isolation Rules

### Git Diff Allowlist Verification (Per Phase)

**Phase 51A**:

```bash
git diff --name-only | sort > actual_changes.txt
cat <<EOF > expected_changes_51a.txt
modules/platform-admin/src/auth/session.guard.ts
modules/platform-admin/tests/unit/auth/session.guard.spec.ts
EOF
diff expected_changes_51a.txt actual_changes.txt
# Expected: no output (files match exactly)
```

**Phase 51B**:

```bash
git diff --name-only | sort > actual_changes.txt
cat <<EOF > expected_changes_51b.txt
modules/platform-admin/src/auth/session.guard.ts
modules/platform-admin/src/core-adapter/core.client.ts
modules/platform-admin/tests/unit/auth/session.guard.spec.ts
modules/platform-admin/tests/unit/core-adapter/core.client.spec.ts
EOF
diff expected_changes_51b.txt actual_changes.txt
# Expected: no output (files match exactly)
```

**Phase 51C**:

```bash
git diff --name-only
# Expected: modules/platform-admin/tests/unit/integration/auth-flow.integration.spec.ts ONLY

git diff src/
# Expected: empty (no production code changes)
```

---

## 4) Dependency Drift Rules

**MUST verify for ALL phases**:

```bash
git diff package.json
# Expected: empty (no output)

git diff package-lock.json
# Expected: empty (no output)
```

**If non-empty**: HALT, trigger stop condition, revert changes

---

## 5) Security Rules

### No JWT/Session Logging

```bash
grep -r "logger.log.*jwt" modules/platform-admin/src/
grep -r "logger.log.*sessionId" modules/platform-admin/src/
grep -r "console.log.*jwt" modules/platform-admin/src/
grep -r "console.log.*sessionId" modules/platform-admin/src/
# Expected: no matches (or only pre-existing safe logs)
```

### No Retry on 401/403

- Code review must verify no retry logic added on 401/403 responses
- Existing fail-closed behavior must be preserved

### No Core Touch

- No new Core API endpoints called
- No Core internal logic referenced
- CoreClient changes in 51B limited to assertions only

---

## 6) Execution Order

### Step 1: Execute Phase 51A

1. Implementation Agent reads GATE_51_TASKS.md
2. Executes 51A tasks per task breakdown
3. Runs verification commands
4. Creates evidence files
5. **STOPS and requests approval**

### Step 2: Tag 51A (After Approval)

```bash
git add modules/platform-admin/src/auth/session.guard.ts
git add modules/platform-admin/tests/unit/auth/session.guard.spec.ts
git add modules/platform-admin/governance/GATE_51A_EXECUTION_REPORT.md
git add modules/platform-admin/governance/GATE_51A_VERIFICATION_EVIDENCE.md
git commit -m "gate(51A): contract semantics tightening (guards only)"
git tag suite-platform-admin-gate-51A
git push origin master --tags
```

### Step 3: Execute Phase 51B

1. Implementation Agent reads GATE_51_TASKS.md
2. Executes 51B tasks per task breakdown
3. Runs verification commands
4. Creates evidence files
5. **STOPS and requests approval**

### Step 4: Tag 51B (After Approval)

```bash
git add modules/platform-admin/src/auth/session.guard.ts
git add modules/platform-admin/src/core-adapter/core.client.ts
git add modules/platform-admin/tests/unit/auth/session.guard.spec.ts
git add modules/platform-admin/tests/unit/core-adapter/core.client.spec.ts
git add modules/platform-admin/governance/GATE_51B_EXECUTION_REPORT.md
git add modules/platform-admin/governance/GATE_51B_VERIFICATION_EVIDENCE.md
git commit -m "gate(51B): runtime contract verification layer"
git tag suite-platform-admin-gate-51B
git push origin master --tags
```

### Step 5: Execute Phase 51C

1. Implementation Agent reads GATE_51_TASKS.md
2. Executes 51C tasks per task breakdown
3. Runs verification commands
4. Creates evidence files
5. **STOPS and requests approval**

### Step 6: Tag 51C (After Approval)

```bash
git add modules/platform-admin/tests/unit/integration/auth-flow.integration.spec.ts
git add modules/platform-admin/governance/GATE_51C_EXECUTION_REPORT.md
git add modules/platform-admin/governance/GATE_51C_VERIFICATION_EVIDENCE.md
git commit -m "gate(51C): integration hardening tests"
git tag suite-platform-admin-gate-51C
git push origin master --tags
```

---

## 7) Signature

**Approved By**: Governance Authority  
**Date**: 2026-02-12  
**Status**: FINAL — MASTER PLAN (REVISED)  
**Revision**: 2 (Controllers removed, CoreClient restricted to 51B assertions only)
