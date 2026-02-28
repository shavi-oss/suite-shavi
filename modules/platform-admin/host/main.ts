import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const logger = new Logger('PlatformAdminHost');
  
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // CORS: use CORS_ORIGIN env var (comma-separated) for production;
  // falls back to localhost:3000 for local dev.
  // Evidence: SUITE_DEPLOY_PLAN.md T-1 (2026-02-24)
  const corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(s => s.trim()).filter(Boolean)
    : ['http://localhost:3000'];
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
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

  const port = process.env.PORT || 4000;
  // Explicitly bind to 0.0.0.0 for Railway container compatibility.
  // Without this, Node may default to 127.0.0.1 making the container unreachable.
  // Evidence: forensic-audit-2026-02-28 F1 fix
  await app.listen(port, '0.0.0.0');
  
  logger.log(`Platform Admin Host listening on http://localhost:${port}`);
}

bootstrap();
