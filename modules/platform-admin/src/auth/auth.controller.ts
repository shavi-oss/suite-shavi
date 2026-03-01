import { Controller, Post, Get, Body, Res, Req, HttpCode, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { SessionService } from './session.service';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SessionResponseDto } from './dto/session-response.dto';
import { ExplicitAllow } from '../../guards/explicit-allow.guard';

// Type imports for request/response
type Request = any;
type Response = any;

@Controller('api/platform-admin/auth')
export class AuthController {
  constructor(
    private readonly sessionService: SessionService,
    private readonly authService: AuthService,
  ) {}

  @Post('login')
  @ExplicitAllow()
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ message: string }> {
    // Gate 4: validate credentials before session creation.
    // validateCredentials returns the operator's DB id (UUID) on success,
    // or throws 401 UnauthorizedException on any failure.
    // Fail-closed: wrong email, wrong password, missing env, deactivated → all 401.
    const operatorId = await this.authService.validateCredentials(
      loginDto.email,
      loginDto.password,
    );

    // Only create session after verified credentials.
    // Session stores operatorId (UUID) — SessionGuard will look up by id from now.
    const sessionId = this.sessionService.createSession(operatorId);

    // Set httpOnly cookie per GATE_48_DEV_AUTH_FLOW_LOCK.md Section 3.1
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
  @ExplicitAllow()
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
  @ExplicitAllow()
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
}
