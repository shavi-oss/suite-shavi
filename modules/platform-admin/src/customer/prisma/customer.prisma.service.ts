import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '.prisma/customer-client';

/**
 * CustomerPrismaService — isolated Prisma client for the customer schema.
 * Separate from the platform-admin PrismaService to respect MODULE_SCOPE_LOCK.
 */
@Injectable()
export class CustomerPrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CustomerPrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
    } catch (err) {
      this.logger.warn(
        `Customer Prisma $connect failed on init (will retry lazily): ${(err as Error).message}`,
      );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
