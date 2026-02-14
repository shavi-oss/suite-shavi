# TASK CONTRACT [ID] — [TITLE]

> [!IMPORTANT]
> **BINDING AGREEMENT**: This document defines the **EXACT SCOPE** of work.
> Any deviation, "improvement," or out-of-scope change will result in **IMMEDIATE REJECTION**.

## 1. Objective

[Concise description of the single authorized goal.]

## 2. Authorized Scope (Whitelist)

**You are authorized to modify ONLY:**

- [ ] `path/to/specific/file.ts`
- [ ] `path/to/specific/test.spec.ts`

**You are FORBIDDEN from touching:**

- 🚫 `package.json` / `package-lock.json`
- 🚫 Infrastructure / CI configs
- 🚫 Core Architecture
- 🚫 Any file not explicitly listed above

## 3. Technical Constraints (Rigid)

- **Mode**: [e.g., Strict Implementation / Bug Fix]
- **Core Contract:** Must adhere to `CORE_CONTRACT_V1_EXTRACT.md`.
- **Dependencies:** NO new npm packages allowed.
- **Style:** Must match existing `REPO_GOVERNANCE.md`.

## 4. Deliverables

1. [ ] Code changes strictly within scope.
2. [ ] Unit tests (if applicable) for the specific change.
3. [ ] Evidence of local verification.

## 5. Acceptance Criteria (Fail-Closed)

- [ ] `npm run build` passes.
- [ ] `npm run test` passes.
- [ ] Linting passes.
- [ ] **Exact match** to authorized scope.

---

**Developer Signature:** ********\_\_\_\_********
**Date:** ********\_\_\_\_********
