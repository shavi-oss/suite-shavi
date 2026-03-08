# 05_GATE_TAGS.md — Documentation Governance Pass

**Date**: 2026-03-08

## Existing Tags (pre-pass)

| Tag                                  | Commit  | Meaning                                  |
| ------------------------------------ | ------- | ---------------------------------------- |
| gate5.1-suite-write-auth-admin-key-3 | 6e1195f | Gate 5.1 — JWKS rotation + JWT minting   |
| gate5.2-org-payload-fix              | 63fe8f1 | Gate 5.2 — Core create payload alignment |
| gate6-create-org-fix                 | 2960877 | Gate 6 — 5-field create org form fix     |
| gate7-org-ux-regression              | bf5a5ed | Gate 7 — UX polish + 10 regression tests |

## Tags Created in This Pass

| Tag                | Commit                                    | Source                                |
| ------------------ | ----------------------------------------- | ------------------------------------- |
| gate6-complete     | 2960877 (same as gate6-create-org-fix)    | Alias for Gate 6 completion milestone |
| gate7-ux-polish    | bf5a5ed (same as gate7-org-ux-regression) | Alias for Gate 7 UX polish milestone  |
| suite-gate7-stable | HEAD (3a16ccc)                            | Gate 7 stable baseline snapshot       |

## Tag Verification

Run `git tag` to confirm all tags are present.
