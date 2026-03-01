# 06 — STOP CONDITIONS AND FAIL-CLOSED VERIFICATION

This section formally inspects the required invariants that cause automatic blocking if violated.

| Invariant / Stop Condition               | Verification Result | Evidence                                                                                                                                                                                       | Status             |
| ---------------------------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| **No UI calls Core directly**            | ✅ PASS             | Vite Client uses `proxy: { '/api/platform-admin' : ... }`. No Core API URLs exist in Client code.                                                                                              | Strict Compliance. |
| **JWT never exposed to browser context** | ✅ PASS             | `SessionGuard` resolves `req.cookies.sessionId`, uses it to look up the `userId` via `SessionService`, and then pulls `coreJwt` dynamically from `JwtStorageService` in memory on the backend. | Strict Compliance. |
| **Explicit Routing Lockdown**            | ✅ PASS             | Global `APP_GUARD` is mapped to `DenyAllGuard`. All controllers use exact allowlists (`ExplicitAllowGuard` or `SessionGuard`).                                                                 | Strict Compliance. |
| **Audit Logs fail-closed**               | ✅ PASS             | Both Core and Suite Prisma `$transaction` scopes encapsulate audit log generation alongside state updates. If audit logging fails, state changes revert.                                       | Strict Compliance. |
| **CORS Wildcard ban**                    | ✅ PASS             | Production limits exactly to 1 known origin via env vars.                                                                                                                                      | Strict Compliance. |
| **Secret Exfiltration check**            | ✅ PASS             | JWKS server exposes _only_ the Base64 representation of the JSON array, with no `.env` leak capabilities.                                                                                      | Strict Compliance. |

**Verdict:** The codebase survives all rigid stop conditions and exhibits strong fail-closed mechanics perfectly aligned with the architecture specs.
