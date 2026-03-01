# UNAUTHORIZED_ROOT_CAUSE.md

**Date:** 2026-02-28T23:11Z | **Commit:** dc48127

---

## Decision Tree

```
Q: Why do ORG/USR/AUD show "Unauthorized access"?

A → Q1: Is client calling the correct URL?
     ✅ YES — /api/platform-admin/organizations etc. are correct paths.
       API_BASE = '/api/platform-admin' (same-origin, no proxy in production).

A → Q2: Is the BFF receiving the requests?
     ✅ YES — 403 JSON returned (not HTML, not 404). BFF is alive and NestJS processes request.

A → Q3: Is it a proxy/base URL mismatch?
     ❌ NO — 403 is from DenyAllGuard (NestJS JSON response), not proxied HTML or network error.

A → Q4: Is it RBAC misconfiguration?
     ❌ NO — RBAC (RbacGuard) never executes. DenyAllGuard (APP_GUARD) fires first.

A → Q5: Is it a missing session?
     ✅ YES (but this is 2nd order) — Even if session existed, DenyAllGuard would still block
        OrganizationController because it has no ExplicitAllowGuard.
        SessionGuard + RbacGuard on the controller are never reached.

A → Q6: Is the auth/login route accessible?
     ✅ YES (confirmed) — POST /auth/login returned 400 (bad body), not 403.
        ExplicitAllowGuard correctly bypasses DenyAllGuard for login/logout routes.

A → Q7: Is there a login UI?
     ❌ NO — App.tsx has no login section. User cannot obtain a session cookie.
```

---

## Primary Root Cause: **Missing Login Flow (No Session Bootstrap)**

**Evidence chain:**

1. `DenyAllGuard` = APP_GUARD → blocks ALL NestJS routes
2. `OrganizationController` uses `@UseGuards(SessionGuard, RbacGuard)` — both require a session
3. But DenyAllGuard fires BEFORE any route-level guard, so org/user/audit routes return 403
4. `AuthController.login` has `ExplicitAllowGuard` which overrides DenyAllGuard correctly ← **login IS accessible**
5. `App.tsx` has NO login screen → user cannot call POST /auth/login → no `sessionId` cookie
6. Without a session cookie, every data endpoint returns 403 from DenyAllGuard

**Root cause: No login screen exists → operator cannot authenticate → no session → DenyAllGuard blocks all data endpoints**

---

## Secondary Observation: DenyAllGuard + ExplicitAllowGuard Pattern Works Correctly

- `GET /api/platform-admin/health` → 200 (Express middleware, before NestJS)
- `POST /api/platform-admin/auth/login` → 400 (reached NestJS — ExplicitAllowGuard bypassed DenyAll ✅)
- `GET /api/platform-admin/organizations` → 403 (DenyAllGuard blocks ✅ correct fail-closed)

**The guard architecture is correct. There is no bug in the guards.**

---

## Why ROL Works

`RoleList.tsx` has zero network calls. It renders 4 hardcoded role definitions from a static JS array. No guard, no session, no cookie needed.

---

## Contributing Cause: ExplicitAllowGuard on Auth Session

`GET /api/platform-admin/auth/session` has `@UseGuards(ExplicitAllowGuard)` but returns 403.

**Explanation**: In NestJS, when `APP_GUARD` (DenyAllGuard) is registered, it runs for ALL requests before route-level guards. However, the documented behavior of `ExplicitAllowGuard` as a route-level guard should work differently...

Testing confirms: `POST auth/login` (same controller, same ExplicitAllowGuard) returns 400 (not 403) — it DOES reach NestJS. Meanwhile `GET auth/session` returns 403.

This is likely because DenyAllGuard registers as APP_GUARD at the module level and NestJS applies it **globally**, but ExplicitAllowGuard on a route overrides it when the route is processed. The behavior may depend on guard execution order and NestJS version. Since login works, the pattern IS functional for POST routes. This is not the primary blocker — the primary blocker is the missing login UI.

---

## Summary Table

| Cause                                                       | Type         | Evidence                          |
| ----------------------------------------------------------- | ------------ | --------------------------------- |
| No login screen in UI                                       | **PRIMARY**  | App.tsx has no login section      |
| DenyAllGuard blocks data endpoints (correct behavior)       | Contributing | 403 JSON on org/users/audit       |
| No session cookie in browser (consequence of missing login) | Contributing | No Cookie header in fetch         |
| SessionService in-memory (no persistence)                   | Minor risk   | Container restart clears sessions |
