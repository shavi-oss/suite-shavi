# RFC 001 — UI Stack Selection

## 1. Status & Scope

**Status**: ⏸️ **DEFERRED (BINDING)**
**Scope**: Docs-Only · platform-admin module
**Authority**: Governance Authority
**Date**: 2026-02-09

## 2. Decision Context

Gate 19 execution was HALTED due to the absence of an explicit governance mandate for a frontend framework in the repository's architectural laws.
Under **FAIL-CLOSED** governance principles as defined in `ARCHITECTURAL_LAWS.md` and `EXECUTION_AUTHORITY.md`, the executor is prohibited from selecting a technology stack without a pre-existing, binding architectural decision.
This document formally records the deferral of this decision to ensure compliance with `REPO_GOVERNANCE.md`.

## 3. Binding Constraints

The following constraints are **IMMUTABLE** and strictly enforced:

1.  **Core Black Box**: No modification or dependency on Core internal implementation is permitted,as defined in `CORE_CONTRACT_V1_LOCK_DECLARATION.md` and `CORE_V1_INTEGRATION_LOCK.md`.
2.  **Scope Lock**: No features outside of `MODULE_SCOPE_LOCK.md` may be implemented.
3.  **No Direct Core Access**: UI MUST NEVER call Core APIs directly, per `ARCHITECTURAL_LAWS.md` and `SECURITY_STOP_CONDITIONS.md`.
4.  **Deferred Components**: Dashboard and Settings are EXPLICITLY DEFERRED and unauthorized, per `MODULE_SCOPE_LOCK.md`.

## 4. Decision

**UI stack selection is DEFERRED.**

No frontend framework is authorized for installation or use at this time. All UI code creation remains prohibited.

## 5. Consequences

### Blocked Actions

- Gate 19 remains in a **STOP** state.
- Installation of any frontend dependencies via `npm` or other package managers is **FORBIDDEN**.
- Creation of any `.tsx`, `.jsx`, `.vue`, or `.ts` files for UI purposes is **FORBIDDEN**.

### Unchanged State

- The repository remains in a "Docs-Only" state for the UI layer.
- Backend-for-Frontend (BFF) development may proceed only within authorized scopes (Gate 16-18).

## 6. STOP CONDITIONS (BINDING)

Execution MUST STOP IMMEDIATELY if any of the following occurs:

1.  **npm install**: Any modification to `package.json` or `node_modules`.
2.  **UI Code Creation**: Any creation of UI source files.
3.  **UI → Core Access**: Any attempt to bridge UI directly to Core.
4.  **Core Tokens in UI**: Any exposure of Core JWTs to the client side.
5.  **Dashboard/Settings Artifacts**: Any creation of files related to unauthorized components.

## 7. Governance Outcome

Gate 19 remains **STOP**.
Unblocking Gate 19 requires a new, separate RFC that explicitly authorizes a specific technology stack, approved by the Governance Authority.
Until such authorization is granted, the UI layer remains strictly **DEFERRED**.
