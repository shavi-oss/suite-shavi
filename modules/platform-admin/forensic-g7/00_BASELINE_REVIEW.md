# 00_BASELINE_REVIEW.md — Gate 7

**Date**: 2026-03-08

## Current Component Inventory

### OrganizationCreate.tsx

- ✅ Loading state (`loading` bool, disables button)
- ✅ Error feedback (ErrorState component)
- ✅ All 5 Core-required fields (Gate 6 fix)
- ✅ Client-side validation
- ✅ Form reset on success
- ❌ No success message/feedback displayed after create

### OrganizationDetail.tsx

- ✅ Loading state on page load
- ✅ `actionLoading` state (disables button during in-flight)
- ✅ Suspend handler (`handleSuspend`) with state update
- ✅ Unsuspend handler (`handleUnsuspend`) with state update
- ❌ **No Deactivate UI or handler** (deactivate was working via curl but missing from UI entirely)
- ❌ **No confirmation dialog** for suspend or deactivate (destructive actions fire immediately)
- ❌ **No success feedback message** after suspend/unsuspend/deactivate
- ❌ Error retry mistakenly wires to suspend/unsuspend action (confusing)

### OrganizationList.tsx

- ✅ Loading state on fetch
- ✅ Error feedback with retry
- ✅ Empty state
- ❌ No inline action buttons (only "View Details" → navigates to detail)
- ❌ Status badge shows "active"/"suspended" but not "deactivated"

## Existing Tests

**None.** No test runner configured (no Vitest, no Jest) in the client package.json.
Strategy: Write Node.js API-level regression tests (built-in `assert` + `fetch`) — no new dependencies.

## What Must Be Added (Phase 1)

1. Deactivate button in OrganizationDetail
2. Confirmation dialog for Suspend (destructive)
3. Confirmation dialog for Deactivate (irreversible — higher severity)
4. Success feedback message after action (inline, auto-clears or stable)
5. `deleteOrganization` function in platformAdmin.ts

## What Must Be Added (Phase 2)

6. Regression test script: `modules/platform-admin/tests/org-flows.test.mjs`
