# 04 — CHANGELOG PER FILE

**Commits:** 2f3d078 (UI) + 2f8b012 (cookieParser fix)

---

## `client/src/App.tsx` (Overwrite — major)

- Added `AuthStatus` type: `'unknown' | 'anonymous' | 'authenticated' | 'error'`
- Added `useEffect` session check on mount: `GET /auth/session`
  - 200 → `'authenticated'` → renders existing navigation shell
  - non-200 → `'anonymous'` → renders login form
- Added inline login form:
  - email + password fields (htmlFor, autoComplete, accessible)
  - Error state displays server message
  - Loading state disables button
  - `handleLogin`: POST /login → checkAuth() → fail-closed if session still 401
- Added logout strip: `POST /auth/logout` → resets to `'anonymous'`
- Loading screen for `'unknown'` state (brief session check flicker)
- Data components (ORG/USR/AUD) only mount when `authenticated`

## `client/src/api/platformAdmin.ts` (Overwrite — minor additions)

- `fetchWithCorrelation`: added `credentials: 'include'`
- `getSession()`: raw fetch, returns `{userId, expiresAt}` or throws (no Unauthorized message)
- `login(email, password)`: raw fetch POST, throws with server message on error
- `logout()`: raw fetch POST (best-effort, no throw)

## `host/main.ts` (Single-line fix)

- Added `const cookieParser = require('cookie-parser')` (require, not ES import — @types not installed)
- Added `app.use(cookieParser())` before health middleware

---

## Files NOT Changed

- Any guard, controller, service, repository, module, schema, migration
- Any package.json, lock file
- Any other client component
