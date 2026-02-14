# REVIEW CHECKLIST (OWNER-ONLY)

> [!WARNING]
> **ENFORCEMENT**: This checklist is for **OWNER USE ONLY**.
> Do not share strict rejection criteria with external developers to prevent gaming the system.

## 1. Scope Integrity Scan (Blocker)

- [ ] **Unauthorized Files**: Did the dev touch `package.json`, lockfiles, or config?
  - _If YES_ → **CLOSE IMMEDIATE**.
- [ ] **Scope Creep**: Did the dev include "refactoring" or "cleanup" not in Task Contract?
  - _If YES_ → **REJECT**.
- [ ] **Core Violation**: Did the dev assume Core v1 behavior not in `CORE_CONTRACT_V1_EXTRACT.md`?
  - _If YES_ → **REJECT**.

## 2. Governance Alignment

- [ ] **Task Contract**: Does PR match Task Contract exactly?
- [ ] **Tone**: Is the code devoid of "opinionated" comments or deviations?
- [ ] **Dependencies**: No new packages added.

## 3. Quality & Security

- [ ] **Tests**: Do tests prove the specific change (and nothing else)?
- [ ] **Fail-Closed**: Does the code handle errors by failing safely?
- [ ] **Sensitivity**: No leaked PII or internal architecture details in naming/comments.

## 4. Decision

- [ ] **APPROVE**: Strict compliance verified.
- [ ] **REQUEST CHANGES**: Specific violations identified.
- [ ] **CLOSE**: Fundamental breach of Task Contract.
