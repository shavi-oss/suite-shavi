import { Controller, Post, Get, Body, Res, Req, HttpCode, HttpStatus, UnauthorizedException, UseGuards } from '@nestjs/common';
import { SessionService } from './session.service';
import { LoginDto } from './dto/login.dto';
import { SessionResponseDto } from './dto/session-response.dto';
import { ExplicitAllowGuard } from '../../guards/explicit-allow.guard';

// Type imports for request/response
type Request = any;
type Response = any;

@Controller('api/platform-admin/auth')
export class AuthController {
  constructor(private readonly sessionService: SessionService) {}

  @Post('login')
  @UseGuards(ExplicitAllowGuard)
  @HttpCode(HttpStatus.OK)
  login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): { message: string } {
    // TODO: Actual authentication logic (future gate)
    // For now, accept any credentials and create session
    const userId = loginDto.email; // Placeholder: use email as userId

    const sessionId = this.sessionService.createSession(userId);

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
  @UseGuards(ExplicitAllowGuard)
  @HttpCode(HttpStatus.OK)
  logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): { message: string } {
    const sessionId = request.cookies?.sessionId;

    if (sessionId) {
      this.sessionService.clearSession(sessionId);
    }

    // Clear cookie by setting expired date
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
  @UseGuards(ExplicitAllowGuard)
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
      expiresAt: Date.now() + 900000, // Approximate, actual expiry tracked in service
    };
  }
}
