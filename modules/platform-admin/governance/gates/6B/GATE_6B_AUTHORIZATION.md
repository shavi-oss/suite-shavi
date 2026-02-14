# Gate 6B — Authorization

## Platform Admin Module

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Gate Number    | 6B                                      |
| Gate Name      | Auth Context Wiring                     |
| Status         | **PHASE 1 AUTHORIZED — DOCS ONLY**      |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority                    |
| Effective Date | 2026-02-13                              |

---

## 1) Authorization Scope

### Phase 1: Documentation & Planning (AUTHORIZED)

- Creation/Modification of Governance Artifacts ONLY.
- **NO/NO**: Code, Tests, Dependencies.

### Phase 2: Code Execution (BLOCKED)

- **Status**: **UNAUTHORIZED / HOLD**.
- **Reason**: Missing required dependencies (`passport`, `passport-jwt`) and "No New Deps" constraint.
- **Prerequisite**: A separate gate must authorize dependency installation.

---

## 2) Allowed File List (HARD ALLOWLIST — PHASE 1)

Only the following files may be modified during Phase 1:

- `modules/platform-admin/governance/GATE_6B_PLAN.md`
- `modules/platform-admin/governance/GATE_6B_AUTHORIZATION.md`
- `modules/platform-admin/governance/GATE_6B_CHECKLIST.md`
- `modules/platform-admin/governance/GATE_6B_RISK_LOG.md`
- `modules/platform-admin/governance/GATE_6B_VERIFICATION_COMMANDS.md`

**Any diff outside this allowlist = IMMEDIATE STOP.**

---

## 3) Forbidden (HARD)

- **Code Changes**: Any TS/JS file modification.
- **Dependency Changes**: `package.json`, `package-lock.json`.
- **Prisma Changes**: Schema or migrations.
- **Unproven Claims**: Attempting to map `roles` (Not proven in Core v1).
index.ts

guards/**
security/**
controllers/**
platform-admin.module.ts
package.json
package-lock.json
prisma/**
core-adapter/**
---

## 4) Acceptance Criteria (PHASE 1)

Phase 1 is considered PASS only if:

- Governance docs accurately reflect the dependency blocker.
- No code has been modified.
- `git status` is clean.
- `git diff` shows only the 5 allowlisted files.

---

## 5) Mandatory Verification Commands (PHASE 1)

```bash
git status --porcelain
git diff --name-only
```

---

## 6) Stop Conditions (FAIL-CLOSED)

Stop immediately if:

- Any code file is touched.
- `package.json` is modified.
- Any verification command returns unexpected output.

---

## 7) Rollback Strategy

```bash
git restore --staged .
git restore modules/platform-admin/governance/
```
