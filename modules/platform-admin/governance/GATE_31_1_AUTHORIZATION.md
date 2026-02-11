# Gate 31.1 — Authorization

## Document Control

| Attribute      | Value                             |
| -------------- | --------------------------------- |
| Gate Number    | 31.1                              |
| Gate Name      | Client Dev Scaffold Authorization |
| Document Title | GATE_31_1_AUTHORIZATION           |
| Repo           | Suite (Layer / Product Repo)      |
| Module         | platform-admin                    |
| Status         | BINDING · FAIL-CLOSED             |
| Execution Mode | AUTHORIZATION · ALLOWLIST-ONLY    |
| Authority      | Platform Architecture Governance  |
| Date           | 2026-02-11                        |

---

## 1) Allowed Paths (WRITE)

Agent MAY create:

```
modules/platform-admin/governance/GATE_31_1_PLAN.md (NEW)
modules/platform-admin/governance/GATE_31_1_AUTHORIZATION.md (NEW)
modules/platform-admin/governance/GATE_31_1_EXECUTION_REPORT.md (NEW)
modules/platform-admin/governance/GATE_31_1_VERIFICATION_EVIDENCE.md (NEW)
```

**No other files may be created or modified.**

---

## 2) Allowed Artifacts (EXPLICITLY PERMITTED FOR COMMIT)

The following files are **authorized to exist** and **permitted for commit**:

```
modules/platform-admin/client/package.json
modules/platform-admin/client/package-lock.json
```

**Rationale**: These files are required for Vite runtime and client dev scaffold.

**Constraint**: Content must match allowlist exactly (see Section 4).

---

## 3) Forbidden Paths (ABSOLUTE)

Agent MUST NOT modify:

```
modules/platform-admin/client/package.json (CONTENT CHANGE FORBIDDEN)
modules/platform-admin/client/package-lock.json (CONTENT CHANGE FORBIDDEN)
modules/platform-admin/client/src/** (ALL FILES)
modules/platform-admin/client/vite.config.ts (ALREADY MODIFIED IN GATE 31)
modules/platform-admin/src/** (BFF)
modules/platform-admin/prisma/**
modules/platform-admin/tests/**
```

**Any modification = STOP.**

---

## 4) Dependency Allowlist (BINDING)

**Allowed Dependencies** (production):

1. `react` (^19.2.4)
2. `react-dom` (^19.2.4)

**Allowed Dev Dependencies**:

3. `@types/react` (^19.2.13)
4. `@types/react-dom` (^19.2.3)
5. `@vitejs/plugin-react` (^5.1.4)
6. `typescript` (^5.9.3)
7. `vite` (^7.3.1)

**Total**: 7 dependencies

**Any additional dependency = STOP.**

---

## 5) Forbidden Actions

Agent MUST NOT:

- Add dependencies beyond allowlist
- Modify package.json content
- Modify package-lock.json content
- Modify any code files
- Modify any existing governance files
- Install new packages
- Upgrade/downgrade versions

---

## 6) Enforcement Model

### 6.1 Authorization Mode

Agent is **authorizing existing artifacts**, NOT creating or modifying them.

This is a **docs-only gate** to legalize the dev scaffold.

---

### 6.2 Verification Model

**MUST verify**:

- `npm ls --depth=0` matches allowlist exactly
- No additional dependencies
- `git diff --name-only` shows only Gate 31.1 governance files
- package.json content matches allowlist

---

## 7) STOP Conditions

**STOP IMMEDIATELY IF**:

- Any extra dependency detected
- Any file modified (beyond Gate 31.1 governance files)
- package.json content changed
- package-lock.json content changed
- Any code files modified

**Document and halt. Do NOT proceed.**

---

## 8) Acceptance Criteria

This authorization is considered BINDING when ALL of the following are true:

- [x] Allowed paths explicit (write)
- [x] Allowed artifacts explicit (commit)
- [x] Forbidden paths explicit
- [x] Forbidden actions explicit
- [x] Dependency allowlist explicit
- [x] Enforcement model defined
- [x] STOP conditions explicit

---

## 9) Signature

**Authorized By**: Platform Architecture Governance  
**Date**: 2026-02-11  
**Status**: BINDING · FAIL-CLOSED  
**Authority**: RFC 003 UI Tooling Allowlist
