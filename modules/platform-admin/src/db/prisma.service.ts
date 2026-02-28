import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
    } catch (err) {
      // Non-fatal: log and continue. Prisma reconnects lazily on first query.
      // If DB is permanently unreachable, queries will fail individually.
      // Evidence: forensic-audit-2026-02-28-v2 Phase 3 — Railway healthcheck crash fix.
      this.logger.warn(`Prisma $connect failed on init (will retry lazily): ${(err as Error).message}`);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
