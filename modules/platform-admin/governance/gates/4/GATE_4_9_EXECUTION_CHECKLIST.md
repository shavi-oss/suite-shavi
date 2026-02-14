# Gate 4.9 — Execution Checklist

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Module Name    | platform-admin                          |
| Document Title | GATE_4_9_EXECUTION_CHECKLIST            |
| Repo           | Suite (Layer / Product Repo)            |
| Status         | TEMPORARY — PLAN ONLY                   |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-01-30                              |

---

## 1) Purpose

Step-by-step checklist to execute Gate 4.9 (First Opt-In Endpoint) after plan approval.

---

## 2) Preconditions

Before starting Gate 4.9 execution:

- [ ] Gate 4.8 is CLOSED and TAGGED (`suite-platform-admin-gate-4.8`)
- [ ] Git status is clean
- [ ] Endpoint plan is APPROVED
- [ ] Security model is APPROVED
- [ ] Test plan is APPROVED
- [ ] No uncommitted changes

---

## 3) Execution Steps

### Phase 1 — Guard Creation

- [ ] Create `modules/platform-admin/guards/explicit-allow.guard.ts`
- [ ] Implement `ExplicitAllowGuard` that always returns `true`
- [ ] Update `modules/platform-admin/guards/index.ts` to export `ExplicitAllowGuard`
- [ ] Create `modules/platform-admin/tests/unit/guards/explicit-allow.guard.spec.ts`
- [ ] Write test: `should always return true`
- [ ] Verify TypeScript compilation: `npx tsc -p .`
- [ ] Run tests: `npm test` (should pass)

### Phase 2 — DTO Creation

- [ ] Create `modules/platform-admin/dto/health-response.dto.ts`
- [ ] Define `HealthResponseDto` class with `status`, `module`, `timestamp`
- [ ] Create `modules/platform-admin/dto/index.ts` (export barrier)
- [ ] Verify TypeScript compilation: `npx tsc -p .`

### Phase 3 — Controller Creation

- [ ] Create `modules/platform-admin/controllers/health.controller.ts`
- [ ] Implement `HealthController` with `@Controller('platform-admin')`
- [ ] Implement `getHealth()` with `@Get('health')` and `@UseGuards(ExplicitAllowGuard)`
- [ ] Return static response: `{ status: 'ok', module: 'platform-admin', timestamp: new Date().toISOString() }`
- [ ] Create `modules/platform-admin/controllers/index.ts` (export barrier)
- [ ] Verify TypeScript compilation: `npx tsc -p .`

### Phase 4 — Module Wiring

- [ ] Update `modules/platform-admin/platform-admin.module.ts`
- [ ] Add `HealthController` to `controllers` array
- [ ] Verify `APP_GUARD` provider is unchanged
- [ ] Verify TypeScript compilation: `npx tsc -p .`

### Phase 5 — Unit Tests

- [ ] Create `modules/platform-admin/tests/unit/controllers/health.controller.spec.ts`
- [ ] Write test: `should return health response with status "ok"`
- [ ] Write test: `should return module name "platform-admin"`
- [ ] Write test: `should return valid ISO 8601 timestamp`
- [ ] Run tests: `npm test` (should pass)

### Phase 6 — Security Tests (Update)

- [ ] Update `modules/platform-admin/tests/security/fail-closed.spec.ts`
- [ ] Add test: `should allow access to health endpoint only`
- [ ] Add test: `should deny access to all other routes`
- [ ] Add test: `should use ExplicitAllowGuard on exactly one route`
- [ ] Run tests: `npm test` (should pass)

### Phase 7 — Non-Regression Tests (Update)

- [ ] Update `modules/platform-admin/tests/non-regression/build.spec.ts`
- [ ] Add test: `should have exactly one controller (HealthController)`
- [ ] Add test: `should have exactly one route (/platform-admin/health)`
- [ ] Run tests: `npm test` (should pass)

### Phase 8 — Verification

- [ ] Run all tests: `npm test` (all should pass)
- [ ] Run TypeScript compilation: `npx tsc -p .` (should pass)
- [ ] Check git status: `git status --porcelain` (only allowed paths)
- [ ] Verify no production code changes beyond allowed paths: `git diff --name-only`

### Phase 9 — Commit & Tag

- [ ] Stage allowed files only: `git add modules/platform-admin/guards/ modules/platform-admin/dto/ modules/platform-admin/controllers/ modules/platform-admin/platform-admin.module.ts modules/platform-admin/tests/`
- [ ] Verify staged files: `git diff --cached --name-only`
- [ ] Commit: `feat(platform-admin): Gate 4.9 first opt-in endpoint (health)`
- [ ] Tag: `suite-platform-admin-gate-4.9`
- [ ] Verify tag created: `git tag --list "suite-platform-admin-gate-4.9"`

---

## 4) Allowed Paths (EXACT)

**New Files**:

- `modules/platform-admin/guards/explicit-allow.guard.ts`
- `modules/platform-admin/dto/health-response.dto.ts`
- `modules/platform-admin/dto/index.ts`
- `modules/platform-admin/controllers/health.controller.ts`
- `modules/platform-admin/controllers/index.ts`
- `modules/platform-admin/tests/unit/guards/explicit-allow.guard.spec.ts`
- `modules/platform-admin/tests/unit/controllers/health.controller.spec.ts`

**Modified Files**:

- `modules/platform-admin/guards/index.ts` (export ExplicitAllowGuard)
- `modules/platform-admin/platform-admin.module.ts` (add controller)
- `modules/platform-admin/tests/security/fail-closed.spec.ts` (add tests)
- `modules/platform-admin/tests/non-regression/build.spec.ts` (add tests)

**Forbidden Changes**:

- Any file outside `modules/platform-admin/`
- `modules/platform-admin/guards/deny-all.guard.ts` (MUST NOT MODIFY)
- `modules/platform-admin/platform-admin.module.ts` APP_GUARD provider (MUST NOT REMOVE)
- Any Core integration code
- Any database migrations
- Any CI/CD changes

---

## 5) Commands & Evidence Collection

### 5.1 TypeScript Compilation

**Command**: `npx tsc -p .`  
**Expected**: No errors  
**Evidence**: Screenshot or log of output

### 5.2 Test Execution

**Command**: `npm test`  
**Expected**: All tests passing  
**Evidence**: Screenshot or log showing:

- Unit tests: passing
- Security tests: passing
- Non-regression tests: passing

### 5.3 Git Status

**Command**: `git status --porcelain`  
**Expected**: Only allowed paths modified/added  
**Evidence**: Output showing only allowed files

### 5.4 Git Diff

**Command**: `git diff --name-only`  
**Expected**: Only allowed paths  
**Evidence**: Output showing only allowed files

### 5.5 Commit & Tag

**Command**: `git log --oneline -1`  
**Expected**: Commit message matches  
**Evidence**: Output showing commit hash and message

**Command**: `git tag --list "suite-platform-admin-gate-4.9"`  
**Expected**: Tag exists  
**Evidence**: Output showing tag

---

## 6) Stop Conditions

STOP execution immediately if:

- TypeScript compilation fails
- Any test fails and cannot be fixed
- Git diff shows files outside allowed paths
- More than one controller created
- More than one route created
- `APP_GUARD` provider removed or changed
- Any Core integration code added
- Any database access added

---

## 7) Rollback Plan

If Gate 4.9 execution fails:

1. Do NOT commit
2. Revert all changes: `git reset --hard HEAD`
3. Document failure reason
4. Return to planning phase
5. Update plan based on failure
6. Request re-approval

---

## 8) Signature

**Status**: TEMPORARY — PLAN ONLY  
**Next Step**: Review and approval required before execution
