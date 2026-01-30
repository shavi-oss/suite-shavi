# Gate 5.x — Task Breakdown

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Module Name    | platform-admin                          |
| Document Title | GATE_5_TASK_BREAKDOWN                   |
| Repo           | Suite (Layer / Product Repo)            |
| Status         | TEMPORARY — PLAN ONLY                   |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-01-30                              |

---

## 1) Purpose

This document decomposes Gate 5.x series into concrete, executable tasks.

Each task has:

- **Goal**: What the task accomplishes
- **Inputs**: What must exist before the task can start
- **Outputs**: What the task produces
- **Stop Conditions**: When to stop immediately

---

## 2) Gate 5.1 — Organization Management

### Task 5.1.1: Prisma Schema & Migration

**Goal**: Define Organization model in Prisma schema and create database migration

**Inputs**:

- Existing `prisma/schema.prisma`
- Gate 5.1 authorization approved

**Outputs**:

- `prisma/schema.prisma` updated with `Organization` model
- Migration file created (via `npx prisma migrate dev`)
- Prisma client regenerated

**Stop Conditions**:

- If schema conflicts with existing models
- If migration fails

---

### Task 5.1.2: Organization Repository

**Goal**: Implement repository layer for database access

**Inputs**:

- Prisma schema with `Organization` model
- Prisma client generated

**Outputs**:

- `modules/platform-admin/repositories/organization.repository.ts` (NEW)
- `modules/platform-admin/repositories/index.ts` (NEW)
- Unit tests: `tests/unit/repositories/organization.repository.spec.ts` (NEW)

**Stop Conditions**:

- If Prisma client not available
- If tests fail

---

### Task 5.1.3: Organization DTOs

**Goal**: Define data transfer objects for API requests/responses

**Inputs**:

- Gate 5.1 authorization approved

**Outputs**:

- `modules/platform-admin/dto/organization-create.dto.ts` (NEW)
- `modules/platform-admin/dto/organization-response.dto.ts` (NEW)
- `modules/platform-admin/dto/index.ts` (MODIFY - export DTOs)

**Stop Conditions**:

- If DTO validation logic becomes too complex (keep simple)

---

### Task 5.1.4: Organization Service

**Goal**: Implement business logic layer

**Inputs**:

- Organization repository implemented
- Organization DTOs defined

**Outputs**:

- `modules/platform-admin/services/organization.service.ts` (NEW)
- `modules/platform-admin/services/index.ts` (NEW)
- Unit tests: `tests/unit/services/organization.service.spec.ts` (NEW)

**Stop Conditions**:

- If Core API calls are needed (deferred to Gate 5.2)
- If org mapping logic is needed (deferred to Gate 5.2)
- If tests fail

---

### Task 5.1.5: Organization Controller

**Goal**: Implement HTTP API layer

**Inputs**:

- Organization service implemented
- Organization DTOs defined

**Outputs**:

- `modules/platform-admin/controllers/organization.controller.ts` (NEW)
- `modules/platform-admin/controllers/index.ts` (MODIFY - export controller)
- Unit tests: `tests/unit/controllers/organization.controller.spec.ts` (NEW)

**Stop Conditions**:

- If more than 5 routes are added (scope creep)
- If tests fail

---

### Task 5.1.6: Module Wiring

**Goal**: Wire controller into platform-admin module

**Inputs**:

- Organization controller implemented

**Outputs**:

- `modules/platform-admin/platform-admin.module.ts` (MODIFY - add controller)

**Stop Conditions**:

- If DenyAllGuard is removed or weakened
- If fail-closed enforcement is bypassed

---

### Task 5.1.7: Integration Tests

**Goal**: Test full flow (controller → service → repository)

**Inputs**:

- All components implemented and wired

**Outputs**:

- `tests/integration/organization.integration.spec.ts` (NEW)

**Stop Conditions**:

- If tests fail
- If runtime execution is required (use TestingModule only)

---

### Task 5.1.8: Fail-Closed Invariants Tests

**Goal**: Verify fail-closed enforcement (no RBAC/auth logic)

**Inputs**:

- All components implemented and wired

**Outputs**:

- `tests/security/organization-fail-closed.spec.ts` (NEW)

**Stop Conditions**:

- If fail-closed enforcement is weakened
- If tests fail

---

### Task 5.1.9: Documentation & Evidence

**Goal**: Document Gate 5.1 completion

**Inputs**:

- All tests passing
- TypeScript compilation passing

**Outputs**:

- `governance/_planning/GATE_5_1_EXECUTION_CHECKLIST.md` (NEW)
- `governance/PLATFORM_ADMIN_READINESS.md` (MODIFY - status update)

**Stop Conditions**:

- If any tests failing
- If TypeScript compilation failing

---

### Task 5.1.10: Commit & Tag

**Goal**: Create commit and tag for Gate 5.1

**Inputs**:

- All tasks complete
- All tests passing

**Outputs**:

- Commit: `feat(platform-admin): Gate 5.1 organization management`
- Tag: `suite-platform-admin-gate-5.1`

**Stop Conditions**:

- If any verification step fails

---

## 3) Gate 5.2 — Org Mapping

### Task 5.2.1: Prisma Schema & Migration

**Goal**: Define OrgMapping model in Prisma schema

**Inputs**:

- Gate 5.1 complete and tagged
- Gate 5.2 authorization approved

**Outputs**:

- `prisma/schema.prisma` updated with `OrgMapping` model
- Migration file created

**Stop Conditions**:

- If schema conflicts with existing models
- If migration fails

---

### Task 5.2.2: Core API Client (Org Validation)

**Goal**: Implement Core API client for org validation (FIRST Core API call)

**Inputs**:

- INTEGRATION_CONTRACT_CORE.md reviewed
- Core service token available (server-only)

**Outputs**:

- `modules/platform-admin/clients/core-api.client.ts` (NEW)
- `modules/platform-admin/clients/index.ts` (NEW)
- Unit tests: `tests/unit/clients/core-api.client.spec.ts` (NEW)

**Stop Conditions**:

- If Core token is exposed to UI
- If UI → Core direct call is attempted
- If tests fail

---

### Task 5.2.3: Org Mapping Repository

**Goal**: Implement repository layer for org mapping

**Inputs**:

- Prisma schema with `OrgMapping` model

**Outputs**:

- `modules/platform-admin/repositories/org-mapping.repository.ts` (NEW)
- `modules/platform-admin/repositories/index.ts` (MODIFY - export)
- Unit tests: `tests/unit/repositories/org-mapping.repository.spec.ts` (NEW)

**Stop Conditions**:

- If tests fail

---

### Task 5.2.4: Org Mapping DTOs

**Goal**: Define DTOs for org mapping

**Inputs**:

- Gate 5.2 authorization approved

**Outputs**:

- `modules/platform-admin/dto/org-mapping-create.dto.ts` (NEW)
- `modules/platform-admin/dto/org-mapping-response.dto.ts` (NEW)
- `modules/platform-admin/dto/index.ts` (MODIFY - export)

**Stop Conditions**:

- None

---

### Task 5.2.5: Org Mapping Service

**Goal**: Implement business logic with Core org validation

**Inputs**:

- Org mapping repository implemented
- Core API client implemented
- Org mapping DTOs defined

**Outputs**:

- `modules/platform-admin/services/org-mapping.service.ts` (NEW)
- `modules/platform-admin/services/index.ts` (MODIFY - export)
- Unit tests: `tests/unit/services/org-mapping.service.spec.ts` (NEW)

**Stop Conditions**:

- If Core token is exposed to UI
- If fail-closed enforcement is weakened
- If tests fail

---

### Task 5.2.6: Org Mapping Controller

**Goal**: Implement HTTP API layer

**Inputs**:

- Org mapping service implemented

**Outputs**:

- `modules/platform-admin/controllers/org-mapping.controller.ts` (NEW)
- `modules/platform-admin/controllers/index.ts` (MODIFY - export)
- Unit tests: `tests/unit/controllers/org-mapping.controller.spec.ts` (NEW)

**Stop Conditions**:

- If tests fail

---

### Task 5.2.7: Module Wiring

**Goal**: Wire controller into module

**Inputs**:

- Org mapping controller implemented

**Outputs**:

- `modules/platform-admin/platform-admin.module.ts` (MODIFY - add controller)

**Stop Conditions**:

- If DenyAllGuard is removed or weakened

---

### Task 5.2.8: Integration & Security Tests

**Goal**: Test full flow and fail-closed enforcement

**Inputs**:

- All components implemented

**Outputs**:

- `tests/integration/org-mapping.integration.spec.ts` (NEW)
- `tests/security/org-mapping.security.spec.ts` (NEW)

**Stop Conditions**:

- If tests fail
- If fail-closed enforcement is weakened

---

### Task 5.2.9: Documentation & Commit

**Goal**: Document and tag Gate 5.2

**Inputs**:

- All tests passing

**Outputs**:

- `governance/_planning/GATE_5_2_EXECUTION_CHECKLIST.md` (NEW)
- `governance/PLATFORM_ADMIN_READINESS.md` (MODIFY)
- Commit + tag: `suite-platform-admin-gate-5.2`

**Stop Conditions**:

- If any verification fails

---

## 4) Gate 5.3 — Template Publishing

### Task 5.3.1: Core API Client (Template Publish)

**Goal**: Implement Core API client for template publishing

**Inputs**:

- Gate 5.2 complete and tagged
- Gate 5.3 authorization approved

**Outputs**:

- `modules/platform-admin/clients/core-api.client.ts` (MODIFY - add publish method)
- Unit tests updated

**Stop Conditions**:

- If Core token is exposed to UI
- If tests fail

---

### Task 5.3.2: Template Publishing DTOs

**Goal**: Define DTOs for template publish requests

**Inputs**:

- Gate 5.3 authorization approved

**Outputs**:

- `modules/platform-admin/dto/template-publish-request.dto.ts` (NEW)
- `modules/platform-admin/dto/template-publish-response.dto.ts` (NEW)
- `modules/platform-admin/dto/index.ts` (MODIFY)

**Stop Conditions**:

- None

---

### Task 5.3.3: Template Publishing Service

**Goal**: Implement business logic with Core API call

**Inputs**:

- Core API client updated
- Template publishing DTOs defined

**Outputs**:

- `modules/platform-admin/services/template-publishing.service.ts` (NEW)
- `modules/platform-admin/services/index.ts` (MODIFY)
- Unit tests: `tests/unit/services/template-publishing.service.spec.ts` (NEW)

**Stop Conditions**:

- If idempotency is not enforced
- If error handling doesn't follow INTEGRATION_CONTRACT_CORE.md
- If tests fail

---

### Task 5.3.4: Template Publishing Controller

**Goal**: Implement HTTP API layer

**Inputs**:

- Template publishing service implemented

**Outputs**:

- `modules/platform-admin/controllers/template-publishing.controller.ts` (NEW)
- `modules/platform-admin/controllers/index.ts` (MODIFY)
- Unit tests: `tests/unit/controllers/template-publishing.controller.spec.ts` (NEW)

**Stop Conditions**:

- If tests fail

---

### Task 5.3.5: Module Wiring, Tests, Documentation

**Goal**: Wire controller, test, and document

**Inputs**:

- All components implemented

**Outputs**:

- `platform-admin.module.ts` (MODIFY)
- Integration + security tests
- Documentation + commit + tag

**Stop Conditions**:

- If any verification fails

---

## 5) Gate 5.4 — Internal Users

### Task 5.4.1: Prisma Schema & Migration

**Goal**: Define InternalUser model

**Inputs**:

- Gate 5.3 complete and tagged

**Outputs**:

- `prisma/schema.prisma` updated with `InternalUser` model
- Migration file created

**Stop Conditions**:

- If migration fails

---

### Task 5.4.2: Internal User Repository

**Goal**: Implement repository layer

**Inputs**:

- Prisma schema with `InternalUser` model

**Outputs**:

- `repositories/internal-user.repository.ts` (NEW)
- Unit tests

**Stop Conditions**:

- If tests fail

---

### Task 5.4.3: Internal User DTOs

**Goal**: Define DTOs

**Inputs**:

- Gate 5.4 authorization approved

**Outputs**:

- `dto/internal-user-create.dto.ts` (NEW)
- `dto/internal-user-response.dto.ts` (NEW)

**Stop Conditions**:

- None

---

### Task 5.4.4: Internal User Service

**Goal**: Implement business logic

**Inputs**:

- Repository + DTOs implemented

**Outputs**:

- `services/internal-user.service.ts` (NEW)
- Unit tests

**Stop Conditions**:

- If customer user management is added (out of scope)
- If tests fail

---

### Task 5.4.5: Internal User Controller

**Goal**: Implement HTTP API layer

**Inputs**:

- Service implemented

**Outputs**:

- `controllers/internal-user.controller.ts` (NEW)
- Unit tests

**Stop Conditions**:

- If tests fail

---

### Task 5.4.6: Module Wiring, Tests, Documentation

**Goal**: Wire, test, document

**Inputs**:

- All components implemented

**Outputs**:

- Module wiring + tests + docs + commit + tag

**Stop Conditions**:

- If any verification fails

---

## 6) Gate 5.5 — Audit Logging

### Task 5.5.1: Prisma Schema & Migration

**Goal**: Define AuditLog model (append-only)

**Inputs**:

- Gate 5.4 complete and tagged

**Outputs**:

- `prisma/schema.prisma` updated with `AuditLog` model
- Migration file created

**Stop Conditions**:

- If migration fails

---

### Task 5.5.2: Audit Repository

**Goal**: Implement append-only repository

**Inputs**:

- Prisma schema with `AuditLog` model

**Outputs**:

- `repositories/audit.repository.ts` (NEW)
- Unit tests

**Stop Conditions**:

- If update/delete operations are added (forbidden)
- If tests fail

---

### Task 5.5.3: Audit Service

**Goal**: Implement audit logging service

**Inputs**:

- Audit repository implemented

**Outputs**:

- `services/audit.service.ts` (NEW)
- Unit tests

**Stop Conditions**:

- If secrets/tokens/PII are logged
- If tests fail

---

### Task 5.5.4: Correlation ID Middleware

**Goal**: Implement correlation ID propagation

**Inputs**:

- Audit service implemented

**Outputs**:

- `middleware/correlation-id.middleware.ts` (NEW)
- Unit tests

**Stop Conditions**:

- If tests fail

---

### Task 5.5.5: Integration & Documentation

**Goal**: Integrate audit logging, test, document

**Inputs**:

- All components implemented

**Outputs**:

- Module wiring + tests + docs + commit + tag

**Stop Conditions**:

- If any verification fails

---

## 7) Gate 5.6 — RBAC

### Task 5.6.1: Prisma Schema & Migration

**Goal**: Define Role and UserRole models

**Inputs**:

- Gate 5.5 complete and tagged

**Outputs**:

- `prisma/schema.prisma` updated with `Role` and `UserRole` models
- Migration file created

**Stop Conditions**:

- If migration fails

---

### Task 5.6.2: Role Repository

**Goal**: Implement repository layer

**Inputs**:

- Prisma schema with `Role` and `UserRole` models

**Outputs**:

- `repositories/role.repository.ts` (NEW)
- Unit tests

**Stop Conditions**:

- If tests fail

---

### Task 5.6.3: RBAC Service

**Goal**: Implement role checks

**Inputs**:

- Role repository implemented

**Outputs**:

- `services/rbac.service.ts` (NEW)
- Unit tests

**Stop Conditions**:

- If custom permission models are added (out of scope)
- If tests fail

---

### Task 5.6.4: RBAC Guard & Decorator

**Goal**: Implement role enforcement

**Inputs**:

- RBAC service implemented

**Outputs**:

- `guards/rbac.guard.ts` (NEW)
- `decorators/require-role.decorator.ts` (NEW)
- Unit tests

**Stop Conditions**:

- If tests fail

---

### Task 5.6.5: Integration & Documentation

**Goal**: Integrate RBAC, test, document

**Inputs**:

- All components implemented

**Outputs**:

- Module wiring + tests + docs + commit + tag

**Stop Conditions**:

- If any verification fails

---

## 8) Signature

**Status**: TEMPORARY — PLAN ONLY
**Approval**: Pending governance review
**Next Step**: Await explicit approval before Gate 5.1 execution
