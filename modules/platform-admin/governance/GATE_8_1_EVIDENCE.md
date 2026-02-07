# Gate 8.1 Evidence — Org Mapping Implementation

## Document Control

| Attribute | Value       |
| --------- | ----------- |
| Gate      | 8.1         |
| Feature   | Org Mapping |
| Status    | COMPLETE    |
| Date      | 2026-02-07  |

---

## 1) Implementation Evidence

### 1.1 Proven Modified Paths (Git Diff)

**Modified in Gate 8.1:**

- `src/core-adapter/core.client.ts` (error handling enhanced)
- `tests/unit/core-adapter/core.client.spec.ts` (6 fail-closed tests added)

**Pre-Existing (Not Modified in Gate 8.1):**

- Org Mapping implementation files (controller, service, repository, DTOs)
- Org Mapping unit tests (service, controller, repository)

### 1.2 Code Files Overview

**Controller**: `src/org-mapping/org-mapping.controller.ts`

- 3 endpoints implemented (POST, GET, GET/:id)
- RBAC enforcement via `@RequirePermission` decorator
- JWT extraction from Authorization header
- Correlation ID propagation

**Service**: `src/org-mapping/org-mapping.service.ts`

- Core validation before mapping creation
- Fail-closed on Core errors (401, 403, 404, 5xx, timeout)
- Duplicate mapping rejection
- Atomic audit logging within transaction

**Repository**: `src/org-mapping/org-mapping.repository.ts`

- Suite-only table access (SuiteOrgMapping)
- Pre-existing implementation

**DTOs**: `src/org-mapping/dto/org-mapping.dto.ts`

- CreateOrgMappingDto (suiteOrgId, coreOrgId)
- OrgMappingResponseDto (no JWT exposure)

**Core Client**: `src/core-adapter/core.client.ts`

- `validateOrganizationExists` method (pre-existing)
- GET /api/v1/organizations/:id (only allowed endpoint)
- JWT forwarding (no storage/logging)
- 10-second timeout enforcement
- **Gate 8.1:** Enhanced error handling (401/403 before 5xx, re-throw logic)

---

## 2) Test Evidence

### 2.1 Unit Tests

**Integration Tests:** DEFERRED to Gate 8.2

### 2.2 Unit Test Coverage

**Core Client Tests**: `tests/unit/core-adapter/core.client.spec.ts`

- ✅ Core 200 → returns true
- ✅ Core 404 → returns false
- ✅ Core 401 → throws error (fail-closed)
- ✅ Core 403 → throws error (fail-closed)
- ✅ Core 500 → throws error (fail-closed)
- ✅ Core 503 → throws error (fail-closed)
- ✅ Network timeout → throws error (fail-closed)
- ✅ Network failure → throws error (fail-closed)

**Service Tests**: `tests/unit/services/org-mapping.service.spec.ts`

- ✅ Mapping creation with Core validation
- ✅ Suite org not found → NotFoundException
- ✅ Duplicate mapping (suite) → ConflictException
- ✅ Duplicate mapping (core) → ConflictException
- ✅ Core API failure → BadRequestException
- ✅ Core org not found (404) → NotFoundException
- ✅ findAll returns all mappings
- ✅ findBySuiteOrgId returns mapping
- ✅ findBySuiteOrgId not found → NotFoundException

**Controller Tests**: `tests/unit/controllers/org-mapping.controller.spec.ts`

- ✅ JWT extraction from Authorization header
- ✅ Correlation ID propagation
- ✅ Missing JWT → error
- ✅ findAll returns mappings
- ✅ findBySuiteOrgId returns mapping

**Repository Tests**: `tests/unit/repositories/org-mapping.repository.spec.ts`

- ✅ create mapping
- ✅ findBySuiteOrgId
- ✅ findByCoreOrgId
- ✅ findAll
- ✅ delete

---

## 3) Security Invariants Verified

### 3.1 JWT Protection

- ✅ JWT never logged (redaction in core.client.ts)
- ✅ JWT never stored in DB
- ✅ JWT never exposed in DTO responses
- ✅ JWT forwarded as-is to Core (no minting)

### 3.2 Fail-Closed Enforcement

- ✅ Core 401/403 → reject mapping creation
- ✅ Core 404 → reject mapping creation
- ✅ Core 5xx → reject mapping creation
- ✅ Network timeout → reject mapping creation
- ✅ Duplicate mapping → reject creation
- ✅ Missing suite org → reject creation

### 3.3 RBAC Enforcement

- ✅ `@RequirePermission(ORG_MAPPINGS, WRITE)` on POST
- ✅ `@RequirePermission(ORG_MAPPINGS, READ)` on GET
- ✅ RbacGuard applied to controller

### 3.4 Audit Logging

- ✅ Audit log on mapping creation (success)
- ✅ Audit log within transaction (atomic)
- ✅ Correlation ID in audit metadata
- ✅ No PII in audit metadata

---

## 4) Core Contract Compliance

### 4.1 Allowed Endpoint

- ✅ GET /api/v1/organizations/:id (ONLY)
- ✅ Contract assertion in core.client.ts (line 69)

### 4.2 Forbidden Endpoints

- ✅ No template publishing
- ✅ No service tokens
- ✅ No other Core endpoints

### 4.3 Authentication

- ✅ User-scoped JWT forwarding
- ✅ Authorization: Bearer <token> header
- ✅ X-Correlation-Id header

---

## 5) Data Ownership Compliance

### 5.1 Suite-Owned Tables

- ✅ SuiteOrgMapping (suiteOrgId, coreOrgId, createdBy, timestamps)
- ✅ PlatformAdminAuditLog (via AuditService)

### 5.2 Core Data

- ✅ No Core data stored beyond coreOrgId reference
- ✅ Core org validation via API only

---

## 6) Verification Commands

```bash
# TypeScript compilation
cd modules/platform-admin
npx tsc --noEmit

# Unit tests
npx jest tests/unit/core-adapter/core.client.spec.ts
npx jest tests/unit/services/org-mapping.service.spec.ts
npx jest tests/unit/controllers/org-mapping.controller.spec.ts
npx jest tests/unit/repositories/org-mapping.repository.spec.ts

# All tests
npx jest
```

---

## 7) Exit Criteria

- ✅ All 3 endpoints implemented
- ✅ Core validation before mapping creation
- ✅ Fail-closed on all Core errors
- ✅ RBAC enforcement on all endpoints
- ✅ Audit logging for all operations
- ✅ JWT protection (no logging/storage/exposure)
- ✅ No Prisma schema changes
- ✅ No new dependencies
- ✅ All tests passing
- ✅ TypeScript compilation passing

**Status**: PASS
