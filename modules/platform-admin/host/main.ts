import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

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

  // Graceful shutdown
  app.enableShutdownHooks();

  const port = process.env.PORT || 4000;
  await app.listen(port);
  
  logger.log(`Platform Admin Host listening on http://localhost:${port}`);
}

bootstrap();
