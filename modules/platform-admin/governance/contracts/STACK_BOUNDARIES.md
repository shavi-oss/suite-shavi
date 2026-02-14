# Stack Boundaries — platform-admin

## Document Control

| Attribute | Value                                   |
| --------- | --------------------------------------- |
| Status    | FINAL — GATE 2 (Clarification)          |
| Mode      | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Date      | 2026-02-06                              |

---

## 1) Layer Communication Rules

### Allowed

✅ **UI → BFF** — UI calls Suite BFF endpoints  
✅ **BFF → Core** — BFF calls Core API with user JWT  
✅ **BFF → Suite DB** — BFF reads/writes Suite database

### Forbidden

❌ **UI → Core** — UI MUST NOT call Core directly  
❌ **UI → JWT** — UI MUST NOT decode/validate JWT  
❌ **UI → Secrets** — UI MUST NOT access secrets/keys  
❌ **BFF → BFF** — No cross-BFF calls (single BFF module)

---

## 2) JWT Handling

**UI Layer**:

- Receives JWT from auth flow (opaque token)
- Stores JWT in secure storage
- Includes JWT in `Authorization` header to BFF
- ❌ MUST NOT decode JWT
- ❌ MUST NOT validate JWT signature

**BFF Layer**:

- Receives JWT from UI
- Validates JWT signature locally
- Extracts claims for logging/tracing
- Forwards JWT to Core (as-is)
- ❌ MUST NOT issue JWTs
- ❌ MUST NOT modify JWTs

**Core Layer**:

- Issues JWTs (login endpoint)
- Validates JWTs (all protected endpoints)
- Extracts tenant context from JWT claims

**Evidence**: CORE_V1_INTEGRATION_LOCK.md § 3.2, Line 70-90

---

## 3) Secret Handling

**UI Layer**:

- ❌ MUST NOT access any secrets
- ❌ MUST NOT access JWT signing keys
- ❌ MUST NOT access database credentials

**BFF Layer**:

- Accesses JWT public key for validation
- Accesses Suite DB credentials
- ❌ MUST NOT access Core DB credentials
- ❌ MUST NOT access JWT private key (Core-owned)

**Core Layer**:

- Owns JWT signing keys (private + public)
- Owns Core DB credentials

---

## 4) Data Flow

**User Request Flow**:

```
UI → BFF → Core
UI ← BFF ← Core
```

**JWT Flow**:

```
Core issues JWT → UI stores JWT → UI sends JWT to BFF → BFF forwards JWT to Core
```

**Tenant Context Flow**:

```
Core issues JWT with organizationId claim → BFF extracts claim → BFF forwards JWT to Core → Core validates tenant context
```

---

## What Was Explicitly Deferred by Gate 2

- **JWT Issuance by BFF** — Core issues JWTs, BFF only validates/forwards (see [GATE_2_DECISIONS_AND_DEFERRED.md](./GATE_2_DECISIONS_AND_DEFERRED.md))
- **Service-to-Service Authentication** — Core v1 has no service token contract (see [GATE_2_DECISIONS_AND_DEFERRED.md](./GATE_2_DECISIONS_AND_DEFERRED.md))
- **Token Refresh Logic** — Core v1 has no refresh endpoint (see [GATE_2_DECISIONS_AND_DEFERRED.md](./GATE_2_DECISIONS_AND_DEFERRED.md))

---

**END OF BOUNDARIES**
