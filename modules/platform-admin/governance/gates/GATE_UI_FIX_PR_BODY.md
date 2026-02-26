# PR Body Template — suite-shavi fix/ui-relocation

## Summary

Verifies that suite-shavi already contains all required admin dashboard UI components,
documents environment variables, and adds governance artifacts for the UI relocation fix.

**No existing UI code was modified.** This PR is governance + `.env.example` only.

## What Was Added

| File                                                    | Purpose                                                             |
| ------------------------------------------------------- | ------------------------------------------------------------------- |
| `client/.env.example`                                   | Documents `VITE_API_URL` and legacy env var references — no secrets |
| `governance/gates/GATE_UI_FIX_PLAN.md`                  | Approved fix plan                                                   |
| `governance/gates/GATE_UI_FIX_EXECUTION_REPORT.md`      | Step-by-step execution log                                          |
| `governance/gates/GATE_UI_FIX_VERIFICATION_EVIDENCE.md` | Security grep + build evidence                                      |

## Context

A companion `fix/ui-relocation` branch in **BassanOs** removes the misplaced React UI files
that should never have been in the core NestJS repo. This PR confirms suite-shavi is already
the correct and complete home for all admin dashboard UI.

## Pre-existing Component Coverage (No New Code Needed)

| BassanOs misplaced file                 | suite-shavi equivalent                |
| --------------------------------------- | ------------------------------------- |
| `api/adminApi.ts`                       | `api/platformAdmin.ts` (BFF-mediated) |
| `pages/AdminDashboard.tsx`              | `App.tsx` + Navigation + Header       |
| `components/CreateOrganizationForm.tsx` | `components/OrganizationCreate.tsx`   |
| `components/OrganizationList.tsx`       | `components/OrganizationList.tsx`     |

## Security Verification

| Check                                                | Result                    |
| ---------------------------------------------------- | ------------------------- |
| No `/api/v1` calls in client src                     | ✅ Empty grep             |
| No `localStorage` usage in client src                | ✅ Empty grep             |
| No hardcoded secrets in `.env.example`               | ✅ Template/comments only |
| BFF source (`modules/platform-admin/src/`) untouched | ✅                        |

## Build Verification

| Check                  | Result                        |
| ---------------------- | ----------------------------- |
| `npm run build` (Vite) | ✅ EXIT 0 — 46 modules, 2.63s |
| `npx tsc --noEmit`     | ✅ EXIT 0 — zero errors       |

## Environment Variables Documented

See `client/.env.example`:

- `VITE_API_URL` — points to BFF (primary authorised pattern)
- `VITE_ADMIN_JWT`, `VITE_CORE_API_URL` — commented legacy references only

## Checklist for Reviewer

- [ ] Confirm only `.env.example` and `governance/gates/GATE_UI_FIX_*.md` files changed
- [ ] Confirm BFF `src/` has zero diff
- [ ] Confirm `package.json` (root + client) is unchanged
- [ ] Review together with companion BassanOs PR
- [ ] Merge after review ← **no auto-merge**
