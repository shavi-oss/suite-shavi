# 04 — CHANGELOG PER FILE

**Commit:** 3c2f883 | **Files changed:** 3 source + 3 docs

---

## Source Changes

### `src/organizations/organization.controller.ts` — Risk: LOW

```diff
+import { ExplicitAllowGuard } from '../../guards/explicit-allow.guard';
 @UseGuards(SessionGuard, RbacGuard)
 →
+// ExplicitAllowGuard: opt-in override of DenyAllGuard (APP_GUARD).
+@UseGuards(ExplicitAllowGuard, SessionGuard, RbacGuard)
```

No logic changed. Guard order: ExplicitAllowGuard (pass DenyAll) → SessionGuard (validate cookie) → RbacGuard (validate role).

### `src/internal-users/internal-user.controller.ts` — Risk: LOW

```diff
+import { SessionGuard } from '../auth/session.guard';
+import { ExplicitAllowGuard } from '../../guards/explicit-allow.guard';
 @UseGuards(RbacGuard)
 →
+@UseGuards(ExplicitAllowGuard, SessionGuard, RbacGuard)
```

Added SessionGuard (drift fix — was missing vs organization controller). No logic changed.

### `src/audit/audit.controller.ts` — Risk: LOW

```diff
+import { SessionGuard } from '../auth/session.guard';
+import { ExplicitAllowGuard } from '../../guards/explicit-allow.guard';
 @UseGuards(RbacGuard)
 →
+@UseGuards(ExplicitAllowGuard, SessionGuard, RbacGuard)
```

Same as internal-users. Drift fix. No logic changed.

---

## Security Impact

| Assertion                         | Status                          |
| --------------------------------- | ------------------------------- |
| DenyAllGuard still APP_GUARD      | ✅ Not touched                  |
| New routes opened without session | ❌ None — all have SessionGuard |
| All /api routes return JSON       | ✅ Confirmed live               |
| No wildcard CORS                  | ✅ Not touched                  |
| No JWT in browser                 | ✅ Not touched                  |
| No extra files changed            | ✅ Only 3 controllers + 3 docs  |
