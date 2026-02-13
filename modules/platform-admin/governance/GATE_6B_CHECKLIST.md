# Gate 6B — Execution Checklist
No modification to index.ts (Gate 6A frozen)

No modification to DenyAllGuard wiring

- [x] **Pre-Flight (Docs Phase)**
  - [x] `git status --porcelain` is clean.
  - [x] `git diff --name-only` is allowed list.
  - [x] **BLOCKER IDENTIFIED**: Missing `passport`, `passport-jwt`.

- [ ] **Phase 1: Documentation Integrity**
  - [ ] `GATE_6B_PLAN.md` explicitly blocks execution.
  - [ ] `GATE_6B_AUTHORIZATION.md` distinguishes Phase 1 vs 2.
  - [ ] No code files modified.
  - [ ] No dependency files modified.

- [ ] **Phase 2: Code Execution (HOLD)**
  - [ ] **PREREQUISITE**: Dependency Installation Gate (e.g., Gate 6A.1).
  - [ ] `package.json` must contain `passport-jwt`.
  - [ ] Implement `JwtStrategy`.
  - [ ] `npm test` PASS.

- [ ] **Drift Traps (Source: Drift Log 54A)**
  - [ ] Check for unauthorized controllers (Count frozen at 6).
  - [ ] Check for unauthorized `ExplicitAllow` usages (Count frozen at 4).
