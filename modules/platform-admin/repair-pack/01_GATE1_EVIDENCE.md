# 01_GATE1_EVIDENCE.md — Remove Unsafe Runtime DB Ops

**Gate**: 1  
**Commit**: 421fc19  
**Tag**: `suite-repair-g1-db-safe`  
**Result**: ✅ PASS

## Changes Made

- `Dockerfile` line 50: CMD changed from `sh -c "npx prisma db push --accept-data-loss || true && node ..."` → `node dist/modules/platform-admin/host/main.js`
- Comment header updated: no longer claims `prisma migrate deploy` at runtime
- `docs/runbook/DB_PROVISIONING.md` created: documents one-shot operator provisioning command

## Verification Evidence

### Health check (post-deploy)

```
HTTP/1.1 200 OK
```

### Railway logs — startup sequence (no db push found)

```
[Nest] LOG [InstanceLoader] AppModule dependencies initialized
[Nest] LOG [InstanceLoader] PrismaModule dependencies initialized
[Nest] LOG [InstanceLoader] PlatformAdminModule dependencies initialized
```

**No `prisma`, `db push`, or `accept-data-loss` in runtime logs.** ✅

## STOP Conditions — All Clear

- ✅ `--accept-data-loss` not present anywhere in Dockerfile
- ✅ `|| true` not present around any DB operation
- ✅ Deploy is healthy (`/health` → 200)
