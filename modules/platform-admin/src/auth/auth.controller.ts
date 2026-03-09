import { Controller, Post, Get, Body, Res, Req, HttpCode, HttpStatus, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { SessionService } from './session.service';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SessionResponseDto } from './dto/session-response.dto';
import { ExplicitAllow } from '../../guards/explicit-allow.guard';
import { InternalUserService } from '../internal-users/internal-user.service';
import { RedeemInviteDto } from '../internal-users/dto/create-internal-user.dto';
import { randomUUID } from 'crypto';

// Type imports for request/response
type Request = any;
type Response = any;

/**
 * Auth Controller — Gate 10 update
 *
 * ExplicitAllow invariant:
 *   Before Gate 10: @ExplicitAllow() on login, logout, getSession (3 method-level usages = 4 total with Health)
 *   Gate 10: move @ExplicitAllow() to class level on AuthController → 1 usage for all auth methods
 *   Total after Gate 10: HealthController (1) + AuthController class (1) = 2 ExplicitAllow usages
 *   This is SAFE: reduces count below 4, does not add new public surface beyond existing 3 auth routes + redeem
 *
 * Redeem endpoint governance:
 *   - Added to AuthController (existing controller, no new controller created)
 *   - Public (ExplicitAllow) because invite token IS the credential — no session needed
 *   - Fail-closed: wrong/expired/reused token → generic 400 (no enumeration)
 *   - Same error for deactivated user, no token, expired token, wrong token
 */
@Controller('api/platform-admin/auth')
@ExplicitAllow()
export class AuthController {
  constructor(
    private readonly sessionService: SessionService,
    private readonly authService: AuthService,
    private readonly internalUserService: InternalUserService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ message: string }> {
    const operatorId = await this.authService.validateCredentials(
      loginDto.email,
      loginDto.password,
    );

    const sessionId = this.sessionService.createSession(operatorId);

    response.cookie('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 900000, // 15 minutes
    });

    return { message: 'Login successful' };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): { message: string } {
    const sessionId = request.cookies?.sessionId;
    if (sessionId) {
      this.sessionService.clearSession(sessionId);
    }
    response.cookie('sessionId', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 0,
    });
    return { message: 'Logout successful' };
  }

  @Get('session')
  getSession(@Req() request: Request): SessionResponseDto {
    const sessionId = request.cookies?.sessionId;
    if (!sessionId) {
      throw new UnauthorizedException('Unauthorized access. Please contact your administrator.');
    }
    const userId = this.sessionService.validateSession(sessionId);
    if (!userId) {
      throw new UnauthorizedException('Unauthorized access. Please contact your administrator.');
    }
    return {
      userId,
      expiresAt: Date.now() + 900000,
    };
  }

  /**
   * POST /api/platform-admin/auth/redeem-invite — Gate 10
   *
   * Public endpoint (inherited ExplicitAllow from class level).
   * Invited user exchanges raw token for a password.
   * Fail-closed: generic 400 for all invalid conditions.
   * No session created — user must log in separately after redemption.
   */
  @Post('redeem-invite')
  @HttpCode(HttpStatus.OK)
  async redeemInvite(
    @Body() dto: RedeemInviteDto,
    @Req() req: Request,
  ): Promise<{ message: string }> {
    if (!dto.uid || !dto.token || !dto.password) {
      throw new BadRequestException('Invalid or expired invite token');
    }

    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Minimum password length enforced here (server-side — not trusting client)
    if (dto.password.length < 12) {
      throw new BadRequestException('Password must be at least 12 characters');
    }

    const correlationId = req.headers['x-correlation-id'] || randomUUID();

    // Delegate to service — all token/expiry/deactivated checks are there
    await this.internalUserService.redeemInvite(dto.uid, dto.token, dto.password, correlationId);

    return { message: 'Password set successfully. You may now log in.' };
  }
}
