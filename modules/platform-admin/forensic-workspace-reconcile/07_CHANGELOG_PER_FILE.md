# forensic-workspace-reconcile/07_CHANGELOG_PER_FILE.md
# Phase 7 — Changelog Per File

## Changes Made in This Gate (Workspace Reconciliation)

**No code changes were made.**

All reported symptoms were found to be absent from the current workspace.
Phase 5 (Repairs) was a no-op because there were no repairs to make.

---

## Files Created in This Gate
Documentation only:

| File | Action |
|---|---|
| `forensic-workspace-reconcile/00_CURRENT_WORKSPACE_SNAPSHOT.md` | NEW |
| `forensic-workspace-reconcile/01_ERROR_REPRODUCTION.md` | NEW |
| `forensic-workspace-reconcile/02_SCHEMA_AND_PRISMA_TRUTH.md` | NEW |
| `forensic-workspace-reconcile/03_RUNTIME_AND_STARTUP_TRUTH.md` | NEW |
| `forensic-workspace-reconcile/04_PRIOR_REPORT_MISMATCHES.md` | NEW |
| `forensic-workspace-reconcile/05_LOCAL_VERIFICATION.md` | NEW |
| `forensic-workspace-reconcile/06_LIVE_VERIFICATION.md` | NEW |
| `forensic-workspace-reconcile/07_CHANGELOG_PER_FILE.md` | NEW |
| `forensic-workspace-reconcile/08_FINAL_VERDICT.md` | NEW |

---

## Historical Code Changes (NOT made in this gate — already committed)

### Gate 10 (commits 6ffc764 → 3f41b03)
- schema.prisma: +InviteStatus enum, +passwordHash/inviteTokenHash/inviteExpiresAt/inviteStatus, +invite/redeem ActionType, performedBy VarChar
- internal-user.repository.ts: +storeInviteToken, +redeemInvite, +expireInvite
- internal-user.service.ts: +generateInvite, +redeemInvite, +_dummyScrypt
- internal-user.controller.ts: +POST /:id/invite
- auth.service.ts: dual-path validateCredentials (env bootstrap + DB-backed)
- auth.controller.ts: class-level @ExplicitAllow, +POST /auth/redeem-invite
- create-internal-user.dto.ts: +InviteStatus, +InviteResponseDto, +RedeemInviteDto
- platformAdmin.ts (client): +InviteResult, +generateInvite, +redeemInvite
- InternalUserDetail.tsx: invite status badge + Generate/Regenerate UI
- SetPasswordPage.tsx: NEW (invite redemption page)
- App.tsx: URL param detection → SetPasswordPage
- internal-users.test.mjs: +T11-T17
- railway.json: +startCommand (prisma db push → node main.js)
- Dockerfile: CMD updated

### Gate 10.1 (commit 480ebc6)
- platformAdmin.ts: exported InternalUser+inviteStatus, exported CreateInternalUserDto
- InternalUserDetail.tsx: removed (user as any) cast
- SetPasswordPage.tsx: removed unused useEffect
- OrgMappingSection.tsx: fixed TS2367 narrowing via isCreating
