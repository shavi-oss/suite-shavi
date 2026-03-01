# NEXT_STEP_OPTIONS.md

**Date:** 2026-02-28T23:11Z | **Read-only proposal — no code changed**

---

## Option 1 — API-Only Session Bootstrap (Fastest, No UI)

**Recommended for: immediate operator testing without building login UI**

### Mechanism

Use `curl` to call the existing `POST /api/platform-admin/auth/login` endpoint (already guarded with ExplicitAllowGuard and functional). Extract the `sessionId` cookie and inject it into the browser DevTools.

### Steps for operator

```bash
# 1. Obtain session cookie
curl -si -X POST https://web-production-6f02f6.up.railway.app/api/platform-admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"any"}' \
  --cookie-jar /tmp/session.txt

# 2. See the Set-Cookie header — extract sessionId value

# 3. In browser DevTools → Application → Cookies
#    Add cookie: Name=sessionId, Value=<uuid>, Domain=web-production-6f02f6.up.railway.app
#    HttpOnly=true, SameSite=Strict, Path=/

# 4. Reload the browser tab — ORG/USR/AUD screens should load
```

### Scope Lock

**Zero code changes required.** Login endpoint already exists and is functional.

### Limitations

- Operator must repeat cookie injection after every page reload (sessionId is httpOnly — not accessible via JS, but persists across reloads if set correctly in DevTools)
- Session expires in 15 minutes
- Container restart clears all sessions (in-memory SessionService)
- Authentication accepts any credentials (no password validation yet)

### Stop Conditions

- If BFF requires additional session validation that blocks data endpoints (SessionGuard rejects the cookie)
- If `credentials: 'include'` is missing in fetch calls (would cause cookie not to be sent for cross-origin, but same-origin should work by default)

### Verification Matrix

```
POST /api/platform-admin/auth/login → 200 + Set-Cookie: sessionId=<uuid>
GET  /api/platform-admin/organizations (with cookie) → 200 or 403 from RBAC (not DenyAll)
GET  /api/platform-admin/internal-users (with cookie) → 200 or 403 from RBAC
GET  /api/platform-admin/audit-logs (with cookie) → 200 or 403 from RBAC
```

---

## Option 2 — Minimal Login Screen (Proper UI Flow)

**Recommended for: functional product testing / pre-production use**

### Mechanism

Add a `Login` section to `App.tsx` with a form that calls `POST /api/platform-admin/auth/login`. On success, the `sessionId` cookie is set by the BFF response. All subsequent fetches send the cookie automatically (same-origin).

### Exact Files That Would Change

| File                                  | Change                                                                                  |
| ------------------------------------- | --------------------------------------------------------------------------------------- |
| `client/src/App.tsx`                  | Add `'login'` as a Section type; render `<LoginForm>` when `!session`                   |
| `client/src/components/LoginForm.tsx` | **[NEW]** Simple form: email + password → POST /auth/login → success → redirect to orgs |
| `client/src/api/platformAdmin.ts`     | Add `login(email, password)` and `getSession()` functions                               |

### Security Constraints (Must Preserve)

- ✅ No browser JWT — BFF sets httpOnly cookie only, client never sees token
- ✅ DenyAllGuard unchanged — fail-closed preserved
- ✅ No CORS wildcard — same-origin login
- ✅ ExplicitAllowGuard on login route already in place
- ⚠️ NO credential validation currently in `AuthController.login` — accepts any email/password. This is a TODO: future gate must add JWKS/JWT validation

### Stop Conditions

- If JWKS-based admin JWT validation is required before login works → implement JWKS verification in `SessionService` first
- Do NOT add bypass of DenyAllGuard for any other routes
- Do NOT store sessionId in localStorage/sessionStorage — httpOnly cookie only

### Scope Lock (files touchable)

```
modules/platform-admin/client/src/App.tsx
modules/platform-admin/client/src/components/LoginForm.tsx  ← new
modules/platform-admin/client/src/api/platformAdmin.ts
```

No BFF changes needed unless credential validation is in scope.

### Verification Matrix

```
UI: Login form renders at root when no session cookie
UI: POST /auth/login → cookie set → ORG screen loads with data
UI: GET /api/platform-admin/organizations (with session) → 200 data
UI: Logout → cookie cleared → login screen shown again
Security: Network tab shows no JWT in response body or local storage
Security: /api routes still return 403 without sessionId cookie
```

---

## Shared Prerequisite: `credentials: 'include'` NOT needed (same-origin)

The fetch calls use relative URLs (`/api/platform-admin/...`). In production (Railway), the React SPA and BFF are on the same origin — cookies are sent by default for same-origin `fetch()` calls (`credentials: 'same-origin'` is default). **No change to `platformAdmin.ts` fetch calls is needed for cookie transmission.**
