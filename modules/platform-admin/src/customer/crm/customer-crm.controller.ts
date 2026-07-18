import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ExplicitAllow } from '../../../guards/explicit-allow.guard';
import { CustomerSessionGuard } from '../auth/customer-session.guard';
import { CustomerCrmService } from './customer-crm.service';
import { CreateContactDto } from './dto/create-contact.dto';

/**
 * Customer CRM Controller — /api/customer/v1/crm/contacts
 * Suite-owned data (Contract A §6.2). Tenant (suiteOrgId) comes from the Session JWT
 * claim ONLY — never from a client header (Contract B §4.1 / §10).
 */
@Controller('api/customer/v1/crm')
export class CustomerCrmController {
  constructor(private readonly crm: CustomerCrmService) {}

  @Get('contacts')
  @ExplicitAllow()
  @UseGuards(CustomerSessionGuard)
  list(@Req() req: any) {
    return this.crm.list(req.user.organizationId);
  }

  @Post('contacts')
  @ExplicitAllow()
  @UseGuards(CustomerSessionGuard)
  create(@Req() req: any, @Body() dto: CreateContactDto) {
    return this.crm.create(req.user.organizationId, dto);
  }
}
