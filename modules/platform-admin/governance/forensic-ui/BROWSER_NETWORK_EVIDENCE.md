# BROWSER_NETWORK_EVIDENCE.md

**Date:** 2026-02-28T23:11Z | **Note:** Browser not opened in this session (no live browser context). Evidence derived from live curl probes + code analysis.

---

## Reconstructed Browser Network Behavior

When a user opens `https://web-production-6f02f6.up.railway.app/`:

### Request 1: GET `/` → 200 HTML (SPA loads)

```
GET / HTTP/1.1
→ 200 text/html
SPA HTML + /assets/index-pO-lFONI.js loaded
React renders App.tsx → default section 'organizations'
OrganizationList mounts → useEffect fires → getOrganizations()
```

### Request 2: GET `/api/platform-admin/organizations` → 403 JSON

```
GET /api/platform-admin/organizations HTTP/1.1
Accept: application/json
X-Correlation-Id: <uuid>
(no Cookie header — no session exists)

← 403 Forbidden
← Content-Type: application/json
← {"message":"Forbidden resource","error":"Forbidden","statusCode":403}
```

**fetchWithCorrelation catch block fires:**

```javascript
if (response.status === 401 || response.status === 403) {
  throw new Error("Unauthorized access. Please contact your administrator.");
}
```

**normalizeError maps to:**

```javascript
{ message: 'Unauthorized access. Please contact your administrator.', isAuthError: true, canRetry: false }
```

**ErrorState renders:**

```html
<div style="...red border...">
  Error: Unauthorized access. Please contact your administrator.
</div>
```

No Retry button (canRetry: false).

---

## Same Behavior for USR and AUD

- `GET /api/platform-admin/internal-users` → 403 → same error message
- `GET /api/platform-admin/audit-logs` → 403 → same error message

---

## ROL Behavior

RoleList renders immediately — no network request issued. Network tab shows only the initial SPA asset loads. No API calls.

---

## Live Curl Confirmation (No Cookie)

```
curl -si GET /api/platform-admin/auth/session  → 403 Forbidden
curl -si GET /api/platform-admin/organizations → 403 Forbidden
curl -si GET /api/platform-admin/internal-users → 403 Forbidden
curl -si GET /api/platform-admin/audit-logs    → 403 Forbidden
```

```
curl -si POST /api/platform-admin/auth/login (JSON body, Windows shell quoting)
→ 400 Bad Request (JSON parse error from shell quoting — reached NestJS but body was malformed)
→ This CONFIRMS auth/login IS accessible, unlike the 403 from other routes.
```

> **Key distinction**: `POST /api/platform-admin/auth/login` returned 400 (NestJS body parse error) — NOT 403. This means the login route reaches NestJS processing (ExplicitAllowGuard accepted it and DenyAllGuard did NOT block it). This is the correct behavior. All other routes return 403 from DenyAllGuard.
