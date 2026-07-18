# Workspace Consumer Contract — Bassan Workspace (وجهة العميل)

> Layer: **Bassan Workspace** (customer-facing product UI). This document is the contract the Workspace
> codebase MUST consume. The Workspace repo is not built yet; this is the SSOT placeholder so the Workspace
> team starts from the locked boundary. Authored 2026-07-18 by Hermes Agent.

## Golden rule (Contract B §3.1)
**The Workspace calls ONLY `https://<suite-host>/api/customer/v1/*`.**
It MUST NOT call Bassan Kernel directly. It MUST NOT hold or see any Kernel token.
It MUST NOT call Suite operator endpoints (`/api/v1/organizations`, `/api/v2/admin/*`).

## Base URL
```
<SUITE_BASE_URL>/api/customer/v1
```

## Authentication
1. `POST /api/customer/v1/auth/session` with `{ email, password }`.
2. Response: `{ accessToken, tokenType: "Bearer", expiresIn }` — this is the **Suite Session JWT**.
3. Send it as `Authorization: Bearer <accessToken>` on every subsequent request.
4. `POST /api/customer/v1/auth/refresh` to rotate before expiry.
5. `POST /api/customer/v1/auth/logout` to invalidate.

## Authorized endpoints (v1)
| Method | Endpoint | Purpose |
| ------ | -------- | ------- |
| POST | `/auth/session` | Login → Session JWT |
| POST | `/auth/refresh` | Rotate Session JWT |
| POST | `/auth/logout` | Invalidate session |
| GET | `/me` | Current user + org context |
| GET | `/crm/contacts` | List contacts (your org only) |
| POST | `/crm/contacts` | Create contact |

## Tenant isolation
You will **only ever see data for your own organization**. The `organizationId` is assigned by the Suite
from the Session JWT; do NOT attempt to send `X-Organization-Id` / `X-Tenant-Id` headers — they are ignored
by the Suite (fail-closed).

## Not yet available (TBD)
`/erp/*`, `/helpdesk/*`, `/automation/*`, `/ai/*`, `/dashboards/*`, `/apps/*`, `/settings/*` are not
implemented. They will be defined in the Screen Responsibility Matrix (SSOT) before the Workspace builds them.

## Security non-negotiables (Stop Rules, Contract B §10)
- Never call Kernel directly.
- Never log or store the Session JWT in a way that leaks it.
- Treat 401/403 as "go to login" — do NOT retry in a loop that leaks tokens.

## Source of Truth
- Canonical: `suite-shavi/INTEGRATION_CONTRACT_WORKSPACE.md` (Contract B, v1 APPROVED).
- Companion: `suite-shavi/INTEGRATION_CONTRACT_CORE.md` (Contract A, v2 APPROVED).
- Suite implementation: `modules/platform-admin/src/customer/README.md`.
