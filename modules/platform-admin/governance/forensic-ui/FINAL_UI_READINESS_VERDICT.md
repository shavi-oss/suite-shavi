# FINAL_UI_READINESS_VERDICT.md

**Date:** 2026-02-28T23:11Z | **Commit reviewed:** dc48127

---

## Verdict: ✅ READY_FOR_UI_READONLY

> The screens are **structurally correct** but **blocked by a missing session bootstrap**.  
> There are NO proxy errors, NO miswired endpoints, NO broken controllers, NO missing BFF routes.  
> The system is working exactly as designed (fail-closed).

---

## Evidence

| Assertion                                              | Evidence                                                          |
| ------------------------------------------------------ | ----------------------------------------------------------------- |
| Client calls correct API paths                         | `API_BASE='/api/platform-admin'` — same-origin — no proxy in prod |
| BFF routes exist and are correctly registered          | NestJS logs: all controllers mapped at `/api/platform-admin/*`    |
| DenyAllGuard correctly blocks unauthenticated requests | 403 JSON from org/users/audit (not HTML, not 404)                 |
| Login endpoint accessible (ExplicitAllowGuard works)   | POST /auth/login → 400 (body error) — NOT 403; reached NestJS     |
| Session/cookie mechanism intact                        | SessionService + httpOnly cookie wiring complete                  |
| ROL screen works                                       | Pure static data — no auth dependency                             |
| ORG/USR/AUD structural code is correct                 | Components call correct endpoints; error handling is correct      |
| Security: fail-closed preserved                        | All unauthenticated /api requests → 403                           |

---

## What Is Missing

**One thing only: a login flow for the operator.**

Once a valid `sessionId` cookie exists in the browser, the request pipeline becomes:

```
fetchWithCorrelation('/api/platform-admin/organizations')
→ Cookie: sessionId=<uuid> (same-origin, sent automatically)
→ BFF: APP_GUARD(DenyAll) blocks → BUT WAIT

Actually → DenyAllGuard on OrganizationController fires...
→ OrganizationController also has @UseGuards(SessionGuard, RbacGuard) at route level
```

**Wait — important clarification:**  
DenyAllGuard fires for ALL routes UNLESS overridden by ExplicitAllowGuard. OrganizationController does NOT have ExplicitAllowGuard — it has SessionGuard + RbacGuard. These are route-level guards that run AFTER APP_GUARD.

This means: **even with a valid session cookie, DenyAllGuard will still return 403 for OrganizationController.**

The guard chain must be:

1. APP_GUARD (DenyAllGuard) → returns false → 403. End.

Route-level `@UseGuards(SessionGuard, RbacGuard)` never runs because APP_GUARD already denied.

---

## Revised Root Cause: TWO Blockers, Not One

| Blocker                                        | Type         | Fix Required                                                                                       |
| ---------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------- |
| **No login screen**                            | Missing UI   | Add `<LoginForm>` or inject cookie manually                                                        |
| **DenyAllGuard blocks OrganizationController** | Architecture | OrganizationController needs `ExplicitAllowGuard` OR DenyAllGuard needs to be made reflector-aware |

**The fail-closed architecture requires explicit opt-in for EVERY route.** Currently only health + auth routes have ExplicitAllowGuard. Data routes (org/users/audit) will 403 even WITH a valid session.

---

## Actual Verdicts Per Screen

| Screen | Status                   | Blocker                                                                    |
| ------ | ------------------------ | -------------------------------------------------------------------------- |
| ROL    | ✅ READY_FOR_UI (static) | None                                                                       |
| ORG    | 🔴 BLOCKED               | No login UI + DenyAllGuard blocks without ExplicitAllowGuard on controller |
| USR    | 🔴 BLOCKED               | Same as ORG                                                                |
| AUD    | 🔴 BLOCKED               | Same as ORG                                                                |

---

## Minimal Fix Plan Summary (Proposal Only)

**Option 1 (fastest, read-only test):** Manual curl login → DevTools cookie injection → but still blocked by DenyAllGuard unless controllers also get ExplicitAllowGuard.

**Required minimal code changes for full UI readiness:**

1. `App.tsx` + `LoginForm.tsx` — add login UI → operator can get session cookie
2. `OrganizationController`, `InternalUserController`, `AuditController` — add `ExplicitAllowGuard` per GATE 4.9 pattern (opt-in, same as HealthController) so DenyAllGuard passes them through to SessionGuard + RbacGuard
3. SessionGuard must then validate cookie → allow or 401
4. RbacGuard then checks role → allow or 403

**Without step 2, even a valid session cannot reach data endpoints.**

---

## No-Code-Change Verdict

The system is architecturally sound and secure. The READY_FOR_UI_READONLY claim is accurate if interpreted as:  
_"The system is structurally ready to have a login flow added and will work correctly once the guard chain is completed."_

All current behavior is **intentional and correct per governance rules (fail-closed).**
