# forensic-repair-g10/05_CHANGELOG_PER_FILE.md
# Gate 10 Repair — Changelog Per File

## Changes in THIS gate (Gate 10 Repair)

This gate produced NO code changes.

All reported symptoms were found to be absent from the current repository state.
Gate 10.1 had already resolved all the issues described in the Gate 10 Repair brief.

---

## What Was Done In This Gate
- Full evidence-first audit (Phase 0)
- Root cause matrix (Phase 1)
- Confirmed no repairs required (Phase 2 — no-op)
- Local and live verification documented
- Governance reconciliation documented
- Committed untracked `governance/forensic-cred/` to repository

---

## Files Changed by This Gate
Only documentation files:

| File | Action |
|---|---|
| `forensic-repair-g10/00_TRUTH_BASELINE.md` | NEW |
| `forensic-repair-g10/01_ROOT_CAUSE_MATRIX.md` | NEW |
| `forensic-repair-g10/02_LOCAL_VERIFICATION.md` | NEW |
| `forensic-repair-g10/03_LIVE_VERIFICATION.md` | NEW |
| `forensic-repair-g10/04_GOVERNANCE_RECONCILIATION.md` | NEW |
| `forensic-repair-g10/05_CHANGELOG_PER_FILE.md` | NEW |
| `forensic-repair-g10/06_FINAL_VERDICT.md` | NEW |
| `governance/forensic-cred/00_BASELINE_EVIDENCE.md` | COMMITTED (was untracked) |
| `governance/forensic-cred/01_CODE_TRUTH.md` | COMMITTED (was untracked) |
| `governance/forensic-cred/02_LOCAL_VERIFICATION.md` | COMMITTED (was untracked) |
| `governance/forensic-cred/03_LIVE_EVIDENCE.md` | COMMITTED (was untracked) |
| `governance/forensic-cred/04_CHANGELOG_PER_FILE.md` | COMMITTED (was untracked) |
| `governance/forensic-cred/05_FINAL_VERDICT.md` | COMMITTED (was untracked) |

---

## Prior Gate Changes (Gate 10 + Gate 10.1) For Reference

### Gate 10 code changes
- `prisma/schema.prisma`: +InviteStatus enum, +4 credential fields on InternalUser, +invite/redeem ActionType, performedBy VarChar
- `internal-user.repository.ts`: +storeInviteToken, +redeemInvite, +expireInvite
- `internal-user.service.ts`: +generateInvite, +redeemInvite, +_dummyScrypt
- `internal-user.controller.ts`: +POST /:id/invite
- `auth.service.ts`: dual-path validateCredentials
- `auth.controller.ts`: class-level @ExplicitAllow(), +POST /auth/redeem-invite
- `create-internal-user.dto.ts`: +inviteStatus, +InviteResponseDto, +RedeemInviteDto
- `platformAdmin.ts` (client): +InviteResult, +generateInvite, +redeemInvite
- `InternalUserDetail.tsx`: invite status badge, Generate/Regenerate UI
- `SetPasswordPage.tsx`: NEW
- `App.tsx`: URL param detection → SetPasswordPage
- `internal-users.test.mjs`: +T11-T17
- `railway.json`: +startCommand
- `Dockerfile`: CMD updated

### Gate 10.1 code changes
- `platformAdmin.ts`: exported InternalUser+inviteStatus, exported CreateInternalUserDto
- `InternalUserDetail.tsx`: removed (user as any) cast
- `SetPasswordPage.tsx`: removed unused useEffect
- `OrgMappingSection.tsx`: fixed TS2367 narrowing via isCreating boolean
