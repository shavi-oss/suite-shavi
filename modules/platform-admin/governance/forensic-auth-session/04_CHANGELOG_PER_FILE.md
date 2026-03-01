# 04 — CHANGELOG PER FILE

**Commit:** 9ddb433 | **Files changed:** 6 source + 3 docs

---

## `guards/deny-all.guard.ts` — Risk: LOW-MED

```diff
+import { Reflector } from '@nestjs/core';
+import { IS_EXPLICIT_ALLOW } from './explicit-allow.guard';

+constructor(private readonly reflector: Reflector) {}
 canActivate(context: ExecutionContext): boolean {
-  return false;
+  const isExplicitAllow = this.reflector.getAllAndOverride<boolean>(IS_EXPLICIT_ALLOW, [...]);
+  return isExplicitAllow === true;
 }
```

Fail-closed behavior preserved. Returns false for all routes without IS_EXPLICIT_ALLOW metadata. DenyAllGuard remains APP_GUARD.

## `guards/explicit-allow.guard.ts` — Risk: LOW

```diff
+export const IS_EXPLICIT_ALLOW = 'IS_EXPLICIT_ALLOW';
+export const ExplicitAllow = () => SetMetadata(IS_EXPLICIT_ALLOW, true);
+// ExplicitAllowGuard class kept as deprecated no-op
```

IS_EXPLICIT_ALLOW exported for DenyAllGuard. ExplicitAllow() is the new decorator. Old class retained for backward compatibility.

## `src/auth/auth.controller.ts` — Risk: LOW

```diff
-@UseGuards(ExplicitAllowGuard)  // on login, logout, session
+@ExplicitAllow()                // on login, logout, session
```

Semantics identical — route allowed through DenyAllGuard. Now actually works.

## `src/organizations/organization.controller.ts` — Risk: LOW

```diff
-@UseGuards(ExplicitAllowGuard, SessionGuard, RbacGuard)
+@ExplicitAllow()
+@UseGuards(SessionGuard, RbacGuard)
```

## `src/internal-users/internal-user.controller.ts` — Risk: LOW

Same as organizations.

## `src/audit/audit.controller.ts` — Risk: LOW

Same as organizations.

---

## Security Impact

| Assertion                            | Status                                        |
| ------------------------------------ | --------------------------------------------- |
| DenyAllGuard still APP_GUARD         | ✅ Unchanged                                  |
| Fail-closed for unknown routes       | ✅ No IS_EXPLICIT_ALLOW → returns false → 403 |
| auth endpoints now reachable         | ✅ By design                                  |
| Data endpoints still require session | ✅ SessionGuard active                        |
| auth/session without cookie → 401    | ✅ Confirmed live                             |
| No HTML on /api                      | ✅ Confirmed                                  |
| No JWT in browser                    | ✅ Not touched                                |
