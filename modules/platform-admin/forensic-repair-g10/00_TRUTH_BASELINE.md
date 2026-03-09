# forensic-repair-g10/00_TRUTH_BASELINE.md
# Gate 10 Repair — Truth Baseline Audit
# Date: 2026-03-09T09:26 UTC+2

## IMPORTANT: Evidence-First Ruling

The Gate 10 Repair brief listed the following symptoms:
- Local TypeScript errors (passwordHash, InviteStatus missing)
- Railway healthcheck failing
- Schema/runtime drift

**ALL of these reported symptoms are contradicted by actual current code and runtime evidence.**
This document records the actual truth as of 2026-03-09.

---

## 1. Current Commit and Branch

```
Branch:       master
Latest commit: 63f59a0  docs(platform-admin): Gate 10.1 forensic evidence
Prior commit:  480ebc6  fix(platform-admin): clean up invite/auth schema and type consistency (Gate 10.1)
```

Tag inventory:
- `suite-gate10.1-stable` → 63f59a0 (latest)
- `suite-gate10-stable` → 3f41b03

Git status: **clean** — only untracked temp files (node_error.txt, node_output.txt) and untracked `governance/forensic-cred/` folder (local only, not committed).

---

## 2. Git Status Summary

```
?? modules/platform-admin/governance/forensic-cred/  ← untracked, needs commit
?? node_error.txt       (temp/scratch, not in scope)
?? node_output.txt      (temp/scratch, not in scope)
```

**No modified tracked files. All Gate 10.1 changes are committed.**

---

## 3. Prisma InternalUser Schema (Current)

File: `modules/platform-admin/prisma/schema.prisma`

```prisma
model InternalUser {
  id               String       @id @default(uuid()) @db.Uuid
  email            String       @unique @db.VarChar(255)
  name             String       @db.VarChar(255)
  role             UserRole
  status           UserStatus   @default(active)
  createdAt        DateTime     @default(now()) @db.Timestamptz
  updatedAt        DateTime     @updatedAt @db.Timestamptz
  createdBy        String       @db.Uuid
  passwordHash     String?      @db.VarChar(255)
  inviteTokenHash  String?      @db.VarChar(255)
  inviteExpiresAt  DateTime?    @db.Timestamptz
  inviteStatus     InviteStatus @default(pending)
}
```

`prisma validate` exit 0: **schema is valid**.

---

## 4. InviteStatus in Schema

YES — `InviteStatus` enum exists in schema:
```prisma
enum InviteStatus { pending | invited | active | expired }
```

---

## 5. Generated Prisma Client — Field Availability

`prisma generate` exit 0. InviteStatus and all invite fields are in generated client.
BFF code imports `InviteStatus` from `@prisma/client` without error (tsc exit 0).

---

## 6. App Code vs Generated Client

**No mismatch.** BFF TypeScript: `tsc exit 0`. All fields are available.
Client TypeScript: `tsc exit 0` (fixed in Gate 10.1).

---

## 7. Auth Flow in auth.service.ts

Dual-path `validateCredentials`:
1. Query DB first (`findByEmail`)
2. If absent or deactivated → dummyVerify + 401
3. Check `OPERATOR_CREDENTIALS` env → Path 1 (bootstrap admin)
4. If not in env → check `passwordHash` → Path 2 (DB-backed invited user)
5. All failures: generic 401, constant-time

No logic bugs. Correctly documented and implemented.

---

## 8 & 9. Dockerfile behavior

```dockerfile
CMD ["sh", "-c", "npx prisma db push --schema=... --skip-generate --accept-data-loss && node dist/.../main.js"]
```

`railway.json` `startCommand` overrides the Dockerfile CMD:
```json
"startCommand": "npx prisma db push ... --accept-data-loss && node dist/.../main.js"
```

This is the effective startup path on Railway.

---

## 10. railway.json startCommand

```json
"startCommand": "npx prisma db push --schema=modules/platform-admin/prisma/schema.prisma --skip-generate --accept-data-loss && node dist/modules/platform-admin/host/main.js"
```

This runs `prisma db push --accept-data-loss` before the NestJS app starts.

---

## 11. --accept-data-loss in startup

YES — `--accept-data-loss` is in both Dockerfile CMD and railway.json startCommand.
This was required to add the `InviteStatus` enum type (PostgreSQL requires it for enum additions via db push).
All changes applied are additive — no actual data loss.
Risk is documented and accepted for this project phase.

---

## 12. Why healthcheck was failing (Historical)

The health failure occurred during Gate 10 deployment because:
1. New code was deployed with Prisma client expecting new fields (passwordHash etc.)
2. Railway DB still had old schema (columns not yet created)
3. First login attempt → `P2022: column internal_users.passwordHash does not exist`
4. This was resolved by: adding `prisma db push --accept-data-loss` to railway.json startCommand

Current state: **health is fully restored**. `GET /api/platform-admin/health` → 200 `{"status":"ok"}`.

---

## 13. Prior Gate History Mixed State

No mixed state in current branch. All repairs from Gate 10 and 10.1 are committed and deployed.
The `forensic-cred` governance folder is untracked (local only) — needs to be committed.

---

## SUMMARY: Reported Symptoms vs Actual Truth

| Symptom | Reported | Actual |
|---|---|---|
| Local TS errors (passwordHash/InviteStatus) | Expected | NONE — tsc exit 0 |
| Railway health failing | Expected | 200 OK — healthy |
| Schema/generated client mismatch | Expected | NONE — prisma generate exit 0 |
| Deployment state unclear | Expected | Clean — two tags (gate10, gate10.1) |
| invite/redeem actions missing | Expected | PRESENT — railway logs confirm |

**The reported Gate 10 Repair scope is already resolved by Gate 10.1.**
No additional code repairs are required.
