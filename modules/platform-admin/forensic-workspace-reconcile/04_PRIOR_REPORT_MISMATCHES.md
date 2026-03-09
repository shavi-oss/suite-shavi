# forensic-workspace-reconcile/04_PRIOR_REPORT_MISMATCHES.md
# Phase 4 — Prior Report Mismatches vs Current Workspace

## Methodology
For each claim from prior forensic reports, we verify against current workspace evidence.
Workspace truth wins. Reports that were accurate are noted. Reports that were wrong are explained.

## Comparison Table

| Prior Report Claim | Current Workspace Reality | Verdict |
|---|---|---|
| "InviteStatus exists in generated client" (Gate 10.1 report) | ✅ Confirmed — prisma generate exit 0, BFF tsc exit 0 | REPORT ACCURATE |
| "BFF tsc exit 0" (Gate 10.1 report) | ✅ Confirmed — BFF tsc exit 0 | REPORT ACCURATE |
| "Client tsc exit 0" (Gate 10.1/Repair reports) | ✅ Confirmed — client tsc exit 0 | REPORT ACCURATE |
| "Railway health restored" (Gate Repair report) | ✅ Confirmed — HTTP 200 `{"status":"ok"}` | REPORT ACCURATE |
| "T1-T17 all pass" (Gate 10.1 report) | ✅ Confirmed — 17/17 PASS in this gate's live test run | REPORT ACCURATE |
| "invite+redeem ActionType present" (Gate 10.1 report) | ✅ Confirmed — Railway logs show both actions firing | REPORT ACCURATE |
| "--accept-data-loss in railway.json" (Gate Repair report) | ✅ Confirmed — verified in current railway.json | REPORT ACCURATE |
| "Docker CMD contains prisma db push" (Gate Repair report) | ✅ Confirmed — verified in current Dockerfile line 49 | REPORT ACCURATE |

## Gate Brief Symptom Claims vs Reality

The Workspace Reconciliation brief stated these as "known current symptoms":
- `passwordHash` missing on InternalUser → **WRONG** — present in schema and generated client
- `InviteStatus` missing from @prisma/client → **WRONG** — present, prisma generate exit 0
- `inviteTokenHash` etc. missing → **WRONG** — all present, BFF tsc exit 0
- `invite`/`redeem` missing in action map → **WRONG** — present in schema, confirmed in live logs
- Railway healthcheck failing → **WRONG** — health 200 OK confirmed

## Root Cause of Discrepancy

The brief is describing symptoms that existed at the START of Gate 10 deployment, BEFORE:
1. `prisma db push` was added to the startCommand (commit `0d1eb89`)
2. `--accept-data-loss` was added for enum additions (commit `928fd5e`)
3. Client type exports were fixed in Gate 10.1 (commit `480ebc6`)

The current workspace is AHEAD of those historical symptoms. All repairs are committed.

## Were Prior Reports Accurate?

**Yes.** Prior Gate 10.1 and Gate Repair reports accurately described the repaired state.
The brief describing "current symptoms" described a historical state, not the current workspace.

## Is Any Mismatch Blocking?

**No.** No blocking mismatches found in the current workspace.
