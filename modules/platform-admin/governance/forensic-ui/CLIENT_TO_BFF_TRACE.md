# CLIENT_TO_BFF_TRACE.md

**Date:** 2026-02-28T23:11Z | **Read-only**

---

## Full Stack Call Trace

| Screen | Client API fn        | Fetch URL (relative)                     | Vite proxy (dev only) → | BFF Controller Route            | Guards                                                | DB / Core dependency              |
| ------ | -------------------- | ---------------------------------------- | ----------------------- | ------------------------------- | ----------------------------------------------------- | --------------------------------- |
| ORG    | `getOrganizations()` | `GET /api/platform-admin/organizations`  | → `localhost:4000`      | `OrganizationController @Get()` | **APP_GUARD(DenyAll)** + `SessionGuard` + `RbacGuard` | `OrganizationRepository` → Prisma |
| USR    | `getInternalUsers()` | `GET /api/platform-admin/internal-users` | → `localhost:4000`      | `InternalUserController @Get()` | **APP_GUARD(DenyAll)** + `SessionGuard` + `RbacGuard` | `InternalUserRepository` → Prisma |
| AUD    | `getAuditLogs()`     | `GET /api/platform-admin/audit-logs`     | → `localhost:4000`      | `AuditController @Get()`        | **APP_GUARD(DenyAll)** + `SessionGuard` + `RbacGuard` | `AuditRepository` → Prisma        |
| ROL    | _(none)_             | _(none)_                                 | _(none)_                | _(none)_                        | _(none)_                                              | _(none)_                          |

---

## Key Finding 1 — Production Uses Same-Origin (No Proxy)

**Vite proxy** (`vite.config.ts` L16-19) maps `/api/platform-admin` → `localhost:4000`  
**This only runs during `vite dev`.**

In production (Railway), the SPA is served by the same NestJS/Express process at port 8080. Browser calls `fetch('/api/platform-admin/organizations')` → same-origin → NestJS. **The proxy is irrelevant in production. Path mapping is correct.**

---

## Key Finding 2 — DenyAllGuard Is APP_GUARD (NestJS Global Layer)

```typescript
// platform-admin.module.ts
{ provide: APP_GUARD, useClass: DenyAllGuard }
```

NestJS processes guards in this order:

1. **APP_GUARD (DenyAllGuard)** — returns `false` → request rejected with 403
2. Route-level guards (`SessionGuard`, `RbacGuard`) — **never reached**

The OrganizationController declares `@UseGuards(SessionGuard, RbacGuard)` but these never execute because DenyAllGuard fires first.

---

## Key Finding 3 — No `credentials: 'include'` in fetch

```typescript
// platformAdmin.ts ← fetchWithCorrelation
const response = await fetch(url, { ...options, headers });
// Missing: credentials: 'include'
```

Even if a session cookie existed, the browser's `fetch()` would NOT send it to the BFF because `credentials: 'include'` is absent. The default for same-origin is `credentials: 'same-origin'`, which DOES send cookies for same-origin requests. **This is not a blocker for production — same-origin defaults work.** Cookies would be sent if they existed.

---

## Key Finding 4 — No Login Screen in UI

`App.tsx` renders 4 sections: `organizations`, `users`, `roles`, `audit`.  
There is **no login section, no login form, no login page**.

`AuthController.login()` exists at `POST /api/platform-admin/auth/login` with:

- `ExplicitAllowGuard` (bypasses DenyAllGuard ✅)
- Creates a `sessionId` cookie (in-memory, 15 min TTL)
- Accepts any email/password — no credential validation yet

The login route is FUNCTIONAL but has no UI to call it.

---

## Key Finding 5 — SessionService Is In-Memory (No Persistence)

```typescript
private sessions: Map<string, SessionData> = new Map();
```

Sessions are stored in-memory. A container restart clears all sessions. On Railway, every deployment cycle clears sessions. But for functional testing, a single session created via `POST /login` survives for 15 minutes in the current container instance.
