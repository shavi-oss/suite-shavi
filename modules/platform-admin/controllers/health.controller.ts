/**
 * Health Controller — platform-admin
 * 
 * GATE 4.9 — FIRST OPT-IN ENDPOINT
 * Health check endpoint with explicit opt-in via ExplicitAllowGuard.
 */

import { Controller, Get, UseGuards } from '@nestjs/common';
import { ExplicitAllowGuard } from '../guards';
import { HealthResponseDto } from '../dto';

@Controller('platform-admin')
export class HealthController {
  @Get('health')
  @UseGuards(ExplicitAllowGuard)
  getHealth(): HealthResponseDto {
    return {
      status: 'ok',
      module: 'platform-admin',
      timestamp: new Date().toISOString(),
    };
  }
}
