# forensic-railway-verify/05_LOG_REVIEW.md
# Phase 5 — Railway Logs and Regression Scan
# Date: 2026-03-10
# Source: `railway logs --service web` — last 30 entries

## Log Evidence (raw, recent entries)

```
[AuditService] entityType: 'internal_user', action: 'create',    result: 'success'  (08:52:59 UTC)
[AuditService] entityType: 'internal_user', action: 'create',    result: 'success'  (08:52:59 UTC)
[AuditService] entityType: 'internal_user', action: 'deactivate', result: 'success' (08:52:59 UTC)
[AuditService] entityType: 'internal_user', action: 'invite',    result: 'success'  (08:53:00 UTC)
[AuditService] entityType: 'internal_user', action: 'redeem',    result: 'success'  (08:53:02 UTC)
[AuditService] entityType: 'internal_user', action: 'create',    result: 'success'  (latest)
```

## Issue Checklist

| Issue | Present? | Evidence |
|---|---|---|
| NestJS bootstrap crash | ❌ NO | App is running, health 200, audit logs firing |
| Prisma client/type runtime error | ❌ NO | T15 invite redeem passes; no P2022 errors in logs |
| Stale .prisma/client shadow | ❌ NO | .dockerignore + Dockerfile rm fixed (commit 0e7a3ba) |
| DB connection failure | ❌ NO | Audit log writes succeed; db push "already in sync" |
| Startup retries | ❌ NO | Service running continuously since last deploy |
| healthcheck timing failure | ❌ NO | Health 200 confirmed immediately |
| Unhandled promise rejections | ❌ NO | No error-level log lines in recent output |
| Auth errors at startup | ❌ NO | No such messages in logs |
| `invite` / `redeem` undefined | ❌ NO | ActionType.invite + ActionType.redeem fire correctly |

## Assessment

**No crash occurred. No warnings detected. Prior root cause is fully resolved.**

The stale nested `.prisma/client` issue that caused the 10:08 UTC healthcheck failure
on 2026-03-09 is confirmed absent:
- The `.dockerignore` excludes `modules/platform-admin/node_modules/` from Docker context
- The Dockerfile `RUN rm -rf modules/platform-admin/node_modules/.prisma` ensures belt-and-suspenders defense
- Railway rebuild used the new Dockerfile and produced a clean image
- Runtime: `InviteStatus.invited`, `InviteStatus.active`, `ActionType.invite`, `ActionType.redeem` all resolve correctly

## Residual Risk

**NONE blocking.**

Only acknowledged ongoing note: `--accept-data-loss` in startCommand (for Prisma db push enum additions). All schema changes are additive. This is documented and accepted.
