# 00_BASELINE_EVIDENCE.md — Pre-Repair State

**Captured**: 2026-03-01T08:07Z  
**Commit**: acacc79 / f1c54c2 (sentinel coreJwt + Dockerfile prisma db push)

## Curl Evidence (Production)

### GET /health

```
HTTP/1.1 200 OK
```

### GET /auth/session (no cookie)

```
HTTP/1.1 401 Unauthorized
{"message":"Unauthorized access. Please contact your administrator.","error":"Unauthorized","statusCode":401}
```

### POST /auth/login (empty body)

```
HTTP/1.1 200 OK
{"message":"Login successful"}
```

⚠️ Accepts empty body — no credential validation.

### GET /organizations (no cookie)

```
HTTP/1.1 401 Unauthorized
{"message":"Unauthorized access. Please contact your administrator.","error":"Unauthorized","statusCode":401}
```

## Known Bad Workarounds (pre-fix)

### A — Dockerfile (line 50)

```dockerfile
CMD ["sh", "-c", "npx prisma db push --schema=modules/platform-admin/prisma/schema.prisma --accept-data-loss || true && node dist/modules/platform-admin/host/main.js"]
```

### B — session.guard.ts (lines 33–41)

```typescript
(request as any).user = {
  id: userId,
  role: "platform_admin", // temporary: grants full READ access
  status: "active",
};
```

### C — auth.controller.ts (line 36)

```typescript
this.jwtStorageService.set(userId, `platform-admin-session:${userId}`);
```

## Railway Env Vars Confirmed Present

- `DATABASE_URL` ✅
- `DATABASE_PUBLIC_URL` ✅
- `CORE_API_BASE_URL` = `https://core-admin-mount-production.up.railway.app` ✅
- `ADMIN_JWKS_URL` = `https://jwks-server-production.up.railway.app/.well-known/jwks.json` ✅
- `CORS_ORIGIN` ✅
- `PLATFORM_ADMIN_CORE_JWT` — NOT PRESENT (Gate 3 addressed via Option B)
