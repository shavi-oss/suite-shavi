import { Module } from '@nestjs/common';
import { CustomerSessionService } from './auth/customer-session.service';
import { CustomerSessionGuard } from './auth/customer-session.guard';
import { CustomerAuthController } from './auth/customer-auth.controller';
import { CustomerMeController } from './me/customer-me.controller';
import { CustomerCrmController } from './crm/customer-crm.controller';
import { CustomerCrmService } from './crm/customer-crm.service';
import { CustomerCrmRepository } from './crm/customer-crm.repository';
import { CustomerPrismaService } from './prisma/customer.prisma.service';
import { CustomerKernelBrokerService } from './kernel/customer-kernel-broker.service';
import { BassanCrmJwtVerifier } from './auth/bassan-crm/bassan-crm-jwt-verifier';
import { CrmScopeGuard } from './auth/bassan-crm/crm-scope.guard';
import { BASSAN_CRM_KEY_PROVIDER, EnvBassanKeyProvider } from './auth/bassan-crm/bassan-key-provider';

/**
 * CustomerModule — the Bassan Workspace ↔ Bassan Suite gateway (Contract B).
 * Owns /api/customer/v1/*. Brokers Core access via CustomerKernelBrokerService.
 * Tenant isolated by organizationId from the Session JWT claim.
 */
@Module({
  controllers: [CustomerAuthController, CustomerMeController, CustomerCrmController],
  providers: [
    CustomerSessionService,
    CustomerSessionGuard,
    CustomerCrmService,
    CustomerCrmRepository,
    CustomerPrismaService,
    CustomerKernelBrokerService,
    // G-SEC-2 (2/3): Bassan crm.* delegation — verify + enforce, no local permission rows.
    { provide: BASSAN_CRM_KEY_PROVIDER, useClass: EnvBassanKeyProvider },
    BassanCrmJwtVerifier,
    CrmScopeGuard,
  ],
  exports: [CustomerSessionService],
})
export class CustomerModule {}
