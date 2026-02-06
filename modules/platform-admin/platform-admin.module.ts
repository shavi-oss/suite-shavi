/**
 * Platform Admin Module — Fail-Closed Enforcement
 * 
 * GATE 4.5 — DENY-ALL BY DEFAULT
 * DenyAllGuard wired as APP_GUARD for fail-closed enforcement.
 * 
 * GATE 4.9 — FIRST OPT-IN ENDPOINT
 * HealthController added with explicit opt-in via ExplicitAllowGuard.
 * 
 * GATE 1.7 — PHASE 7 INTERNAL USERS MODULE
 * InternalUserController, InternalUserService, InternalUserRepository added.
 */

import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { DenyAllGuard } from './guards';
import { HealthController } from './controllers';
import { PrismaModule } from './src/db/prisma.module';
import { OrganizationRepository } from './src/organizations/organization.repository';
import { InternalUserController } from './src/internal-users/internal-user.controller';
import { InternalUserService } from './src/internal-users/internal-user.service';
import { InternalUserRepository } from './src/internal-users/internal-user.repository';
import { AuditController } from './src/audit/audit.controller';
import { AuditService } from './src/audit/audit.service';
import { AuditRepository } from './src/audit/audit.repository';

@Module({
  imports: [PrismaModule],
  controllers: [HealthController, InternalUserController, AuditController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: DenyAllGuard,
    },
    OrganizationRepository,
    InternalUserService,
    InternalUserRepository,
    AuditService,
    AuditRepository,
  ],
})
export class PlatformAdminModule {}
