# GATE 6A — AUTHORIZATION

## Platform Admin Module

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Gate Number    | 6A                                      |
| Gate Name      | Dev Runtime Enablement — CODE           |
| Status         | AUTHORIZED — EXECUTION PERMITTED        |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority                    |
| Effective Date | 2026-02-13                              |

---

## 1) Authorization Scope

This authorization permits **CODE execution** for Gate 6A strictly to implement:

- **Dev Runtime Enablement via explicit ENV gate**
- **Default OFF**
- Preserve **Fail-Closed** posture

No other objectives are authorized.

---

## 2) Allowed File List (HARD ALLOWLIST)

Only the following files may be modified/created during Gate 6A execution:

- `modules/platform-admin/index.ts`
- `modules/platform-admin/src/core-adapter/core.client.ts`
- `modules/platform-admin/tests/unit/core-adapter/core.client.spec.ts`
- `modules/platform-admin/governance/GATE_6A_DEV_RUNTIME_ENABLEMENT.md`
- `modules/platform-admin/governance/GATE_6A_EXECUTION_REPORT.md`
- `modules/platform-admin/governance/GATE_6A_VERIFICATION_EVIDENCE.md`
- `modules/platform-admin/governance/GATE_6A_AUTHORIZATION.md`

**Any diff outside this allowlist = IMMEDIATE STOP.**

---

## 3) Forbidden (HARD)

- Any dependency change: `package.json`, `package-lock.json`
- Any Prisma schema/migration changes
- Any new controllers/routes/endpoints
- Any guard weakening or bypass:
  - `DenyAllGuard` must remain `APP_GUARD`
  - `ExplicitAllowGuard` usage count must remain **EXACTLY 4**
- Any implicit auth wiring or unproven Core assumptions

---

## 4) Acceptance Criteria (PASS)

Gate 6A is considered PASS only if:

- Runtime does **not** start without explicit ENV flag (Default OFF)
- `DenyAllGuard` remains `APP_GUARD`
- `ExplicitAllowGuard` usages = **4**
- No dependency drift
- `npx tsc --noEmit` PASS
- `npm run test:platform-admin` PASS

---

## 5) Mandatory Verification Commands

```bash
git status --porcelain
git diff --name-only
git diff --stat
git diff package.json
git diff package-lock.json
npx tsc --noEmit
npm run test:platform-admin
```

## 6) Stop Conditions (FAIL-CLOSED)

Stop immediately if:

- Any forbidden file is touched
- Any file outside allowlist appears in diff
- Any test/tsc fails
- Any ambiguity requires edits outside allowlist

## 7) Rollback Strategy

Pre-Commit:

```bash
git restore --staged .
git restore .
```

Post-Commit:

```bash
git reset --hard stage6-patch-6.2
```

## 8) References (Binding)

- GATE_6A_DEV_RUNTIME_ENABLEMENT.md
- GATE_6A_EXECUTION_REPORT.md
- GATE_6A_VERIFICATION_EVIDENCE.md
- GATE_6_0_EVIDENCE_PROOF.md
- GATE_6_0_DOC_CORRECTIONS.md
