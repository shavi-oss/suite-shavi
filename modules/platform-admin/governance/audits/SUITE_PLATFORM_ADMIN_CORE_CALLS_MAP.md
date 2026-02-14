# SUITE PLATFORM-ADMIN — CORE CALLS MAP

**Audit Date**: 2026-02-06  
**Audit Type**: Core Integration Compliance Audit  
**Scope**: ALL Core API calls from platform-admin module

---

## Executive Summary

**Total Core Calls Found**: 1  
**Allowed Calls**: 1  
**Forbidden Calls**: 0  
**Verdict**: ✅ PASS

---

## Core Call Inventory

### Call #1: Validate Organization Exists

| Property                  | Value                                                                             |
| ------------------------- | --------------------------------------------------------------------------------- |
| **Source File**           | `src/core-adapter/core.client.ts`                                                 |
| **Function**              | `CoreClient.validateOrganizationExists()`                                         |
| **Line Range**            | Lines 62-156                                                                      |
| **Endpoint**              | `GET /api/v1/organizations/:id`                                                   |
| **Full URL Construction** | Line 71: `` `${this.coreBaseUrl}/api/v1/organizations/${coreOrgId}` ``            |
| **HTTP Method**           | `GET` (Line 76)                                                                   |
| **Auth Method**           | User-scoped JWT forwarding                                                        |
| **Auth Header**           | Line 78: `'Authorization': 'Bearer ${coreJwt}'`                                   |
| **Additional Headers**    | `X-Correlation-Id` (Line 79), `Content-Type: application/json` (Line 80)          |
| **Timeout**               | 10 seconds (Line 82: `AbortSignal.timeout(10000)`)                                |
| **Contract Assertion**    | Line 69: `assertCoreEndpointAllowed('GET', '/api/v1/organizations/${coreOrgId}')` |
| **Allowed/Forbidden**     | ✅ **ALLOWED**                                                                    |

---

## Allowed Endpoint Evidence

**Canonical Source**: `governance/core-contract/CORE_CONTRACT_V1_EXTRACT.md`

**Section**: B.8 — Organizations Module (`/api/v1/organizations`)

**Line Reference**: Line 182

**Exact Match**:

```
| `/api/v1/organizations/:id` | GET | - | `id` (string) | [L25-L28](...) |
```

**Verdict**: Endpoint is explicitly listed in Core Contract v1 Extract (42 total endpoints, this is one of them).

---

## Auth Method Verification

### User-Scoped JWT Forwarding

**Evidence**: `src/core-adapter/core.client.ts` Line 78

```typescript
'Authorization': `Bearer ${coreJwt}`
```

**Parameter Source**: `coreJwt` parameter passed from caller (Line 64)

**Caller Chain**:

1. `OrgMappingService.create()` → Line 73 calls `coreClient.validateOrganizationExists(dto.coreOrgId, coreJwt, correlationId)`
2. `OrgMappingController.create()` → Extracts JWT from request header (Line 44-46)

**JWT Extraction** (`src/org-mapping/org-mapping.controller.ts` Lines 44-46):

```typescript
const authHeader = req.headers["authorization"] as string;
const coreJwt = authHeader?.replace("Bearer ", "");
```

**Verdict**: ✅ User-scoped JWT is forwarded as-is, NOT minted or constructed.

---

## Service Token Check

**Search Command**: `rg -n "service token|serviceToken|x-service-token|client_credentials" modules/platform-admin/src`

**Result**: **0 matches** in src/ directory

**Verdict**: ✅ NO service token implementation found

---

## Forbidden Endpoint Check

**Core Contract v1 Allowed Endpoints**: 42 total (see CORE_CONTRACT_V1_EXTRACT.md Section B)

**Platform-Admin Calls**: 1 endpoint (`GET /api/v1/organizations/:id`)

**Forbidden Endpoints Called**: NONE

**Verdict**: ✅ PASS — Only allowed endpoint is used

---

## Fail-Closed Behavior

### Error Handling (Lines 96-139)

| Status Code         | Behavior       | Line    | Verdict                   |
| ------------------- | -------------- | ------- | ------------------------- |
| **200 OK**          | Return `true`  | 86-93   | ✅ Allow                  |
| **404**             | Return `false` | 97-104  | ✅ Deny (org not found)   |
| **401/403**         | Throw error    | 120-128 | ✅ Deny (auth failure)    |
| **5xx**             | Throw error    | 108-116 | ✅ Deny (server error)    |
| **Network/Timeout** | Throw error    | 141-154 | ✅ Deny (network failure) |

**Verdict**: ✅ PASS — All error scenarios deny mapping creation (fail-closed)

---

## Security Compliance

### JWT Logging Protection

**Evidence**: Lines 17-33 (redaction helper)

```typescript
function redactSensitiveData(error: unknown): { message: string } {
  if (error instanceof Error) {
    return {
      message: error.message,
      // NEVER include: request headers, full error object
    };
  }
  return { message: "Unknown error" };
}
```

**Usage**: Line 144 — `const safeError = redactSensitiveData(error);`

**Log Statements**: Lines 87-92, 98-103, 109-115, 121-127, 132-138, 147-153

**Verdict**: ✅ NO JWT values logged (only safe fields: correlationId, coreOrgId, statusCode, errorMessage)

---

## Final Verdict

| Criterion                         | Status  |
| --------------------------------- | ------- |
| **Only allowed endpoints called** | ✅ PASS |
| **User-scoped JWT forwarding**    | ✅ PASS |
| **NO service tokens**             | ✅ PASS |
| **Fail-closed on errors**         | ✅ PASS |
| **JWT never logged**              | ✅ PASS |
| **Contract assertion enforced**   | ✅ PASS |

**Overall**: ✅ **PASS** — Core integration is compliant with Core Contract v1 and governance rules.

---

**END OF CORE CALLS MAP**
