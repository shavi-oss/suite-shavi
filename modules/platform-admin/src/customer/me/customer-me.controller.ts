import { Controller, Get, Req, UseFilters, UseGuards } from '@nestjs/common';
import { ExplicitAllow } from '../../../guards/explicit-allow.guard';
import { CustomerSessionGuard } from '../auth/customer-session.guard';
import { CustomerAllExceptionsFilter } from '../errors/customer-all-exceptions.filter';

/**
 * Customer "me" endpoint — /api/customer/v1/me
 * Returns the current user + org context from the Session JWT claim (Contract B §12).
 * No Core call required; tenant derived from JWT claim only.
 *
 * Error envelope (ADR-016 D3): @UseFilters scopes the CUSTOMER_* envelope to this
 * controller so a missing/invalid session (401) is returned in the standard shape.
 */
@Controller('api/customer/v1')
@UseFilters(CustomerAllExceptionsFilter)
export class CustomerMeController {
  @Get('me')
  @ExplicitAllow()
  @UseGuards(CustomerSessionGuard)
  me(@Req() req: any) {
    const u = req.user;
    return { id: u.sub, email: u.email, organizationId: u.organizationId };
  }
}
