# Gate 31 — Plan

## Document Control

| Attribute      | Value                             |
| -------------- | --------------------------------- |
| Gate Number    | 31                                |
| Gate Name      | System Shell Implementation       |
| Document Title | GATE_31_PLAN                      |
| Repo           | Suite (Layer / Product Repo)      |
| Module         | platform-admin                    |
| Status         | CODE + EVIDENCE · FAIL-CLOSED     |
| Execution Mode | IMPLEMENTATION · GOVERNANCE-FIRST |
| Authority      | Platform Architecture Governance  |
| Date           | 2026-02-11                        |

---

## 1) Purpose

Implement minimal System Shell to resolve CRITICAL DRIFT (Shell Absence) detected in Gate 30.

**This is architecture implementation, NOT design work.**

---

## 2) Scope

### 2.1 In Scope

**Implementation**:

- Create Header component (system-level, immutable)
- Create Navigation Rail component (permanent)
- Create Workspace Container component (framed surface)
- Update `App.tsx` to use shell structure
- Preserve all existing Organizations UI logic

**Governance**:

- Create 4 Gate 31 governance files
- Provide verification evidence
- Document compliance with Gate 29.5 DNA

---

### 2.2 Out of Scope (FORBIDDEN)

**MUST NOT**:

- Add dependencies
- Modify `package.json` or `package-lock.json`
- Modify BFF (`modules/platform-admin/src/**`)
- Modify Prisma
- Add routing libraries
- Introduce dashboard UI
- Add charts, KPIs, marketing UI
- Use localStorage or sessionStorage
- Call Core APIs (`/api/v1`)
- Rewrite Organizations component logic

---

## 3) Implementation Requirements

### 3.1 Header Component

**Requirements**:

- System-level only
- Fixed position
- Contains: System title ("Bassan Platform")
- Neutral minimal styling
- No marketing visuals
- No gradients
- No heavy shadows
- Light default

**Authority**: GATE_29_5_SHELL_STRATEGY.md Section 4.1

---

### 3.2 Navigation Rail Component

**Requirements**:

- Permanent left rail
- Collapsible (optional)
- Must NOT disappear entirely
- Simple vertical navigation: Organizations (active)
- No dashboard link
- No settings link
- No feature expansion

**Authority**: GATE_29_5_SHELL_STRATEGY.md Section 4.2

---

### 3.3 Workspace Container Component

**Requirements**:

- Framed surface
- Visually separated from background
- No decorative styling
- Preserve existing dense spacing
- Existing components rendered inside

**Authority**: GATE_29_5_SHELL_STRATEGY.md Section 4.3

---

## 4) Technical Constraints

**Stack Lock**:

- Vite + React only
- No new dependencies
- Inline styles OR minimal CSS only
- No CSS frameworks
- No design system
- No motion beyond orientation (150–250ms max, optional)

**Authority**: Gate 19 Tooling Allowlist, RFC 003

---

## 5) Allowed Write Paths

```
modules/platform-admin/client/src/**
modules/platform-admin/governance/GATE_31_*.md
```

---

## 6) Stop Conditions

**STOP IMMEDIATELY IF**:

- Organization components are rewritten (logic changes)
- `package.json` changes
- Any `/api/v1` usage appears
- Any localStorage/sessionStorage appears
- Any dashboard-like layout is introduced
- Multi-shell structure appears

---

## 7) Verification Requirements

**Commands to Execute**:

1. `git diff --name-only`
2. `git diff package.json`
3. `git diff package-lock.json`
4. `grep -R -n "/api/v1" modules/platform-admin/client/src`
5. `grep -R -n -E "localStorage|sessionStorage" modules/platform-admin/client/src`

**Structural Proof**:

- Show updated `App.tsx` structure
- Show Header + Rail + Workspace hierarchy
- Confirm Organizations components untouched (logic)

---

## 8) Acceptance Criteria

Gate 31 closes ONLY if:

- [x] Header implemented and immutable
- [x] Navigation Rail permanent
- [x] Workspace properly framed
- [x] Existing Organizations UI fully functional
- [x] No new dependencies
- [x] No drift introduced
- [x] All verification commands pass

---

## 9) Signature

**Planned By**: Platform Architecture Governance  
**Date**: 2026-02-11  
**Status**: CODE + EVIDENCE · FAIL-CLOSED  
**Authority**: Gate 29.5 System DNA, Gate 30 Root Drift
