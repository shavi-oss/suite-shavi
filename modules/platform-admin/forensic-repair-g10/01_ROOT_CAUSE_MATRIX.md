# forensic-repair-g10/01_ROOT_CAUSE_MATRIX.md
# Gate 10 Repair — Root Cause Matrix

## Analysis Date: 2026-03-09

## Symptom Classification

| # | Symptom | Reported Severity | Actual State | Root Cause | Resolution |
|---|---|---|---|---|---|
| 1 | `passwordHash` missing on InternalUser | Blocking | NOT PRESENT — tsc 0 | Stale local generated client before Gate 10.1 regenerate | RESOLVED in Gate 10.1 |
| 2 | `InviteStatus` missing from @prisma/client | Blocking | NOT PRESENT — prisma validate 0 | Stale local generated client before Gate 10.1 | RESOLVED in Gate 10.1 |
| 3 | `inviteTokenHash`, `inviteExpiresAt`, `inviteStatus` missing | Blocking | NOT PRESENT — tsc 0 | Same as #2 | RESOLVED |
| 4 | `invite`/`redeem` missing from action map | Blocking | NOT PRESENT — railway logs confirm both fire | ActionType enum in schema was correct | NEVER WAS AN ERROR |
| 5 | Railway healthcheck failing | Observable | NOT PRESENT — health 200 | Historical: P2022 from missing DB columns; fixed by db push in startup | RESOLVED in Gate 10 |
| 6 | Client InternalUser interface missing inviteStatus | Blocking | NOT PRESENT — client tsc exit 0 | Was missing export+field in platformAdmin.ts | RESOLVED in Gate 10.1 |
| 7 | (user as any).inviteStatus unsafe cast | Code smell | NOT PRESENT — removed | Symptom of #6 | RESOLVED in Gate 10.1 |
| 8 | OrgMappingSection TS2367 narrowing errors | Blocking | NOT PRESENT — client tsc exit 0 | Pre-existing narrowed state type in JSX | RESOLVED in Gate 10.1 |
| 9 | forensic-cred governance folder untracked | Documentation | PRESENT — untracked in git | Not added to git | TO BE COMMITTED in this gate |

## No Open Blocking Issues

All previously reported local TS errors, schema mismatches, and Railway health failures are resolved.

The only outstanding item is:
- **Item #9**: `governance/forensic-cred/` folder exists locally but was never committed to the repo.

## Classification per Request Format

| Category | Open? |
|---|---|
| Schema drift | NO |
| Generated client drift | NO |
| Stale local state | NO |
| Code mismatch | NO |
| Startup/runtime misconfiguration | NO |
| Railway deployment misconfiguration | NO |
| Governance drift | NO |
| Documentation drift | governance/forensic-cred untracked |
