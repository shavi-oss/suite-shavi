# Gate 4.9 — Endpoint Plan

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Module Name    | platform-admin                          |
| Document Title | GATE_4_9_ENDPOINT_PLAN                  |
| Repo           | Suite (Layer / Product Repo)            |
| Status         | TEMPORARY — PLAN ONLY                   |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-01-30                              |

---

## 1) Endpoint Choice

**Selected**: **Option A — GET /platform-admin/health**

**Rationale**:

- Safest option (static response, no external dependencies)
- Minimal attack surface (no input processing, no DB, no Core)
- Standard health check pattern (familiar, predictable)
- Proves opt-in mechanism works without complexity
- No secrets, no PII, no business logic

---

## 2) Route Specification

**HTTP Method**: `GET`  
**Path**: `/platform-admin/health`  
**Controller**: `HealthController`  
**Handler**: `getHealth()`

---

## 3) Request/Response Schema

### Request

**Method**: `GET`  
**Headers**: None required  
**Query Params**: None  
**Body**: None

### Response

**Status**: `200 OK`  
**Content-Type**: `application/json`

**Body**:

```json
{
  "status": "ok",
  "module": "platform-admin",
  "timestamp": "2026-01-30T18:00:00.000Z"
}
```

**Schema** (TypeScript):

```typescript
interface HealthResponse {
  status: "ok";
  module: "platform-admin";
  timestamp: string; // ISO 8601
}
```

---

## 4) Explicit Security Model

### 4.1 Fail-Closed Default Preserved

**Global Default**: `DenyAllGuard` remains wired as `APP_GUARD`  
**Effect**: All routes DENIED by default

### 4.2 Opt-In Override Mechanism

**Approach**: Use `ExplicitAllowGuard` with `@UseGuards()` decorator

**Implementation**:

```typescript
@Injectable()
export class ExplicitAllowGuard implements CanActivate {
  canActivate(_context: ExecutionContext): boolean {
    return true; // Always allow
  }
}

@Controller("platform-admin")
export class HealthController {
  @Get("health")
  @UseGuards(ExplicitAllowGuard)
  getHealth(): HealthResponse {
    return {
      status: "ok",
      module: "platform-admin",
      timestamp: new Date().toISOString(),
    };
  }
}
```

**Why This Works**:

- `ExplicitAllowGuard` always returns `true`
- Route-level guard overrides `APP_GUARD`
- Only this specific route becomes accessible
- Explicit naming prevents accidental misuse

---

## 5) Forbidden Items

### 5.1 Absolutely Forbidden

❌ **Core Integration**: No Core API calls  
❌ **Database Access**: No Prisma, no DB queries  
❌ **Authentication**: No auth checks, no tokens  
❌ **Authorization**: No RBAC, no permissions (beyond opt-in)  
❌ **External APIs**: No HTTP calls to external services  
❌ **Environment Variables**: No env access (except NODE_ENV if needed)  
❌ **Secrets**: No tokens, credentials, or PII  
❌ **Business Logic**: No domain logic, no validation  
❌ **Multiple Endpoints**: ONLY health endpoint

### 5.2 Allowed (Minimal)

✅ **Static Response**: Hardcoded JSON response  
✅ **Timestamp**: `new Date().toISOString()` for current time  
✅ **Controller**: Single controller with one route  
✅ **DTO**: Response DTO (optional, for type safety)

---

## 6) File Structure

**New Files** (Gate 4.9 EXECUTE):

```
modules/platform-admin/
├── guards/
│   └── explicit-allow.guard.ts
├── controllers/
│   ├── health.controller.ts
│   └── index.ts
├── dto/
│   ├── health-response.dto.ts
│   └── index.ts
└── tests/
    └── unit/
        ├── controllers/
        │   └── health.controller.spec.ts
        └── guards/
            └── explicit-allow.guard.spec.ts
```

**Modified Files**:

```
modules/platform-admin/platform-admin.module.ts (add controller)
modules/platform-admin/index.ts (export controller if needed)
```

---

## 7) Allowed Changes (Gate 4.9 EXECUTE)

**Exact Paths**:

- `modules/platform-admin/guards/explicit-allow.guard.ts` (NEW)
- `modules/platform-admin/guards/index.ts` (MODIFY — export ExplicitAllowGuard)
- `modules/platform-admin/controllers/health.controller.ts` (NEW)
- `modules/platform-admin/controllers/index.ts` (NEW)
- `modules/platform-admin/dto/health-response.dto.ts` (NEW)
- `modules/platform-admin/dto/index.ts` (NEW)
- `modules/platform-admin/platform-admin.module.ts` (MODIFY — add controller)
- `modules/platform-admin/tests/unit/controllers/health.controller.spec.ts` (NEW)
- `modules/platform-admin/tests/unit/guards/explicit-allow.guard.spec.ts` (NEW)
- `modules/platform-admin/tests/security/fail-closed.spec.ts` (MODIFY — add tests)
- `modules/platform-admin/tests/non-regression/build.spec.ts` (MODIFY — add tests)

**Forbidden Changes**:

- Any file outside `modules/platform-admin/`
- Any Core integration code
- Any database migrations
- Any new dependencies
- Any CI/CD changes
- Any guards beyond `ExplicitAllowGuard`

---

## 8) Stop Conditions

STOP execution immediately if:

- More than one endpoint created
- Any Core API call attempted
- Any database access attempted
- Any authentication/authorization beyond opt-in
- Any secrets or tokens introduced
- Any business logic beyond static response
- Fail-closed default weakened for other routes

---

## 9) Signature

**Status**: TEMPORARY — PLAN ONLY  
**Next Step**: Review and approval required before execution
