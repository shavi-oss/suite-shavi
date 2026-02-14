# Gate 18 — Execution Rules

## 1. Interaction Rules

The Platform Admin UI is a **client** of the Platform Admin Module (BFF).

| Source           | Target                 | Rule                                   |
| :--------------- | :--------------------- | :------------------------------------- |
| **UI Component** | **Platform Admin API** | **ALLOWED** (Strictly Typed)           |
| **UI Component** | **Core API**           | **FORBIDDEN** (Architecture Violation) |
| **UI Component** | **Direct DB Access**   | **FORBIDDEN** (Security Violation)     |

## 2. Implementation Rules

1.  **Fail-Closed**: If an API call fails or permission is missing, the UI must strictly deny access/visibility.
2.  **Zero-Trust**: Do not trust client-side validation. All actions must be validated by the BFF.
3.  **Scope-Bound**: Only implement components listed in `GATE_18_AUTHORIZATION.md`.

## 3. Deferred Components

- **Dashboard**: Do not create placeholders.
- **Settings**: Do not create placeholders.

## 4. Code Generation

- **NO** code generation is permitted in this Gate (Gate 18).
- Code generation is **ONLY** permitted in a designated Implementation Gate.
