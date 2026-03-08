# 10_FINAL_VERDICT.md — Gate 5

**Date**: 2026-03-08

## Verdict: ✅ APPROVE WITH CONDITIONS

---

## Scorecard

| Objective                                                  | Result |
| ---------------------------------------------------------- | ------ |
| admin-key-2 mismatch proven                                | ✅     |
| Rotate to admin-key-3 (fresh keypair)                      | ✅     |
| JWKS server publishes admin-key-3                          | ✅     |
| JWKS contains no private fields                            | ✅     |
| Suite Railway secrets set (PEM_B64 + KID)                  | ✅     |
| Local PEM files deleted after key set                      | ✅     |
| Session.guard.ts mints RS256 JWT on write routes           | ✅     |
| Read routes: no JWT minted                                 | ✅     |
| JWT payload satisfies Core (type=s2s, sub, iat, exp≤300)   | ✅     |
| JWT reaches Core (Core returns 400 not 401)                | ✅     |
| UnauthorizedException replaces generic Error in CoreClient | ✅     |
| No JWT exposed to browser                                  | ✅     |
| Fail-closed: missing signing vars → 401 JSON               | ✅     |
| tsc exit 0                                                 | ✅     |
| 3-file scope lock respected                                | ✅     |
| No dependencies added                                      | ✅     |
| No git-committed PEM                                       | ✅     |

## Condition (Blocking Full E2E)

⚠️ **Pre-existing payload contract gap**: Core `CreateOrganizationDto` requires `adminEmail, adminPassword, adminFirstName, adminLastName`, but Suite sends only `{ name }`. This causes Core 400 (not a JWT/auth failure). This is a data model alignment issue that pre-dates Gate 5.

**Required follow-up gate**: Extend Suite `organization.dto.ts` + `core.client.ts` + `organization.service.ts` to forward the full Core-required payload.

## System Invariants (post Gate 5)

1. **JWT**: Short-lived RS256 (TTL 300s), kid=admin-key-3, type=s2s — minted per write request
2. **Signing key**: PLATFORM_ADMIN_JWT_PRIVATE_KEY_PEM_B64 in Railway `web` only
3. **JWKS**: admin-key-3 published, admin-key-2 retired
4. **Read routes**: No JWT minted — read-only screens unaffected
5. **Browser**: No JWT ever returned to client
