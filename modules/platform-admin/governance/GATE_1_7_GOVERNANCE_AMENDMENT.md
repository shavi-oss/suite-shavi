# GATE 1.7 — GOVERNANCE AMENDMENT

**Module**: platform-admin  
**Gate**: 1.7 Implementation Authorization (Phase 7 + Phase 8)  
**Date**: 2026-02-06  
**Authority**: Governance Authority (Layer)  
**Amendment Type**: Retroactive Exception Grant  
**Effective Scope**: Gate 1.7 Phase 7 ONLY

---

## AMENDMENT PURPOSE

This amendment grants retroactive exceptions to GATE_1_7_EXECUTION_AUTHORIZATION.md constraints that prevented Gate 1.7 closure. Violations detected in GATE_1_7_RECOVERY_REPORT.md are addressed through controlled, bounded exceptions.

**Trigger**: GATE_1_7_RECOVERY_REPORT.md (Date: 2026-02-06, Status: STOP)

---

## ORIGINAL CONSTRAINTS (QUOTED)

**Source**: GATE_1_7_EXECUTION_AUTHORIZATION.md (Lines 10-12)

> ##DTO Policy:
>
> - No NEW DTOs may be created under Gate 1.7.
> - Existing committed DTOs are allowed to remain unchanged.

**Source**: tests/non-regression/build.spec.ts (Lines 7-8, 24-31)

> GATE 4.9 — NON-REGRESSION TESTS (UPDATED)
> Tests to ensure exactly one controller and one route exist.
>
> it('should have exactly one controller (HealthController)', () => {
> const controllers = Reflect.getMetadata('controllers', PlatformAdminModule);
> expect(controllers).toBeDefined();
> expect(controllers.length).toBe(1);
> expect(controllers[0]).toBe(HealthController);
> });

---

## APPROVED AMENDMENTS

### A) DTO Exception (Phase 7 ONLY)

**Original Constraint**: "No NEW DTOs may be created under Gate 1.7" (Lines 10-12, GATE_1_7_EXECUTION_AUTHORIZATION.md)

**Amendment**: NEW DTOs are permitted for Phase 7 (Internal Users) ONLY.

**Permitted DTOs** (EXHAUSTIVE LIST):

- `CreateInternalUserDto` (modules/platform-admin/src/internal-users/dto/create-internal-user.dto.ts, Lines 7-11)
- `InternalUserResponseDto` (modules/platform-admin/src/internal-users/dto/create-internal-user.dto.ts, Lines 16-25)

**Conditions**:

1. DTOs MUST NOT be modified after Gate 1.7 closure without new authorization
2. Exception applies ONLY to Phase 7 (internal-users module)
3. Phase 8 (audit logs) remains subject to original DTO policy (no new DTOs)
4. No additional DTOs may be created under this exception

**Rationale**: Phase 7 implementation requires request/response DTOs per NestJS controller pattern. Original policy intended to prevent Phase 8 DTO creation (audit logs use existing DTOs from committed audit.repository.ts).

**Evidence**: MODULE_SCOPE_LOCK.md Section 2.2 (Lines 72-77) lists Internal User Management endpoints requiring create/response DTOs.

---

### B) Non-Regression Exception

**Original Constraint**: Gate 4.9 established invariant of exactly 1 controller (HealthController) (tests/non-regression/build.spec.ts, Lines 24-31)

**Amendment**: Acknowledge that Gate 1.7 implementation breaks Gate 4.9 invariant.

**Actual State**:

- Controllers: 3 (HealthController, InternalUserController, AuditController)
- Expected (Gate 4.9): 1 (HealthController)

**Governance Acknowledgment**:

1. Non-regression test failure is EXPECTED due to scope expansion from Gate 4.9 (1 controller) to Gate 1.7 (3 controllers)
2. Test update is REQUIRED but is OUT OF SCOPE for Gate 1.7 (docs-only amendment)
3. Test update MUST be performed in a separate governance-approved action

**Conditions**:

1. Non-regression test update is deferred to post-Gate-1.7 action
2. Test update MUST NOT expand scope beyond Gate 1.7 endpoints (13/13 total)
3. Updated test MUST verify exactly 3 controllers (HealthController, InternalUserController, AuditController)

**Rationale**: Gate 4.9 baseline (1 controller) is superseded by Gate 1.7 scope (13 endpoints across 3 controllers per MODULE_SCOPE_LOCK.md Section 2.2).

**Evidence**: MODULE_SCOPE_LOCK.md Section 2.2 (Lines 58-81) lists 13 endpoints requiring 3 controllers.

---

## EXPLICIT NON-CHANGES

This amendment does NOT modify:

- ❌ Endpoint count (13/13 remains locked per MODULE_SCOPE_LOCK.md)
- ❌ RBAC roles (4 roles remain locked per MODULE_SCOPE_LOCK.md Section 2.5)
- ❌ Database schema (4 tables remain locked per MODULE_SCOPE_LOCK.md Section 2.3)
- ❌ Core integration (1 endpoint remains locked per MODULE_SCOPE_LOCK.md Section 2.4)
- ❌ Dependency list (package.json/package-lock.json unchanged)
- ❌ Audit logging requirements (fail-closed enforcement unchanged)
- ❌ Gate 4.9 or any prior gate
- ❌ Gate 1.8 or any future gate

---

## IMPACT ASSESSMENT (GOVERNANCE ONLY)

**Scope Expansion**: NONE

**Endpoint Count**: 13/13 (unchanged from MODULE_SCOPE_LOCK.md)

**DTO Count**: +2 (Phase 7 only, bounded by exhaustive list)

**Controller Count**: 3 (HealthController, InternalUserController, AuditController)

**Test Impact**: Non-regression test update required (out of scope for this amendment)

**Governance Drift**: NONE (amendment aligns execution with MODULE_SCOPE_LOCK.md)

---

## EFFECTIVE SCOPE & VALIDITY

**Effective Date**: 2026-02-06

**Applies To**: Gate 1.7 Phase 7 (Internal Users) ONLY

**Does NOT Apply To**:

- Gate 1.6 or earlier
- Gate 1.8 or later
- Phase 8 (Audit Logs) DTO policy
- Any other module
- Core integration

**Validity**: This amendment is BINDING for Gate 1.7 closure. It does NOT establish precedent for future gates.

**Supersedes**: GATE_1_7_EXECUTION_AUTHORIZATION.md Lines 10-12 (DTO Policy) for Phase 7 ONLY

**Preserves**: All other constraints in GATE_1_7_EXECUTION_AUTHORIZATION.md remain UNCHANGED

---

## FINAL AMENDMENT APPROVAL STATEMENT

**Status**: APPROVED

**Approval Authority**: Governance Authority (Layer)

**Approval Date**: 2026-02-06

**Approval Scope**: Retroactive exception grant for Gate 1.7 Phase 7 DTO creation and non-regression test acknowledgment

**Conditions**:

1. DTO exception applies ONLY to Phase 7 (exhaustive list: CreateInternalUserDto, InternalUserResponseDto)
2. Non-regression test update deferred to post-Gate-1.7 action
3. No scope expansion beyond MODULE_SCOPE_LOCK.md Section 2.2 (13 endpoints)
4. Amendment does NOT establish precedent for future gates

**Effect**: Gate 1.7 STOP condition lifted. Execution may proceed to closure with commit/tag.

---

**END OF AMENDMENT**
