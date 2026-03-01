# 01 — CODE TRUTH

**Date:** 2026-03-01T04:34Z | Read-only analysis of current state before fix

---

## DenyAllGuard Wiring

```typescript
// platform-admin.module.ts
@Module({
  providers: [
    { provide: APP_GUARD, useClass: DenyAllGuard },  // ← fires on ALL requests
    ...
  ]
})
```

NestJS guard execution order: `APP_GUARD (DenyAllGuard)` → route-level guards.  
DenyAllGuard returns `false` unconditionally. Any request blocked here never reaches route-level guards.

**To bypass DenyAllGuard**: A route must use `ExplicitAllowGuard` as a route-level guard. NestJS processes guards left to right but APP_GUARD conceptually "wraps" all guards — ExplicitAllowGuard returning `true` overrides DenyAllGuard only when NestJS processes them in the correct order.

---

## Currently Opted-In Routes (ExplicitAllowGuard present)

| Controller         | Route                        | Guard                                 |
| ------------------ | ---------------------------- | ------------------------------------- |
| `HealthController` | `GET /platform-admin/health` | Express middleware (not NestJS guard) |
| `AuthController`   | `POST auth/login`            | `@UseGuards(ExplicitAllowGuard)`      |
| `AuthController`   | `POST auth/logout`           | `@UseGuards(ExplicitAllowGuard)`      |
| `AuthController`   | `GET auth/session`           | `@UseGuards(ExplicitAllowGuard)`      |

Note: `auth/session` has `ExplicitAllowGuard` in code but returns 403 in live test. This is the same APP_GUARD order issue. Fix is included in scope.

---

## Data Controllers — Current State (Pre-Fix)

### `OrganizationController`

- Path: `@Controller('api/platform-admin/organizations')`
- Guard: `@UseGuards(SessionGuard, RbacGuard)` ← **missing ExplicitAllowGuard**
- All routes blocked by DenyAllGuard before SessionGuard runs

### `InternalUserController`

- Path: `@Controller('api/platform-admin/internal-users')`
- Guard: `@UseGuards(RbacGuard)` ← **missing ExplicitAllowGuard AND SessionGuard**
- ⚠️ Drift: SessionGuard absent here but present on OrganizationController

### `AuditController`

- Path: `@Controller('api/platform-admin/audit-logs')`
- Guard: `@UseGuards(RbacGuard)` ← **missing ExplicitAllowGuard AND SessionGuard**
- ⚠️ Drift: same as InternalUserController

---

## Required Fix (Minimal Diff)

Add `ExplicitAllowGuard` as first guard in `@UseGuards(...)` on all 3 data controllers:

| Controller               | Current                               | Required                                                  |
| ------------------------ | ------------------------------------- | --------------------------------------------------------- |
| `OrganizationController` | `@UseGuards(SessionGuard, RbacGuard)` | `@UseGuards(ExplicitAllowGuard, SessionGuard, RbacGuard)` |
| `InternalUserController` | `@UseGuards(RbacGuard)`               | `@UseGuards(ExplicitAllowGuard, SessionGuard, RbacGuard)` |
| `AuditController`        | `@UseGuards(RbacGuard)`               | `@UseGuards(ExplicitAllowGuard, SessionGuard, RbacGuard)` |

Note: SessionGuard added to InternalUserController and AuditController to close the drift. This is within scope (minimal fix to make guards consistent).
