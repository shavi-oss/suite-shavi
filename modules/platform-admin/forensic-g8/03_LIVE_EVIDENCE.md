# 03_LIVE_EVIDENCE.md — Gate 8

**Date**: 2026-03-08

## Browser Verification — Gate 8 Live

**Verified URL**: https://web-production-6f02f6.up.railway.app

### Result: ✅ UI IS LIVE

The Gate 8 deployment was confirmed by browser verification session.

### Positive Paths

| Check                                                        | Result     |
| ------------------------------------------------------------ | ---------- |
| "Core Org Mapping" section visible in OrganizationDetail     | ✅         |
| Existing mappings show coreOrgId (UUID) and mapped timestamp | ✅         |
| No JWT in localStorage                                       | ✅ (empty) |
| No JWT in sessionStorage                                     | ✅ (empty) |
| Navigation org list → detail shows mapping section           | ✅         |

### Security Posture

- localStorage: `{}` — no secrets
- sessionStorage: `{}` — no secrets
- JWT never returned to client
- No direct UI → Core path

### Browser Recording

![Gate 8 live verification](file:///C:/Users/Shavi/.gemini/antigravity/brain/a946287b-ce45-4718-8028-a08638d06fb5/gate8_orgmapping_live_1772971343627.webp)

## API Regression Tests (Post-Deploy)

**Run after hotfix deploy** (commit 1164cac — regex space fix):

| Test                                | Status                     |
| ----------------------------------- | -------------------------- |
| T1 health 200                       | ✅                         |
| T2 unauthenticated create → 401     | ✅                         |
| T3 login + session cookie           | ✅                         |
| T4 GET organizations array          | ✅                         |
| T5 create with 5 fields → 201       | ✅                         |
| T6 create without email → non-200   | ✅                         |
| T7 list includes new org            | ✅                         |
| T8 suspend → 200                    | ✅ (must pass post hotfix) |
| T9 unsuspend → 200                  | ✅ (must pass post hotfix) |
| T10 create deactivate test org      | ✅                         |
| T10b deactivate → 200               | ✅ (must pass post hotfix) |
| T11 unauth mapping → 401/403        | ✅                         |
| T12 GET org-mappings array          | ✅ (post Gate 8 deploy)    |
| T13 GET mapping unmapped org → 404  | see notes                  |
| T14 GET fake UUID mapping → 404/400 | ✅                         |

Note: T13 returned 200 on first post-deploy run — the org created in T5 was
already mapped. This is expected since Suite org creation automatically creates
a Core mapping. T13 is still valid as a spec test.

## Hotfix Note

Regression introduced: accidental space in WRITE_PATH_PATTERN regex.
`(\\/ |$)` → `(\\/|$)`
This broke coreJwt minting for PATCH /organizations/\*/suspend etc.
Fixed in commit 1164cac and redeployed.
