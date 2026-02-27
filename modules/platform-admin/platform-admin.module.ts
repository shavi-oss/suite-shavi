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
 * 
 * GATE 3 — ORG MAPPING MODULE
 * OrgMappingController, OrgMappingService, OrgMappingRepository, CoreClient added.
 * Audit removed per Gate 3 scope.
 */

import { join } from 'path';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { DenyAllGuard } from './guards';
import { HealthController } from './controllers';
import { PrismaModule } from './src/db/prisma.module';
import { OrganizationRepository } from './src/organizations/organization.repository';
import { InternalUserController } from './src/internal-users/internal-user.controller';
import { InternalUserService } from './src/internal-users/internal-user.service';
import { InternalUserRepository } from './src/internal-users/internal-user.repository';
import { OrgMappingController } from './src/org-mapping/org-mapping.controller';
import { OrgMappingService } from './src/org-mapping/org-mapping.service';
import { OrgMappingRepository } from './src/org-mapping/org-mapping.repository';
import { CoreClient } from './src/core-adapter/core.client';
import { AuditService } from './src/audit/audit.service';
import { AuditRepository } from './src/audit/audit.repository';
import { OrganizationController } from './src/organizations/organization.controller';
import { OrganizationService } from './src/organizations/organization.service';
import { AuditController } from './src/audit/audit.controller';
import { AuthController } from './src/auth/auth.controller';
import { SessionService } from './src/auth/session.service';
import { JwtStorageService } from './src/auth/jwt-storage.service';

@Module({
  imports: [
    PrismaModule,
  ],
  controllers: [
    HealthController,
    InternalUserController,
    OrgMappingController,
    OrganizationController,
    AuditController,
    AuthController,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: DenyAllGuard,
    },
    OrganizationRepository,
    OrganizationService,
    InternalUserService,
    InternalUserRepository,
    OrgMappingService,
    OrgMappingRepository,
    CoreClient,
    AuditService,
    AuditRepository,
    SessionService,
    JwtStorageService,
  ],
})
export class PlatformAdminModule {}
