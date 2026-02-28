# 01 — CHANGELOG

**Date:** 2026-02-28T07:40Z
**Commit:** `782fa28` — `fix(railway): build client dist in Dockerfile (vite root)`

---

## Files Changed

| File         | Change                                                                                                                                            | Lines  |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| `Dockerfile` | Replaced `RUN npx vite build --config modules/platform-admin/client/vite.config.ts` with `RUN cd modules/platform-admin/client && npx vite build` | -4, +6 |

## No other files touched.

---

## Root Cause

`vite build --config /path/to/config` sets Vite's **root** to the CWD (`/app`), not the config directory. Vite then looks for `/app/index.html` → not found → `"Could not resolve entry module 'index.html'"`.

**Fix**: `cd` into client dir first → Vite root = `/app/modules/platform-admin/client` where `index.html` lives. The `outDir: '../../../dist/platform-admin/client'` in vite.config.ts is relative to Vite root, so it resolves to `/app/dist/platform-admin/client` — exactly where `main.ts` `express.static(clientPath)` expects it.

---

## Diff

```diff
 # ── React SPA client build (Vite) ─────────────────────────────────────────
-# outDir: dist/platform-admin/client (per vite.config.ts)
-# This produces the index.html served by express.static in main.ts
-# Evidence: forensic-audit-2026-02-28 F2 fix
-RUN npx vite build --config modules/platform-admin/client/vite.config.ts
+# Root cause of previous failure: `vite build --config path` sets Vite root=CWD (/app),
+# so Vite looks for /app/index.html (not found → "Could not resolve entry module").
+# Fix: cd into client dir first so Vite root=/app/modules/platform-admin/client.
+# outDir '../../../dist/platform-admin/client' (relative to Vite root) → /app/dist/platform-admin/client ✅
+# Evidence: forensic-audit-2026-02-28-v2 Phase 3 vite root fix
+RUN cd modules/platform-admin/client && npx vite build
```
