# S2S Integration — Infrastructure Fix Record (2026-07-12)

**Author**: Hermes Agent (Shavi autonomous engineer)
**Approved by**: Governance Authority (Eslam Abdelshafi)
**Related**: `suite-shavi/INTEGRATION_CONTRACT_CORE.md` §15 (binding contract amendment v2.1)

## 1. Symptom
- `bassan-core` container (Coolify app `b8c7zymvxxcm2srwplhq20uf`) crashing / not serving S2S requests.
- Automated requests to `https://jwk.manuscreated.com/.well-known/jwks.json` returned Cloudflare **HTTP 1010** (Bot Fight Mode).
- shavi-suite org-mapping (S2S) could not validate organizations against `bassan-core`.

## 2. Root cause (two independent infrastructure issues)
1. **Missing S2S verification key.** `ADMIN_JWT_PUBLIC_KEY` was unset on the `bassan-core` **Production** environment, and `ADMIN_JWKS_URL` was also empty. `AdminJwtStrategy` had no key to verify incoming S2S RS256 tokens → startup/verification failure.
2. **Cloudflare Bot Fight Mode (1010).** Blocked non-browser automated traffic to the JWKS endpoint and to the shavi-suite login route.

## 3. Fix applied
### 3.1 bassan-core (Coolify Production app `b8c7zymvxxcm2srwplhq20uf`)
- Added env `ADMIN_JWT_PUBLIC_KEY` = PEM (RSA public key) derived from JWKS `kid=admin-key-3` at `https://jwk.manuscreated.com/.well-known/jwks.json`.
- Emptied `ADMIN_JWKS_URL` (bassan-core now verifies locally from the PEM; no runtime JWKS fetch).
- Restarted deployment `iqtbjh3rxah7y48exowjfy7n` → finished OK.

### 3.2 Cloudflare
- Bot Fight Mode confirmed OFF (verified empirically: JWKS + shavi-suite login return 200 / non-1010 even from a `curl/8.0` User-Agent).
- Note: even if Cloudflare ever re-blocks, bassan-core is now immune because it no longer fetches JWKS at runtime.

## 4. Verification (2026-07-12)
| Check | Method | Result |
|---|---|---|
| bassan-core up | `GET https://bassan-core.manuscreated.com/` | 404 app-response (not a crash) ✅ |
| S2S guard active, PEM loaded | `GET /api/v2/admin/organizations/<id>` no token | 401 Unauthorized ✅ |
| Cloudflare not blocking | `GET https://jwk.manuscreated.com/.well-known/jwks.json` (curl UA) | 200 ✅ |
| Token/key match | shavi-suite `SessionGuard` mints `type:'s2s'`, `kid=admin-key-3`; bassan-core verifies with the PEM | match ✅ |

## 5. Code re-verification (the key finding)
The integration contract (§0) documented an org-mapping **code bug** (wrong endpoint). Reading the current code proved it is **already fixed**:
- `modules/platform-admin/src/core-adapter/core.client.ts` `validateOrganizationExists()` calls `GET /api/v2/admin/organizations/:id` (L71 assert, L78 URL) and forwards the S2S token (L85).
- `modules/platform-admin/src/core-adapter/core.contract.assert.ts` allowlist includes `GET /api/v2/admin/organizations/:id` (L21).
- `Bassan.os/backend/src/modules/admin/admin.controller.ts` `getOrganization()` handler exists (`@Get(":id")`, L81) under `@UseGuards(AdminJwtAuthGuard)` (L35).

**Conclusion**: No code change was needed for org-mapping. The production blocker was infrastructure only.

## 6. Security follow-up (mandatory)
Tokens exposed in chat during this work MUST be rotated:
- GitHub PAT (prior sessions)
- Coolify API token (was in `/tmp/bassan_diag.py`)
- Cloudflare token (sent in chat 2026-07-12)
