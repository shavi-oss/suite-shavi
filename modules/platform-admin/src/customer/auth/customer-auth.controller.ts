import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ExplicitAllow } from '../../../guards/explicit-allow.guard';
import { CustomerSessionGuard } from '../auth/customer-session.guard';
import { CustomerSessionService } from '../auth/customer-session.service';
import { LoginDto } from '../auth/dto/login.dto';
import { SessionResponseDto } from '../auth/dto/session-response.dto';

/**
 * Customer Auth Controller — /api/customer/v1/auth/*
 *
 *  - POST /session  -> public (Kernel-brokered login) -> returns Suite Session JWT
 *  - POST /refresh  -> protected (Session) -> rotates Session JWT
 *  - POST /logout   -> protected (Session) -> invalidates session
 *
 * All routes are opted-in via @ExplicitAllow() (global DenyAllGuard fail-closed).
 */
@Controller('api/customer/v1/auth')
export class CustomerAuthController {
  constructor(private readonly session: CustomerSessionService) {}

  @Post('session')
  @ExplicitAllow()
  async login(@Body() dto: LoginDto): Promise<SessionResponseDto> {
    const { token, expiresIn } = await this.session.login(dto.email, dto.password);
    return { accessToken: token, tokenType: 'Bearer', expiresIn };
  }

  @Post('refresh')
  @ExplicitAllow()
  @UseGuards(CustomerSessionGuard)
  async refresh(@Req() req: any): Promise<SessionResponseDto> {
    const { token, expiresIn } = this.session.refresh(req.customerToken);
    return { accessToken: token, tokenType: 'Bearer', expiresIn };
  }

  @Post('logout')
  @ExplicitAllow()
  @UseGuards(CustomerSessionGuard)
  async logout(@Req() req: any): Promise<{ success: boolean }> {
    this.session.logout(req.customerToken);
    return { success: true };
  }
}
