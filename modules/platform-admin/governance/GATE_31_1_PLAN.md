# Gate 31.1 — Plan

## Document Control

| Attribute      | Value                             |
| -------------- | --------------------------------- |
| Gate Number    | 31.1                              |
| Gate Name      | Client Dev Scaffold Authorization |
| Document Title | GATE_31_1_PLAN                    |
| Repo           | Suite (Layer / Product Repo)      |
| Module         | platform-admin                    |
| Status         | DOCS ONLY · FAIL-CLOSED           |
| Execution Mode | AUTHORIZATION · ALLOWLIST-ONLY    |
| Authority      | Platform Architecture Governance  |
| Date           | 2026-02-11                        |

---

## 1) Purpose

Authorize and lock the existence of client dev scaffold files:

- `modules/platform-admin/client/package.json`
- `modules/platform-admin/client/package-lock.json`

These files are **required for Vite runtime** and must be committed to the repository.

This gate provides **allowlist-only authorization** for the minimal client dependencies.

---

## 2) Scope

### 2.1 In Scope

**Files to Authorize**:

- `modules/platform-admin/client/package.json`
- `modules/platform-admin/client/package-lock.json`

**Verification**:

- Confirm dependencies match allowlist exactly
- Confirm no additional dependencies exist
- Confirm no other files changed

---

### 2.2 Out of Scope (FORBIDDEN)

**MUST NOT**:

- Modify any code files
- Modify any existing governance files (except creating Gate 31.1 files)
- Change package.json/package-lock.json content
- Add dependencies beyond allowlist
- Modify BFF, Prisma, or Core

---

## 3) Dependency Allowlist

**Allowed Dependencies** (production):

- `react` (^19.2.4)
- `react-dom` (^19.2.4)

**Allowed Dev Dependencies**:

- `@types/react` (^19.2.13)
- `@types/react-dom` (^19.2.3)
- `@vitejs/plugin-react` (^5.1.4)
- `typescript` (^5.9.3)
- `vite` (^7.3.1)

**Total**: 7 dependencies (2 production + 5 dev)

**Authority**: RFC 003 UI Tooling Allowlist

---

## 4) Stop Conditions

**STOP IMMEDIATELY IF**:

- Any extra dependency detected (beyond allowlist)
- Any other file changed (beyond Gate 31.1 governance files)
- package.json modified (content change)
- package-lock.json modified (content change)
- Any code files modified

---

## 5) Acceptance Criteria

Gate 31.1 closes ONLY if:

- [x] `npm ls --depth=0` matches allowlist exactly
- [x] No additional dependencies
- [x] `git diff --name-only` shows only Gate 31.1 governance files
- [x] package.json content matches allowlist
- [x] package-lock.json exists and is valid

---

## 6) Signature

**Planned By**: Platform Architecture Governance  
**Date**: 2026-02-11  
**Status**: DOCS ONLY · FAIL-CLOSED  
**Authority**: RFC 003 UI Tooling Allowlist
