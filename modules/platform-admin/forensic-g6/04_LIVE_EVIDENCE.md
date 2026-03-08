# 04_LIVE_EVIDENCE.md — Gate 6

**Date**: 2026-03-08  
**Deployed commit**: 2960877 (`gate6-create-org-fix`)

## A — Health

```
GET /api/platform-admin/health => 200 OK
```

## B — Login

```
POST /api/platform-admin/auth/login => 200 OK
Set-Cookie: sessionId=... HttpOnly; Secure; SameSite=Strict
```

## C — Unauthenticated create (fail-closed)

```
POST /api/platform-admin/organizations (no cookie)
=> 401 Unauthorized {"message":"Unauthorized access...","statusCode":401}
```

## E — Create org with all 5 Core-required fields

```
POST /api/platform-admin/organizations
Content-Type: application/json
Body: { name:"G6-Org-1772960545", adminEmail:"admin1772960545@g6.io",
        adminPassword:"***", adminFirstName:"Gate", adminLastName:"Six" }

=> 200 OK
Response: {
  "id": "c93cc250-a0dd-47e8-a55a-b88c4f64120b",
  "name": "G6-Org-1772960545",
  "status": "active",
  "createdAt": "2026-03-08T09:02:30.215Z",
  "updatedAt": "2026-03-08T09:02:30.215Z",
  "createdBy": "3e28350a-9a9a-4f85-b36b-4e9585d25971"
}
```

## Lifecycle regression (same org)

```
GET  /organizations               => 200 ✅
PATCH /organizations/:id/suspend  => 200 ✅
PATCH /organizations/:id/unsuspend => 200 ✅
DELETE /organizations/:id         => 200 ✅
```

## Security

- No JWT in any response body ✅
- Session cookie HttpOnly/Secure/SameSite=Strict ✅
- Browser has no JWT (cookies-only auth) ✅
