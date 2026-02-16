# Suite PR-1 — How to Fix the Code (Exact Edits)
Goal: ensure Core JWT is **server-only** and never required from UI requests.

---

## File to edit (ONLY)
`modules/platform-admin/src/org-mapping/org-mapping.controller.ts`

---

## Change 1 — Import SessionGuard
Add:
```ts
import { SessionGuard } from '../auth/session.guard';
```

Keep import order consistent with existing style.

---

## Change 2 — Enforce SessionGuard on the controller
Find:
```ts
@UseGuards(RbacGuard)
```
Replace with:
```ts
@UseGuards(SessionGuard, RbacGuard)
```

**Reason:** `SessionGuard` must run before RBAC, so request gets `coreJwt` attached server-side.

---

## Change 3 — Read `coreJwt` from request context (not headers)
Find the line sourcing Core JWT from `authorization` header, e.g.:
```ts
const coreJwt = req.headers['authorization']?.replace('Bearer ', '');
```
Replace with:
```ts
const coreJwt = req.coreJwt;
```

Leave the existing fail-closed check as-is:
```ts
if (!coreJwt) {
  throw new Error('Core JWT is required for org mapping validation');
}
```

---

## What NOT to do
- Do not change any other endpoints.
- Do not change DTOs, services, repositories.
- Do not edit SessionGuard or JwtStorageService in this PR.
- Do not change error handling semantics (keep fail-closed).

---

## Expected behavior after fix
- Requests to org-mapping routes no longer depend on an `Authorization` header from the client.
- If the session is missing or server-side JWT is missing, SessionGuard blocks access (fail-closed).

---

END
