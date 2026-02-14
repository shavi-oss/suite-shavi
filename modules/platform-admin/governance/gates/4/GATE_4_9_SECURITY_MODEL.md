# Gate 4.9 — Security Model

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Module Name    | platform-admin                          |
| Document Title | GATE_4_9_SECURITY_MODEL                 |
| Repo           | Suite (Layer / Product Repo)            |
| Status         | TEMPORARY — PLAN ONLY                   |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-01-30                              |

---

## 1) Purpose

Define how Gate 4.9 introduces an opt-in endpoint WITHOUT weakening the fail-closed default for all other routes.

---

## 2) Security Principles

### 2.1 Fail-Closed by Default (PRESERVED)

**Global Guard**: `DenyAllGuard` remains wired as `APP_GUARD`  
**Effect**: All routes denied by default  
**Verification**: Existing tests confirm deny-all behavior

### 2.2 Explicit Opt-In (NEW)

**Mechanism**: Route-level guard override using `@UseGuards()`  
**Scope**: ONLY the health endpoint  
**Effect**: Health endpoint becomes accessible; all other routes remain denied

---

## 3) Override Mechanism

### 3.1 ExplicitAllowGuard Approach

**Implementation**:

```typescript
@Injectable()
export class ExplicitAllowGuard implements CanActivate {
  canActivate(_context: ExecutionContext): boolean {
    return true; // Always allow
  }
}

@Get('health')
@UseGuards(ExplicitAllowGuard)
getHealth(): HealthResponse { ... }
```

**How It Works**:

- `ExplicitAllowGuard` always returns `true`
- Route-level guard overrides `APP_GUARD`
- Only this specific route becomes accessible
- Explicit naming prevents accidental misuse

**Risk**: `ExplicitAllowGuard` could be misused on other routes  
**Mitigation**:

- Code review required for any use of `ExplicitAllowGuard`
- Tests verify only health endpoint uses it
- Non-regression tests count routes using `ExplicitAllowGuard`

---

## 4) Threats Prevented

### 4.1 Accidental Route Exposure

**Threat**: Developer adds new route without guard override  
**Prevention**: `DenyAllGuard` denies by default  
**Verification**: Tests confirm new routes are denied

### 4.2 Bypass of Fail-Closed Default

**Threat**: Developer weakens `APP_GUARD` globally  
**Prevention**: `APP_GUARD` is in module metadata (immutable without explicit change)  
**Verification**: Tests confirm `APP_GUARD` is still `DenyAllGuard`

### 4.3 Unauthorized Access to Health Endpoint

**Threat**: Health endpoint exposes sensitive data  
**Prevention**: Health endpoint returns only static, non-sensitive data  
**Verification**: Response schema contains no secrets, PII, or business logic

### 4.4 Scope Creep (Multiple Endpoints)

**Threat**: Developer adds more endpoints in Gate 4.9  
**Prevention**: Gate 4.9 plan explicitly limits to ONE endpoint  
**Verification**: Tests confirm only one controller, one route

---

## 5) Stop Conditions

STOP execution immediately if:

- `APP_GUARD` is removed or changed from `DenyAllGuard`
- More than one endpoint is created
- Health endpoint returns sensitive data (secrets, PII, env vars)
- `AllowGuard` (if used) is applied to multiple routes
- Any route becomes accessible without explicit opt-in

---

## 6) Verification Requirements

### 6.1 Fail-Closed Default Preserved

**Test**: Attempt to access non-existent route (e.g., `/platform-admin/foo`)  
**Expected**: 403 Forbidden (denied by `DenyAllGuard`)

### 6.2 Health Endpoint Accessible

**Test**: `GET /platform-admin/health`  
**Expected**: 200 OK with static response

### 6.3 No Other Routes Accessible

**Test**: Enumerate all routes in module  
**Expected**: Only `/platform-admin/health` exists

### 6.4 APP_GUARD Still DenyAllGuard

**Test**: Check module metadata for `APP_GUARD` provider  
**Expected**: `APP_GUARD` uses `DenyAllGuard`

---

## 7) Allowed Changes (Gate 4.9 EXECUTE)

**Security-Relevant Files**:

- `modules/platform-admin/guards/explicit-allow.guard.ts` (NEW — opt-in guard)
- `modules/platform-admin/guards/index.ts` (MODIFY — export ExplicitAllowGuard)
- `modules/platform-admin/controllers/health.controller.ts` (NEW — opt-in route)
- `modules/platform-admin/platform-admin.module.ts` (MODIFY — add controller)

**Forbidden Changes**:

- `modules/platform-admin/guards/deny-all.guard.ts` (MUST NOT MODIFY)
- `modules/platform-admin/platform-admin.module.ts` APP_GUARD provider (MUST NOT REMOVE)

---

## 8) Signature

**Status**: TEMPORARY — PLAN ONLY  
**Security Posture**: Fail-closed preserved, opt-in explicit  
**Approval**: Pending governance review
