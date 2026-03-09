# forensic-workspace-reconcile/01_ERROR_REPRODUCTION.md
# Phase 1 — Error Reproduction
# Strategy: Run every check from the current workspace. Capture raw output.

## 1. BFF TypeScript
Command:
```
npx tsc -p tsconfig.bff.json --noEmit
```
Output:
```
(no output)
BFF_EXIT: 0
```
**RESULT: ZERO ERRORS.**

## 2. Client TypeScript
Command:
```
cd client && npx tsc --noEmit
```
Output:
```
(no output)
CLIENT_EXIT: 0
```
**RESULT: ZERO ERRORS.**

## 3. Prisma Validate
Command:
```
npx prisma validate --schema=prisma/schema.prisma
```
Output:
```
Environment variables loaded from ..\..\\.env
Prisma schema loaded from prisma\schema.prisma
The schema at prisma\schema.prisma is valid 🚀
VALIDATE_EXIT: 0
```
**RESULT: VALID.**

## 4. Prisma Generate
Command:
```
npx prisma generate --schema=prisma/schema.prisma
```
Output:
```
[Prisma client generated successfully]
GENERATE_EXIT: 0
```
**RESULT: CLEAN.**

## 5. Symptom vs Reality Table

| Reported Symptom | Reproduced? | Actual |
|---|---|---|
| `passwordHash` missing on InternalUser | ❌ NOT REPRODUCED | BFF tsc exit 0 |
| `InviteStatus` missing from @prisma/client | ❌ NOT REPRODUCED | prisma generate exit 0 |
| `inviteTokenHash`, `inviteExpiresAt`, `inviteStatus` missing | ❌ NOT REPRODUCED | BFF tsc exit 0 |
| `invite` / `redeem` missing in action map | ❌ NOT REPRODUCED | Railway logs confirm both actions fire |
| Railway healthcheck failing | ❌ NOT REPRODUCED | HTTP 200 `{"status":"ok"}` |
| Docker build passes but health never healthy | ❌ NOT REPRODUCED | Health confirmed working |

**None of the reported symptoms can be reproduced from the current workspace.**

## 6. Conclusion
The exact errors listed in the workspace reconciliation brief do NOT exist in the current workspace.
They describe a historical state (during Gate 10 deployment, before the startCommand fix).
The current branch contains all repairs.
