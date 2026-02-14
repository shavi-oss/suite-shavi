# Gate 5.3 Draft Authorization — Template Publishing

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Module Name    | platform-admin                          |
| Document Title | GATE_5_3_DRAFT_AUTHORIZATION            |
| Repo           | Suite (Layer / Product Repo)            |
| Status         | DRAFT — PLANNING ONLY                   |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-01-31                              |

---

## 1) Purpose

This document defines the scope, entry criteria, exit criteria, and STOP rules for Gate 5.3: Template Publishing implementation. This is a **DOCS-ONLY** planning artifact and does NOT authorize implementation.

---

## 2) Gate 5.3 Objective

**Goal**: Implement the Template Publishing feature for the `platform-admin` module, enabling internal users to trigger publication of pre-defined templates to Bassan.os Core.

**Scope**: ONLY the Template Publishing feature as defined in MODULE_SCOPE_LOCK.md.

---

## 3) Allowed Paths (Explicit)

Implementation is ONLY allowed within these paths:

**BFF Endpoint** (modules/platform-admin/src/):

- `controllers/templates.controller.ts` (NEW or MODIFY)
- `services/templates.service.ts` (NEW or MODIFY)
- `dto/publish-template.dto.ts` (NEW)
- `guards/` (MODIFY if needed for RBAC)

**Tests** (modules/platform-admin/tests/):

- `templates.controller.spec.ts` (NEW)
- `templates.service.spec.ts` (NEW)
- `templates.integration.spec.ts` (NEW)
- `templates.security.spec.ts` (NEW)

**Documentation** (modules/platform-admin/governance/):

- Update MODULE_GATES_CHECKLIST.md to mark Gate 5.3 progress
- Create Gate 5.3 completion evidence

**MUST NOT touch**:

- Any file outside `modules/platform-admin/**`
- Bassan.os Core files
- Prisma schema or migrations (no new tables for Gate 5.3)
- Dependencies (package.json, package-lock.json)
- CI/CD configuration
- Runtime servers or HTTP controllers outside platform-admin
- Auth/RBAC implementation files (except guards for enforcement)

---

## 4) Forbidden Paths (Explicit)

The following are STRICTLY FORBIDDEN:

- Any file in `src/` (Core runtime)
- Any file in `prisma/` (schema/migrations)
- Any file in `.github/` (CI/CD)
- Any file in `modules/` except `modules/platform-admin/**`
- Any dependency changes (package.json, package-lock.json)
- Any Core endpoint calls unless explicitly authorized in INTEGRATION_CONTRACT_CORE.md

---

## 5) Entry Criteria (Binding)

ALL of the following MUST be true before starting Gate 5.3:

- [ ] Gate 5.2 is CLOSED, TAGGED, and ANCHORED
- [ ] `git status` is clean (no uncommitted changes)
- [ ] Git tag `suite-platform-admin-gate5.2-complete` exists
- [ ] MODULE_SCOPE_LOCK.md explicitly lists Template Publishing endpoint
- [ ] MODULE_SECURITY_LAWS.md defines RBAC rules for Template Publishing
- [ ] MODULE_INTEGRATION_PLAN.md defines Core integration for Template Publishing
- [ ] INTEGRATION_CONTRACT_CORE.md explicitly authorizes Core template publishing endpoint (see Section 7)
- [ ] All governance documents are FINAL and approved
- [ ] No STOP rule violations exist

---

## 6) Exit Criteria (Binding)

Gate 5.3 is considered COMPLETE when ALL of the following are true:

**Implementation**:

- [ ] BFF endpoint `POST /api/platform-admin/templates/publish` is implemented
- [ ] Templates service calls Core template publishing endpoint (if authorized)
- [ ] RBAC enforcement: only `platform_admin` and `developer_ops` roles can publish
- [ ] Input validation: templateId and coreOrgId are validated
- [ ] Org mapping validation: suiteOrgId → coreOrgId mapping exists before publish
- [ ] Fail-closed enforcement: missing mapping → deny request
- [ ] Audit logging: every publish attempt is logged (success or failure)
- [ ] Correlation ID propagation: UI → BFF → Core
- [ ] Core service token: server-only, never exposed to UI
- [ ] Error handling: safe errors returned to UI, no Core details exposed

**Testing**:

- [ ] Unit tests pass: RBAC, input validation, fail-closed, audit logging
- [ ] Integration tests pass: BFF → Core with valid/invalid token, org mapping validation
- [ ] Security tests pass: IDOR, privilege escalation, token protection, audit immutability
- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] `npm run test` passes (all tests)

**Documentation**:

- [ ] MODULE_GATES_CHECKLIST.md updated to mark Gate 5.3 complete
- [ ] Gate 5.3 completion evidence created (test results, git diff)

**Git Hygiene**:

- [ ] `git status` is clean
- [ ] All changes committed with message: `feat(platform-admin): Gate 5.3 - Template Publishing`
- [ ] Git tag created: `suite-platform-admin-gate5.3-complete`

---

## 7) Core Integration Contract Dependency (CRITICAL)

**BLOCKER**: Template Publishing requires calling a Core endpoint to publish templates.

**Current Status**: INTEGRATION_CONTRACT_CORE.md Section 12.1 marks Core endpoints as **TODO**.

**Required Core Endpoint** (per MODULE_INTEGRATION_PLAN.md):

- **Endpoint**: TBD (e.g., `POST /api/v1/templates/publish`)
- **Purpose**: Publish pre-defined template to Core for a specific organization
- **Method**: POST
- **Headers**: `Authorization: Bearer <core-service-token>`, `X-Organization-Id: <coreOrgId>`, `X-Correlation-Id: <id>`
- **Request Body**: TBD (e.g., `{ templateId: string, coreOrgId: string }`)
- **Response**: 201 Created (success), 400 Bad Request (invalid template), 404 Not Found (org not found)
- **Error Handling**: 4xx → return safe error to UI, 5xx → retry with backoff

**STOP RULE**: **No Core endpoint calls unless endpoint is explicitly authorized in INTEGRATION_CONTRACT_CORE.md.**

**Decision Point**:

**Option A**: If Core endpoint is NOT yet authorized in INTEGRATION_CONTRACT_CORE.md:

- **Action**: BLOCK Gate 5.3 implementation
- **Propose**: Create **Gate 5.3A: Contract Finalization** (docs-only)
  - Update INTEGRATION_CONTRACT_CORE.md Section 12.1 with exact Core template publishing endpoint
  - Obtain approval from Governance Authority and Core team
  - Tag as `suite-integration-contract-v2`
  - Then proceed to Gate 5.3 implementation

**Option B**: If Core endpoint IS authorized in INTEGRATION_CONTRACT_CORE.md:

- **Action**: Proceed with Gate 5.3 implementation
- **Verify**: Endpoint URL, headers, request/response schema are explicitly documented

**Current Recommendation**: **BLOCKED** until INTEGRATION_CONTRACT_CORE.md is updated with explicit Core template publishing endpoint authorization.

---

## 8) STOP Rules (Fail-Closed)

Execution MUST STOP IMMEDIATELY if any of the following occurs:

**Scope Violations**:

- Implementing features outside MODULE_SCOPE_LOCK.md
- Touching files outside `modules/platform-admin/**`
- Modifying Bassan.os Core files
- Modifying Prisma schema or migrations
- Modifying dependencies (package.json)

**Security Violations**:

- Core service token exposed to UI or logged
- UI → Core direct call
- RBAC bypassed
- Audit logging skipped
- Fail-open behavior (e.g., proceeding without org mapping)

**Integration Violations**:

- Calling Core endpoint not explicitly authorized in INTEGRATION_CONTRACT_CORE.md
- Accessing Core DB directly
- Forwarding UI token to Core
- Proceeding without tenant context (coreOrgId)

**Governance Violations**:

- Modifying governance documents without approval
- Skipping security tests
- Ignoring test failures

**Action on STOP**: Halt all work, document the violation, escalate to Governance Authority.

---

## 9) Acceptance Criteria

This draft authorization is considered COMPLETE when:

- [ ] All allowed paths are explicitly listed
- [ ] All forbidden paths are explicitly listed
- [ ] All entry criteria are defined and testable
- [ ] All exit criteria are defined and testable
- [ ] All STOP rules are explicit and enforceable
- [ ] Core integration contract dependency is documented
- [ ] Decision point for BLOCKED status is clear
- [ ] No contradictions exist with MODULE_SCOPE_LOCK.md, MODULE_SECURITY_LAWS.md, or repo-level governance

---

## 10) Change Control

Changes to this draft authorization require:

- Written justification
- Explicit approval from Governance Authority
- Version increment (if applicable)

Forbidden: Weakening STOP rules, removing entry/exit criteria, allowing out-of-scope paths.

---

## 11) Signature

**Status**: DRAFT — PLANNING ONLY  
**Prepared By**: Execution Assistant (Sonnet 4.5)  
**Date**: 2026-01-31  
**Approval Status**: PENDING GOVERNANCE AUTHORITY REVIEW
