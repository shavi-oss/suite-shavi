# Next Stage Preview — platform-admin

## Next Logical Gate

**Gate:** Gate 2 — Implementation Complete

**Why it comes next:** The module gates checklist defines Gate 2 as the immediate successor to Gate 1 (Implementation Authorization). Gate 2 criteria are conditioned on Gate 1 passing first.

## Preconditions Before Gate 2 Can Start

**Must already be true before Gate 2 work begins:**

- Gate 1 must be passed (Implementation Authorization complete).
- Implementation must remain within the locked scope (UI screens, BFF endpoints, and DB tables listed in `MODULE_SCOPE_LOCK.md`).
- Database tables listed in `MODULE_DATA_OWNERSHIP.md` must be created and owned by platform-admin.
- Core org validation must be implemented using the **only** allowed Core endpoint (`GET /api/v1/organizations/:id`).
- RBAC enforcement, audit logging, input validation, correlation ID propagation, JWT forwarding, and fail-closed behavior must be implemented for all endpoints.
- No scope creep: only features in `MODULE_SCOPE_LOCK.md` are permitted.
- Explicit deferrals remain in effect (template publishing and service-to-service auth are not available in Core v1).
