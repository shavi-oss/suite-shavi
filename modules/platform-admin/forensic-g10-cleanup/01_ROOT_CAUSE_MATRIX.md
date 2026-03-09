# forensic-g10-cleanup/01_ROOT_CAUSE_MATRIX.md

## Classification

| # | File | Error | Root Cause | Category | Blocking? | Fix |
|---|---|---|---|---|---|---|
| 1 | `platformAdmin.ts:102` | `InternalUser` not exported | Interface defined but without `export` keyword | C — incorrect import/export | YES | Add `export` to `InternalUser` interface |
| 2 | `platformAdmin.ts:102` | `InternalUser.inviteStatus` missing | `inviteStatus` field not added to interface in Gate 10 | B — schema/type mismatch | YES | Add `inviteStatus` to `InternalUser` |
| 3 | `platformAdmin.ts:113` | `CreateInternalUserDto` not exported | Interface defined but without `export` keyword | C — incorrect import/export | YES | Add `export` to `CreateInternalUserDto` |
| 4 | `OrgMappingSection.tsx:156-172` | State comparison type error | Pre-existing narrowed state type that excludes `'creating'` value | B — schema/type mismatch | YES (tsc) | Fix state type to include all used values |
| 5 | `SetPasswordPage.tsx:1` | `useEffect` unused | `useEffect` imported but never used | C — incorrect import | NO (warn only) | Remove `useEffect` from import |
| 6 | `railway.json` `--accept-data-loss` | Footgun flag in production startup | No alternative exists for db-push project to add enum types | D — deployment/schema rollout hygiene | NO (live) | Document and constrain: add comment noting this is read-only risk accepted for additive-only schema on this project phase. STOP if ever non-additive. |
| 7 | `InternalUserDetail.tsx:129` | `(user as any).inviteStatus` cast | Caused by item #1/#2: InternalUser not exported with inviteStatus | C — incorrect import/export | Resolved by fix #1/#2 | Remove cast after export fix |

## Pre-Gate-10 Issues (NOT introduced by Gate 10)
- `OrgMappingSection.tsx` state type errors existed before Gate 10
- These are included in this matrix because they block `CLIENT_TSC_EXIT=0`

## Issues NOT Present (previously reported as potential problems)
- InviteStatus missing from @prisma/client: **FALSE** — it is present, `prisma generate exit 0`
- passwordHash/inviteTokenHash not in generated types: **FALSE** — BFF tsc exit 0 confirms all fields present
- ExplicitAllowGuard widened: **FALSE** — count went DOWN (4→2)
- Logic bugs in redeem/auth: **FALSE** — no logic errors found in code review
