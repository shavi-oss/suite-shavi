# 00_CODE_TRUTH.md — Gate 6

**Date**: 2026-03-08

## A) UI Component: OrganizationCreate.tsx

**Path**: `modules/platform-admin/client/src/components/OrganizationCreate.tsx`

### Current form fields

| Field             | Present |
| ----------------- | ------- |
| Organization Name | ✅      |
| Admin Email       | ❌      |
| Admin Password    | ❌      |
| Admin First Name  | ❌      |
| Admin Last Name   | ❌      |

### Current payload built (line 26)

```ts
createOrganization({ name: name.trim() });
```

Only `name` is sent.

### Error path

`normalizeError(err)` → generic "Failed to create organization" (canRetry: true)

---

## B) API Client: platformAdmin.ts

**Path**: `modules/platform-admin/client/src/api/platformAdmin.ts`

```ts
interface CreateOrganizationDto {
  name: string; // ← missing 4 fields
}

export async function createOrganization(
  dto: CreateOrganizationDto,
): Promise<Organization> {
  const response = await fetchWithCorrelation(`${API_BASE}/organizations`, {
    method: "POST",
    body: JSON.stringify(dto), // sends only { name }
  });
  if (!response.ok) {
    throw new Error("Failed to create organization"); // generic — no status code distinction
  }
  return response.json(); // expects Organization shape from BFF
}
```

**Response parsing**: Suite BFF `OrganizationController` returns `OrganizationResponseDto` (flat: id, name, status, createdAt...). The client reads `response.json()` as `Organization` — no `data.organization.id` lookup at this layer. **This is correct** — the response shape mismatch was only in the BFF→Core layer (already fixed in Gate 5.2).

---

## C) Core Contract Truth (from admin-jwt.strategy.ts, admin.controller.ts, organizations.service.ts)

### Required create payload

```json
{
  "name": "...",
  "adminEmail": "...",
  "adminPassword": "...",
  "adminFirstName": "...",
  "adminLastName": "..."
}
```

### Success response at Suite BFF level

```json
{
  "id": "...",
  "name": "...",
  "status": "active",
  "createdAt": "...",
  "updatedAt": "...",
  "createdBy": "..."
}
```

`OrganizationResponseDto` — already mapped correctly at BFF. Client reads this correctly.

### Error shapes (relevant to UI)

- `400` → Core validation failure (missing field, email conflict)
- `401/403` → JWT/auth failure (handled by fetchWithCorrelation → throws "Unauthorized")
- `5xx` → unexpected server error

---

## Summary

- UI form: missing 4 fields (Root Cause A)
- API client DTO: missing 4 fields (Root Cause B)
- Response parsing at client level: ✅ correct (Root Cause C does NOT apply here)
