# Gate 6B — Execution Plan

## 1) Objective

Wire **Auth Context** (JWT → `request.user`) using fail-closed guards to enable identity-aware runtime execution without exposing internal structures.

## 2) Scope (Strict)

- **Phase 1 (Docs-Only)**: Planning, Risk Assessment, Authorization (CURRENT).
- **Phase 2 (Code Execution)**: Implementation of `JwtStrategy`, `AuthModule` wiring.
  - **BLOCKED**: Requires dependency resolution (see Section 4).

## 3) Claims Source of Truth (Core Contract v1)

- **Proven Claims**:
  - `sub` (User ID)
  - `email` (User Email)
  - `organizationId` (Tenant Context) — Validated via `INTEGRATION_CONTRACT_CORE.md`.
- **Forbidden/Unproven Claims**:
  - `roles`: NOT present in Core Contract v1 JWT Extract.
  - `permissions`: NOT present in Core Contract v1 JWT Extract.

## 4) Dependency Blockers (CRITICAL)

- **Status**: **FAILED**.
- **Missing**: `passport`, `@nestjs/passport`, `passport-jwt`.
- **Constraint**: Gate 6A/6B allows "No new dependencies".
- **Resolution**: Execution Phase (Phase 2) is **strict-blocked** until a dependency-enablement gate is executed.

## 5) Execution Steps

1.  **Docs-Only (Phase 1)**:
    - Define requirements.
    - Identify blockers (Done).
    - Authorize Plan.
2.  **Code Execution (Phase 2)** — **CURRENTLY BLOCKED**:
    - _Requires_: `npm install @nestjs/passport passport passport-jwt`.
    - Implement `JwtStrategy`.
    - Wire `AuthModule`.
    - Verify via `npm test`.

## 6) Verification Plan (Docs Phase)

- `git status --porcelain` (Clean).
- `git diff --name-only` (Allowlist only).
