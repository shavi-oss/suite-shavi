import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ExplicitAllow } from '../../../guards/explicit-allow.guard';
import { CustomerSessionGuard } from '../auth/customer-session.guard';
import { CrmScopeGuard, RequireCrmScope } from '../auth/bassan-crm/crm-scope.guard';
import { CustomerCrmService } from './customer-crm.service';
import { CreateContactDto } from './dto/create-contact.dto';

/**
 * Customer CRM Controller — /api/customer/v1/crm/contacts
 * Suite-owned data (Contract A §6.2). Tenant (suiteOrgId) comes from the Session JWT
 * claim ONLY — never from a client header (Contract B §4.1).
 *
 * G-SEC-2 (2/3) delegation: each route also enforces a Bassan-issued crm.* scope
 * via @RequireCrmScope + CrmScopeGuard (Bassan is sole authority; SHAVI stores no
 * local crm.* permission rows). crm.tasks:* permissions are reserved for future
 * task endpoints and use the same guard/decorator.
 */
@Controller('api/customer/v1/crm')
export class CustomerCrmController {
  constructor(private readonly crm: CustomerCrmService) {}

  @Get('contacts')
  @ExplicitAllow()
  @RequireCrmScope('crm.leads:read')
  @UseGuards(CustomerSessionGuard, CrmScopeGuard)
  list(@Req() req: any) {
    return this.crm.list(req.user.organizationId);
  }

  @Post('contacts')
  @ExplicitAllow()
  @RequireCrmScope('crm.leads:write')
  @UseGuards(CustomerSessionGuard, CrmScopeGuard)
  create(@Req() req: any, @Body() dto: CreateContactDto) {
    return this.crm.create(req.user.organizationId, dto);
  }
}
