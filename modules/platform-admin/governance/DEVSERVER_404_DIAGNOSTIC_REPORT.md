# Dev Server 404 Diagnostic Report

## Document Control

| Attribute   | Value                          |
| ----------- | ------------------------------ |
| Report Type | Vite Dev Server 404 Diagnostic |
| Module      | platform-admin                 |
| Client Path | modules/platform-admin/client  |
| Status      | ROOT CAUSE IDENTIFIED          |
| Date        | 2026-02-11                     |

---

## Summary

Vite dev server starts successfully on port 3000 but returns **HTTP 404** for `/` and `/index.html`.

**Root Cause**: Vite config has incorrect `root` path set to `'modules/platform-admin/client'` instead of `'.'` (current directory).

When `vite.config.ts` is located in `modules/platform-admin/client/` and specifies `root: 'modules/platform-admin/client'`, Vite attempts to serve from a **nested subdirectory** that doesn't exist, causing 404 errors.

**Evidence**: `/@vite/client` returns 200 (Vite is running), but `/` and `/index.html` return 404 (HTML not served).

**Fix**: Change `root: 'modules/platform-admin/client'` to `root: '.'` in `vite.config.ts`.

---

## Reproduction Steps

1. Navigate to `modules/platform-admin/client`
2. Run `npm run dev`
3. Vite starts on `http://localhost:3000`
4. Access `http://localhost:3000/` → **404 Not Found**
5. Access `http://localhost:3000/index.html` → **404 Not Found**
6. Access `http://localhost:3000/@vite/client` → **200 OK**

---

## Evidence

### 1) Project Entry Points (Static Verification)

**File**: `modules/platform-admin/client/index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Platform Admin Console</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Module Script Line**: `<script type="module" src="/src/main.tsx"></script>` ✅

---

**File**: `modules/platform-admin/client/src/main.tsx`

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

**Root Render Line**: `ReactDOM.createRoot(document.getElementById('root')!).render(...)` ✅

**Verification**: Entry points are correctly configured.

---

### 2) Vite Server Response Tests

**Command**: `(Invoke-WebRequest -UseBasicParsing http://localhost:3000/).StatusCode`

**Output**:

```
Invoke-WebRequest : The remote server returned an error: (404) Not Found.
```

**Result**: ❌ **FAIL** - Root path returns 404

---

**Command**: `(Invoke-WebRequest -UseBasicParsing http://localhost:3000/index.html).StatusCode`

**Output**:

```
Invoke-WebRequest : The remote server returned an error: (404) Not Found.
```

**Result**: ❌ **FAIL** - index.html returns 404

---

**Command**: `(Invoke-WebRequest -UseBasicParsing http://localhost:3000/@vite/client).StatusCode`

**Output**:

```
200
```

**Result**: ✅ **PASS** - Vite internal client endpoint returns 200

---

### 3) Port/Process Verification

**Command**: `netstat -ano | findstr :3000`

**Output**:

```
  TCP    [::1]:3000             [::]:0                 LISTENING       27728
  TCP    [::1]:3000             [::1]:54789            TIME_WAIT       0
```

**Verification**: ✅ Port 3000 is bound to PID 27728, listening on IPv6 localhost ([::1])

**Result**: Correct process, no port conflict.

---

### 4) Vite Config Inspection

**File**: `modules/platform-admin/client/vite.config.ts`

**Relevant Configuration**:

```ts
export default defineConfig({
  plugins: [react()],
  root: "modules/platform-admin/client", // ❌ INCORRECT
  build: {
    outDir: "../../../dist/platform-admin/client",
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    strictPort: true,
    proxy: {
      "/api/platform-admin": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
```

**Issues Identified**:

1. **`root: 'modules/platform-admin/client'`** ❌
   - This config file is **already located** in `modules/platform-admin/client/`
   - Setting `root` to the same path creates a **nested directory lookup**
   - Vite tries to serve from `modules/platform-admin/client/modules/platform-admin/client/` (doesn't exist)

2. **`appType`**: Not specified (defaults to `'spa'`) ✅

3. **`base`**: Not specified (defaults to `/`) ✅

4. **`server.middlewareMode`**: Not specified ✅

5. **`server.port`**: 3000 ✅

6. **`server.strictPort`**: true ✅

---

### 5) HTML Serving vs Vite Client

**Analysis**:

- `/@vite/client` returns **200** → Vite server is running
- `/` returns **404** → HTML not served
- `/index.html` returns **404** → HTML not served

**Conclusion**: This is a **Vite HTML serving issue**, not a port/process issue.

**Root Cause**: Incorrect `root` path in config causes Vite to look for `index.html` in the wrong directory.

---

## Root Cause Analysis

**Root Cause**: **B) Vite HTML Not Served Due To Config**

**Specific Issue**: `root: 'modules/platform-admin/client'` in `vite.config.ts`

**Explanation**:

The `vite.config.ts` file is located at:

```
modules/platform-admin/client/vite.config.ts
```

When this config specifies `root: 'modules/platform-admin/client'`, Vite interprets this as a **relative path from the config file's location**.

This causes Vite to attempt serving from:

```
modules/platform-admin/client/modules/platform-admin/client/
```

This nested path does not exist, so:

- `index.html` cannot be found → 404
- `/` cannot be served → 404
- But Vite's internal endpoints (like `/@vite/client`) still work → 200

**Evidence**:

1. Entry points (`index.html`, `src/main.tsx`) exist and are correctly configured
2. Port 3000 is correctly bound
3. `/@vite/client` returns 200 (Vite is running)
4. `/` and `/index.html` return 404 (HTML not found)
5. Config has `root: 'modules/platform-admin/client'` (incorrect for current directory)

---

## Minimal Fix Recommendations

### Option 1: Set `root` to Current Directory (RECOMMENDED)

**Change**:

```ts
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  root: ".", // ✅ Current directory
  // ... rest of config
});
```

**Rationale**: Since `vite.config.ts` is already in `modules/platform-admin/client/`, the root should be `.` (current directory).

---

### Option 2: Remove `root` Entirely

**Change**:

```ts
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  // root: 'modules/platform-admin/client',  // ❌ Remove this line
  // ... rest of config
});
```

**Rationale**: If `root` is not specified, Vite defaults to the directory containing `vite.config.ts`, which is correct.

---

### Option 3: Move Config to Repository Root (NOT RECOMMENDED)

**Change**: Move `vite.config.ts` to repository root and keep `root: 'modules/platform-admin/client'`.

**Rationale**: This would make the relative path correct, but violates module isolation.

**Recommendation**: Do NOT use this option.

---

## Recommended Action

**Apply Option 1**: Change `root: 'modules/platform-admin/client'` to `root: '.'` in `vite.config.ts`.

**No other changes required**. All other configuration is correct.

---

## Signature

**Diagnosed By**: Platform Architecture Governance  
**Date**: 2026-02-11  
**Status**: ROOT CAUSE IDENTIFIED  
**Recommended Fix**: Change `root` to `'.'` in `vite.config.ts`
