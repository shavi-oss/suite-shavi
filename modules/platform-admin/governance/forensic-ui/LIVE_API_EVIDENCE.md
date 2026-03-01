# LIVE_API_EVIDENCE.md

**Date:** 2026-02-28T22:33Z | **Binary:** `dc48127` | **ETag:** `W/"29-zmRbQiQJP94KG54GtGDpWj1h6So"`

---

## Probe 1: Health (reference)

```
GET /api/platform-admin/health

HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"status":"ok","module":"platform-admin"}
```

✅ BFF running. Express middleware bypasses DenyAllGuard.

---

## Probe 2: Organizations (no session cookie)

```
GET /api/platform-admin/organizations

HTTP/1.1 403 Forbidden
Content-Type: application/json; charset=utf-8

{"message":"Forbidden resource","error":"Forbidden","statusCode":403}
```

🔴 DenyAllGuard fires. No session cookie present → 403 JSON. Correct fail-closed behavior.

---

## Probe 3: Internal Users (no session cookie)

```
GET /api/platform-admin/internal-users

HTTP/1.1 403 Forbidden
Content-Type: application/json; charset=utf-8

{"message":"Forbidden resource","error":"Forbidden","statusCode":403}
```

🔴 Same as Probe 2.

---

## Probe 4: Audit Logs (no session cookie)

```
GET /api/platform-admin/audit-logs

HTTP/1.1 403 Forbidden
Content-Type: application/json; charset=utf-8

{"message":"Forbidden resource","error":"Forbidden","statusCode":403}
```

🔴 Same as Probe 2.

---

## Probe 5: Auth Session (no session cookie)

```
GET /api/platform-admin/auth/session

HTTP/1.1 403 Forbidden
Content-Type: application/json; charset=utf-8

{"message":"Forbidden resource","error":"Forbidden","statusCode":403}
```

⚠️ Wait — this is UNEXPECTED. `auth/session` has `@UseGuards(ExplicitAllowGuard)`.
If ExplicitAllowGuard bypasses DenyAllGuard, this should return 401 (no cookie), not 403.
This confirms that **DenyAllGuard (APP_GUARD) fires BEFORE ExplicitAllowGuard** on the `auth/session` route.

> **Critical discovery**: Only `/api/platform-admin/health` (raw Express middleware) is actually accessible. All NestJS routes — even those marked `@UseGuards(ExplicitAllowGuard)` — are blocked by the APP_GUARD.

---

## Note: Login route not probed via curl here

`POST /api/platform-admin/auth/login` — same situation: ExplicitAllowGuard on the route, but APP_GUARD fires first. Expected: 403.

This needs dedicated testing with curl -d to confirm.
