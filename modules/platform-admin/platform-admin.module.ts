/**
 * Platform Admin Module — Fail-Closed Enforcement
 * 
 * GATE 4.5 — DENY-ALL BY DEFAULT
 * DenyAllGuard wired as APP_GUARD for fail-closed enforcement.
 * 
 * GATE 4.9 — FIRST OPT-IN ENDPOINT
 * HealthController added with explicit opt-in via ExplicitAllowGuard.
 */

import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { DenyAllGuard } from './guards';
import { HealthController } from './controllers';
import { PrismaModule } from './src/db/prisma.module';
import { OrganizationRepository } from './src/repositories/organization.repository';

@Module({
  imports: [PrismaModule],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: DenyAllGuard,
    },
    OrganizationRepository,
  ],
})
export class PlatformAdminModule {}
