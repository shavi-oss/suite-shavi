import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ExplicitAllow } from '../../../guards/explicit-allow.guard';
import { CustomerSessionGuard } from '../auth/customer-session.guard';

/**
 * Customer "me" endpoint — /api/customer/v1/me
 * Returns the current user + org context from the Session JWT claim (Contract B §12).
 * No Core call required; tenant derived from JWT claim only.
 */
@Controller('api/customer/v1')
export class CustomerMeController {
  @Get('me')
  @ExplicitAllow()
  @UseGuards(CustomerSessionGuard)
  me(@Req() req: any) {
    const u = req.user;
    return { id: u.sub, email: u.email, organizationId: u.organizationId };
  }
}
