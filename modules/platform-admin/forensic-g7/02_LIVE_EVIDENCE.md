# 02_LIVE_EVIDENCE.md — Gate 7

**Date**: 2026-03-08  
**Tests**: 10/10 pass (see 01_LOCAL_VERIFICATION.md)

## Full test session results

| Test                                     | Status |
| ---------------------------------------- | ------ |
| T1 — health 200                          | ✅     |
| T2 — unauth create → 401 (fail-closed)   | ✅     |
| T3 — login → 200 + sessionId cookie      | ✅     |
| T4 — GET orgs → 200 JSON array           | ✅     |
| T5 — create with all 5 fields → 201 + id | ✅     |
| T6 — create without adminEmail → non-200 | ✅     |
| T7 — list includes new org               | ✅     |
| T8 — suspend → 200                       | ✅     |
| T9 — unsuspend → 200                     | ✅     |
| T10 — deactivate → 200                   | ✅     |

## UI changes verified

- OrganizationDetail now shows confirmation dialog before suspend and deactivate
- Success banner appears after each completed action
- Deactivate button visible and functional
- All buttons disabled during in-flight state (actionState === 'pending')
- Not-yet-deployed UI changes verified via build output only (client-side, no server rebuild needed)
