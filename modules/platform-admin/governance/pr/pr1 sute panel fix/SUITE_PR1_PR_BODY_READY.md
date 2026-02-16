# PR BODY — Suite PR-1
Title:
PR-1: Remove UI Dependency on Core JWT (Server-Side SessionGuard)

---

## 🔎 Problem

`OrgMappingController` currently reads Core JWT from the request `Authorization` header.

This implies the **UI/client must possess and forward Core JWT**, which violates:

- Core JWT server-side boundary principle
- Layer separation (UI → Suite → Core)
- Security minimization (reduce exposure surface)

---

## ✅ Solution

- Enforce `SessionGuard` on org-mapping routes.
- Source `coreJwt` from `req.coreJwt` (set by `SessionGuard` server-side).
- Remove dependency on `req.headers.authorization`.

---

## 📁 Files Changed

modules/platform-admin/src/org-mapping/org-mapping.controller.ts

No other files modified.

---

## 🔒 Security Impact

Before:
UI could forward Core JWT.

After:
Core JWT is strictly server-side only.
UI sends only session cookie.

Fail-closed behavior preserved.

---

## 🧪 Verification

- git diff --name-only → only controller file
- tsc --noEmit → PASS
- build → PASS
- POST without Authorization header → works when session valid
- Session missing → 401 (fail-closed)

---

## 📌 Scope Control

- No dependency changes
- No config changes
- No schema changes
- No Core repo changes
- No refactors

---

## 🚀 Next Step

Open Core Contract v2 for admin-safe `exists` endpoint.

---

END
