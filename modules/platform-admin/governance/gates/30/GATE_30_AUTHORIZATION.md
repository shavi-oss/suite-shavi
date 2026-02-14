# Gate 30 — Authorization

## Document Control

| Attribute      | Value                            |
| -------------- | -------------------------------- |
| Gate Number    | 30                               |
| Gate Name      | System DNA Compliance Audit      |
| Document Title | GATE_30_AUTHORIZATION            |
| Repo           | Suite (Layer / Product Repo)     |
| Module         | platform-admin                   |
| Status         | BINDING · FAIL-CLOSED            |
| Execution Mode | GOVERNANCE AUDIT ONLY · NO CODE  |
| Authority      | Platform Architecture Governance |
| Date           | 2026-02-11                       |

---

## 1) Allowed Paths (READ ONLY)

Agent MAY read:

```
modules/platform-admin/client/src/**
modules/platform-admin/governance/**
```

**Purpose**: Audit compliance only.

---

## 2) Allowed Paths (WRITE)

Agent MAY create/modify ONLY:

```
modules/platform-admin/governance/GATE_30_PLAN.md
modules/platform-admin/governance/GATE_30_AUTHORIZATION.md
modules/platform-admin/governance/GATE_30_EXECUTION_REPORT.md
modules/platform-admin/governance/GATE_30_DNA_COMPLIANCE_AUDIT.md
```

**No other files may be created or modified.**

---

## 3) Forbidden Paths (ABSOLUTE)

Agent MUST NOT modify:

```
modules/platform-admin/client/**
modules/platform-admin/src/**
modules/platform-admin/package.json
modules/platform-admin/package-lock.json
modules/platform-admin/prisma/**
modules/platform-admin/tests/**
```

**Any modification = STOP.**

---

## 4) Forbidden Actions

Agent MUST NOT:

- Add dependencies
- Modify client code
- Refactor UI
- Suggest improvements
- Redesign anything
- Introduce new features
- Fix drift
- Optimize code
- Touch Core (Bassan.os)

---

## 5) Enforcement Model

### 5.1 Audit Only

Agent is a **Governance Compliance Auditor**.

Agent is NOT:

- A designer
- A refactor engineer
- An optimizer
- A feature developer

---

### 5.2 Documentation Only

All output MUST be documentation.

No executable artifacts.

No UI components.

No code changes.

---

## 6) STOP Conditions

**STOP IMMEDIATELY IF**:

- Code modification attempted
- UI changes proposed
- Dependencies added
- Multi-shell detected
- Dashboard-first layout found
- Density mixing detected
- Scope violation occurs

**Document and halt. Do NOT proceed.**

---

## 7) Acceptance Criteria

This authorization is considered BINDING when ALL of the following are true:

- [x] Allowed paths explicit (read-only)
- [x] Allowed paths explicit (write-only governance)
- [x] Forbidden paths explicit
- [x] Forbidden actions explicit
- [x] Enforcement model defined
- [x] STOP conditions explicit

---

## 8) Signature

**Authorized By**: Platform Architecture Governance  
**Date**: 2026-02-11  
**Status**: BINDING · FAIL-CLOSED  
**Authority**: Gate 29.5 System DNA
