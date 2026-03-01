# 03 — BROWSER E2E EVIDENCE

**Date:** 2026-03-01T05:47Z

## Login Form (Anonymous State)

Login form shown at root URL when no session present.

## Network Request Summary (from DevTools)

| Request                                          | Method | Status | Result                      |
| ------------------------------------------------ | ------ | ------ | --------------------------- |
| `/api/platform-admin/auth/session` (on load)     | GET    | 401    | → shows login form          |
| `/api/platform-admin/auth/login`                 | POST   | 200    | → session cookie set        |
| `/api/platform-admin/auth/session` (after login) | GET    | 200    | → navigation shell rendered |
| `/api/platform-admin/organizations`              | GET    | 401    | → ErrorState shown          |
| `/api/platform-admin/internal-users`             | GET    | 401    | → ErrorState shown          |
| `/api/platform-admin/audit-logs`                 | GET    | 401    | → ErrorState shown          |
| `/api/platform-admin/auth/logout`                | POST   | 200    | → login form shown again    |

## UI Behavior Confirmed

- ✅ Login form shows when anonymous
- ✅ Login credentials accepted (POST 200)
- ✅ Session confirmed (GET /session 200 after login)
- ✅ App shell renders with ORG/USR/ROL/AUD navigation + Sign out button
- ✅ Sign out returns to login form
- ⚠️ Data screens (ORG/USR/AUD) show 401 — next blocker (missing Core JWT in session)

## Cookie Behavior

- Browser correctly sends `sessionId=<uuid>` httpOnly cookie on subsequent requests
- No JWT visible in browser storage (localStorage/sessionStorage empty)
- `credentials: 'include'` in fetch calls confirmed working

## Recording

Browser E2E session recordings captured during verification.
