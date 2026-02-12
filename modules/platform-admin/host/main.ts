import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('PlatformAdminHost');
  
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // CORS for local dev (UI on port 3000)
  app.enableCors({
    origin: ['http://localhost:3000'],
    credentials: true,
  });

  // Graceful shutdown
  app.enableShutdownHooks();

  const port = process.env.PORT || 4000;
  await app.listen(port);
  
  logger.log(`Platform Admin Host listening on http://localhost:${port}`);
}

bootstrap();
