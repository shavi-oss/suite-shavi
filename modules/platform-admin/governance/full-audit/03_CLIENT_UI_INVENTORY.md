# 03 — CLIENT UI INVENTORY (Vite/React)

## A. Build Configuration Truth

- **Vite Config:** Standard `@vitejs/plugin-react` config. Proxy routes `/api/platform-admin` to local `4000`. Build outDir is `../../../dist/platform-admin/client`.
- **Package.json Scripts:** `npm run build` cleanly executes `vite build` exiting `0`.
- **Artifact:** Deployment generates the static assets inside `dist/platform-admin/client`.

## B. The UI Disconnect Evidence

**Why does `https://web-production-6f02f6.up.railway.app/` return empty?**

1. Railway executes `node dist/modules/platform-admin/host/main.js` from the monorepo root (or working directory).
2. The `AppModule` inside the BFF initializes standard NestJS REST controllers (`PlatformAdminModule`).
3. There is absolutely no `ServeStaticModule` usage, nor any fallback router configured to serve `index.html` for non-API routes.
4. Hence, an HTTP `GET /` hits the NestJS route resolver... which has no `@Controller('/')` decorator. The global `DenyAllGuard` or standard 404 handler rejects the request.
5. The frontend is built, sitting durably on the Railway disk space, but the server is ignoring it.

## C. Solution

The backend architecture is currently designed as an API-only BFF instead of a monorepo Host/BFF combo. To resolve this:

- Import `ServeStaticModule.forRoot(...)` into `platform-admin.module.ts`.
- Map it to `join(__dirname, '../../client')` (resolving from `dist/modules/platform-admin/host`).
