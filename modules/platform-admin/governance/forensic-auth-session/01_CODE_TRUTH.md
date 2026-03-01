# 01 — CODE TRUTH

**Date:** 2026-03-01T05:09Z | Read-only analysis

---

## Guard Chain on `GET /auth/session`

From `auth.controller.ts`:

```typescript
@Get('session')
@UseGuards(ExplicitAllowGuard)   // ← route-level guard
getSession(@Req() request: Request): SessionResponseDto {
  if (!sessionId) throw new UnauthorizedException(...)  // ← NEVER REACHED
  ...
}
```

From `platform-admin.module.ts`:

```typescript
providers: [
  { provide: APP_GUARD, useClass: DenyAllGuard }, // ← global guard
];
```

---

## Guard Execution Order (NestJS internal)

```
Request arrives
  → APP_GUARD (DenyAllGuard.canActivate()) → returns false → ForbiddenException (403)
  → ← request rejected here, never continues

[route-level @UseGuards(ExplicitAllowGuard) ← NEVER EVALUATED]
[route handler getSession() ← NEVER CALLED]
[UnauthorizedException ← NEVER THROWN]
```

**Conclusion**: 403 comes from DenyAllGuard (APP_GUARD). SessionGuard, ExplicitAllowGuard, and the handler are never executed.

---

## Root Cause: ExplicitAllowGuard Cannot Override APP_GUARD

NestJS guard execution: global guards run BEFORE controller/route guards. All guards must return `true` for the request to proceed. If APP_GUARD (DenyAllGuard) returns `false`, a `ForbiddenException` is thrown immediately — route-level guards never run.

**Bug**: `ExplicitAllowGuard` at route level has no mechanism to communicate to `DenyAllGuard` (APP_GUARD). The design requires DenyAllGuard to be **reflector-aware** — it must check if the current route/handler has an "is-public" metadata marker.

---

## SessionGuard on Missing Cookie

From `session.guard.ts` line 19-21:

```typescript
if (!sessionId) {
  throw new UnauthorizedException("..."); // ← 401, CORRECT BEHAVIOR
}
```

SessionGuard correctly returns 401 on missing cookie. It is NOT the source of the 403.

---

## Fix Selected: Option B — Make DenyAllGuard Reflector-Aware

Industry-standard NestJS pattern. DenyAllGuard uses `Reflector` to check if the current route has `IS_EXPLICIT_ALLOW` metadata. If set → return `true` (allow through). Else → return `false` (deny).

ExplicitAllowGuard is redefined as a metadata decorator (`SetMetadata`) instead of a guard. The decorator sets `IS_EXPLICIT_ALLOW: true` on the route handler. DenyAllGuard reads this metadata and passes the request through.

**Result**: auth/session without cookie → DenyAllGuard passes (metadata set) → SessionGuard blocks → throws `UnauthorizedException` → 401. ✅
