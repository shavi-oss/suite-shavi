# Gate 5.1 — Draft Authorization

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Module Name    | platform-admin                          |
| Document Title | GATE_5_1_DRAFT_AUTHORIZATION            |
| Repo           | Suite (Layer / Product Repo)            |
| Status         | DRAFT — AUTHORIZATION PENDING           |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-01-30                              |

---

## 1) Gate Identification

**Gate**: 5.1
**Name**: Organization Management
**Mode**: EXECUTE (after approval)
**Scope**: Organization operations (create, list, get, suspend, unsuspend)

---

## 2) Objective

Implement organization operations for Suite organizations, enabling platform administrators to:

- Create new Suite organizations
- List all Suite organizations
- View single organization details
- Suspend organizations (soft-delete, reversible)
- Unsuspend organizations (restore access)

**NO Core integration in this gate** (deferred to Gate 5.2).

---

## 3) Allowed Paths

### 3.1 Production Code (NEW)

✅ `modules/platform-admin/controllers/organization.controller.ts` (NEW)
✅ `modules/platform-admin/controllers/index.ts` (MODIFY - export)
✅ `modules/platform-admin/services/organization.service.ts` (NEW)
✅ `modules/platform-admin/services/index.ts` (NEW)
✅ `modules/platform-admin/repositories/organization.repository.ts` (NEW)
✅ `modules/platform-admin/repositories/index.ts` (NEW)
✅ `modules/platform-admin/dto/organization-create.dto.ts` (NEW)
✅ `modules/platform-admin/dto/organization-response.dto.ts` (NEW)
✅ `modules/platform-admin/dto/index.ts` (MODIFY - export)
✅ `modules/platform-admin/platform-admin.module.ts` (MODIFY - add controller)

### 3.2 Database Schema

✅ `prisma/schema.prisma` (MODIFY - add Organization model)
✅ Database migrations (via `npx prisma migrate dev`)

### 3.3 Tests

✅ `modules/platform-admin/tests/unit/services/organization.service.spec.ts` (NEW)
✅ `modules/platform-admin/tests/unit/repositories/organization.repository.spec.ts` (NEW)
✅ `modules/platform-admin/tests/unit/controllers/organization.controller.spec.ts` (NEW)
✅ `modules/platform-admin/tests/integration/organization.integration.spec.ts` (NEW)
✅ `modules/platform-admin/tests/security/organization-fail-closed.spec.ts` (NEW)

### 3.4 Documentation

✅ `modules/platform-admin/governance/_planning/GATE_5_1_EXECUTION_CHECKLIST.md` (NEW)
✅ `modules/platform-admin/governance/PLATFORM_ADMIN_READINESS.md` (MODIFY - status update)

---

## 4) Forbidden Paths

❌ **Core Integration**: No Core API calls (deferred to Gate 5.2)
❌ **Org Mapping**: No Suite ↔ Core mapping logic (deferred to Gate 5.2)
❌ **Template Publishing**: No template operations (deferred to Gate 5.3)
❌ **Internal Users**: No user management (deferred to Gate 5.4)
❌ **Audit Logging**: No audit trail (deferred to Gate 5.5)
❌ **RBAC**: No role-based access control (deferred to Gate 5.6)
❌ **Authentication**: No auth implementation (future gate)
❌ **Files Outside Allowlist**: Any file outside allowed paths = STOP
❌ **Dependencies/Config/CI**: Any deps, config, or CI changes = STOP

---

## 5) Technical Specification

### 5.1 Prisma Schema

```prisma
enum OrganizationStatus {
  active
  suspended
}

model Organization {
  id          String             @id @default(uuid())
  name        String
  status      OrganizationStatus @default(active)
  createdAt   DateTime           @default(now())
  updatedAt   DateTime           @updatedAt
  suspendedAt DateTime?

  @@map("organizations")
}
```

### 5.2 API Routes

**Controller**: `OrganizationController`
**Base Path**: `/platform-admin/organizations`

| Method | Path             | Handler       | Description   |
| ------ | ---------------- | ------------- | ------------- |
| POST   | `/`              | `create()`    | Create org    |
| GET    | `/`              | `findAll()`   | List all orgs |
| GET    | `/:id`           | `findOne()`   | Get one org   |
| PATCH  | `/:id/suspend`   | `suspend()`   | Suspend org   |
| PATCH  | `/:id/unsuspend` | `unsuspend()` | Unsuspend org |

### 5.3 DTOs

**OrganizationCreateDto**:

```typescript
{
  name: string; // required, min 1 char, max 255 chars
}
```

**OrganizationResponseDto**:

```typescript
{
  id: string;
  name: string;
  status: 'active' | 'suspended';
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  suspendedAt?: string; // ISO 8601, optional
}
```

### 5.4 Service Layer

**OrganizationService**:

- `create(dto: OrganizationCreateDto): Promise<OrganizationResponseDto>`
- `findAll(): Promise<OrganizationResponseDto[]>`
- `findOne(id: string): Promise<OrganizationResponseDto>`
- `suspend(id: string): Promise<OrganizationResponseDto>`
- `unsuspend(id: string): Promise<OrganizationResponseDto>`

### 5.5 Repository Layer

**OrganizationRepository**:

- `create(data: Prisma.OrganizationCreateInput): Promise<Organization>`
- `findAll(): Promise<Organization[]>`
- `findById(id: string): Promise<Organization | null>`
- `suspend(id: string): Promise<Organization>` (sets status to suspended, sets suspendedAt)
- `unsuspend(id: string): Promise<Organization>` (sets status to active, clears suspendedAt)

---

## 6) Verification Requirements

### 6.1 Automated Tests

**Unit Tests**:

- `organization.service.spec.ts`: Test service business logic
- `organization.repository.spec.ts`: Test repository database access (mocked Prisma)
- `organization.controller.spec.ts`: Test controller request/response handling

**Integration Tests**:

- `organization.integration.spec.ts`: Test full flow (controller → service → repository)

**Fail-Closed Invariants Tests**:

- `organization-fail-closed.spec.ts`: Test fail-closed enforcement (deny-by-default preserved, no RBAC/auth logic)

**Command**:

```bash
npx jest --config jest.config.cjs
```

**Expected**: All tests pass

### 6.2 TypeScript Compilation

**Command**:

```bash
npx tsc -p .
```

**Expected**: No errors

### 6.3 Database Migration

**Command**:

```bash
npx prisma migrate dev --name add_organization_model
```

**Expected**: Migration succeeds

**Note**: Manual verification (if BFF is running) is optional and NOT a gate success criterion.

---

## 7) Evidence Requirements

### 7.1 Test Evidence

- All tests passing (unit + integration + security)
- Test count increased (approximate: +15-20 tests)
- No runtime execution required for verification

### 7.2 Commit Evidence

- Commit message: `feat(platform-admin): Gate 5.1 organization management`
- Tag: `suite-platform-admin-gate-5.1`
- Files changed: controllers, services, repositories, dto, schema, tests, docs

### 7.3 Documentation Evidence

- `GATE_5_1_EXECUTION_CHECKLIST.md` created
- `PLATFORM_ADMIN_READINESS.md` updated (Gate 5.1 status)

---

## 8) Stop Conditions

STOP immediately if:

- Any Core API call is attempted
- Any org mapping logic is added
- Any template publishing logic is added
- Any RBAC logic is added
- Any audit logging logic is added
- DenyAllGuard is removed or weakened
- Fail-closed enforcement is bypassed

---

## 9) Success Criteria

Gate 5.1 is considered complete when:

✅ All API routes implemented and tested (automated tests only)
✅ Prisma schema updated and migrated
✅ All tests passing (unit + integration + security)
✅ TypeScript compilation passing
✅ No Core integration present
✅ No org mapping logic present
✅ Fail-closed enforcement preserved
✅ Evidence docs created
✅ Commit + tag created

---

## 10) Signature

**Status**: DRAFT — AUTHORIZATION PENDING
**Approval**: Pending governance review
**Next Step**: Await explicit approval before execution
