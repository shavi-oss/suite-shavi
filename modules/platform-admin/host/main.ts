import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { join } from 'path';
import * as express from 'express';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cookieParser = require('cookie-parser');

// ── Crash diagnostics: print any uncaught error BEFORE process exits ──────────
// Without these handlers, crashes during NestJS module init produce zero output
// in Railway deploy logs (process exits silently, health never responds).
// Evidence: Gate 10 Railway crash forensic (2026-03-11).
process.on('uncaughtException', (err) => {
  console.error('[FATAL] uncaughtException:', err.message);
  console.error(err.stack);
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  console.error('[FATAL] unhandledRejection:', reason);
  process.exit(1);
});

async function bootstrap() {
  const logger = new Logger('PlatformAdminHost');
  const port = Number(process.env.PORT) || 4000;

  // ── Pre-NestJS health endpoint ───────────────────────────────────────────────
  // Register health on a raw Express server BEFORE NestFactory.create so that
  // Railway's healthcheck can respond 200 even while NestJS modules are loading.
  // If NestFactory.create fails, this health endpoint continues to respond.
  // This also helps distinguish: health 200 = process alive, routes responding.
  const expressApp = express.default ? express.default() : (express as any)();
  (expressApp as express.Express).get('/api/platform-admin/health', (_req: express.Request, res: express.Response) => {
    res.status(200).json({ status: 'ok', module: 'platform-admin' });
  });
  const preServer = (expressApp as express.Express).listen(port, '0.0.0.0', () => {
    console.log(`[STARTUP] Pre-NestJS health registered on port ${port}`);
  });

  console.log('[STARTUP] Phase 1: Creating NestJS application...');
  let app: any;
  try {
    app = await NestFactory.create(AppModule, expressApp, {
      logger: ['error', 'warn', 'log'],
    });
    console.log('[STARTUP] Phase 1: NestFactory.create complete');
  } catch (err: any) {
    console.error('[STARTUP] Phase 1 FAILED: NestFactory.create threw:', err.message);
    console.error(err.stack);
    process.exit(1);
  }

  preServer.close();

  // CORS: Railway env var is CORS_ALLOWED_ORIGINS (comma-separated).
  // Fallback to CORS_ORIGIN for backward compat, then localhost for dev.
  // Evidence: forensic-audit-2026-02-28-v2 Phase 2 — confirmed via railway variables dump.
  // CRITICAL FIX: Previous code read CORS_ORIGIN but Railway has CORS_ALLOWED_ORIGINS.
  const corsRaw = process.env.CORS_ALLOWED_ORIGINS || process.env.CORS_ORIGIN;
  const corsOrigins = corsRaw
    ? corsRaw.split(',').map(s => s.trim()).filter(Boolean)
    : ['http://localhost:3000'];
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  // Cookie parsing: required so req.cookies.sessionId is populated.
  // Without this, SessionGuard always sees undefined and returns 401.
  // cookie-parser is already declared in package.json v1.4.7.
  // Evidence: forensic-ui-login Phase 2 — root cause: missing cookieParser().
  app.use(cookieParser());

  // Health endpoint: raw Express middleware BEFORE NestJS routing.
  // DenyAllGuard is APP_GUARD (NestJS layer) — it fires before any route-level guard,
  // so ExplicitAllowGuard on HealthController never gets a chance. Returning 200 JSON
  // here at the Express layer bypasses all NestJS guards for this specific path only.
  // Railway healthcheck path: /api/platform-admin/health (see railway.json).
  // NOTE: controllers already hardcode 'api/platform-admin/...' in @Controller()
  //       so NO setGlobalPrefix is needed — it would create double /api/api/ prefix.
  // Evidence: forensic-audit-2026-02-28-v2 Phase 3 — DenyAllGuard bypass via Express.
  app.use('/api/platform-admin/health', (req: express.Request, res: express.Response) => {
    res.status(200).json({ status: 'ok', module: 'platform-admin' });
  });

  // Static SPA serving — serve React build output for non-API routes only.
  // The middleware guard (req.path.startsWith('/api')) ensures all /api/*
  // requests bypass static serving and reach NestJS guards/controllers.
  // rootPath: dist/modules/platform-admin/host -> ../../../../dist/platform-admin/client
  // Evidence: PR-1 — Fix UI Serving Disconnect (2026-02-27)
  const clientPath = join(__dirname, '..', '..', '..', '..', 'dist', 'platform-admin', 'client');
  app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!req.path.startsWith('/api')) {
      express.static(clientPath)(req, res, next);
    } else {
      next();
    }
  });
  app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(join(clientPath, 'index.html'));
    } else {
      next();
    }
  });

  // Graceful shutdown
  app.enableShutdownHooks();

  await app.listen(port, '0.0.0.0');
  
  logger.log(`Platform Admin Host listening on http://localhost:${port}`);
}

bootstrap();
