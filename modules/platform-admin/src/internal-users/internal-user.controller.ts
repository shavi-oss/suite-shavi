import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { InternalUserService } from './internal-user.service';
import { CreateInternalUserDto, UpdateRoleDto, InternalUserResponseDto, InviteResponseDto } from './dto/create-internal-user.dto';
import { RbacGuard, RequirePermission } from '../security/rbac.guard';
import { SessionGuard } from '../auth/session.guard';
import { ExplicitAllow } from '../../guards/explicit-allow.guard';
import { Resource, Action } from '../security/permissions.map';
import { randomUUID } from 'crypto';

/**
 * Internal User Controller
 * Gate 9: Role change endpoint added
 * Gate 10: Invite generation endpoint added
 */

@Controller('api/platform-admin/internal-users')
@ExplicitAllow()
@UseGuards(SessionGuard, RbacGuard)
export class InternalUserController {
  constructor(private readonly internalUserService: InternalUserService) {}

  /** POST /api/platform-admin/internal-users — Create internal user */
  @Post()
  @RequirePermission(Resource.INTERNAL_USERS, Action.WRITE)
  async create(
    @Body() dto: CreateInternalUserDto,
    @Req() req: any,
  ): Promise<InternalUserResponseDto> {
    const correlationId = req.headers['x-correlation-id'] || randomUUID();
    const userId = req.user.id;
    return this.internalUserService.create(dto, userId, correlationId);
  }

  /** GET /api/platform-admin/internal-users — List all internal users */
  @Get()
  @RequirePermission(Resource.INTERNAL_USERS, Action.READ)
  async findAll(): Promise<InternalUserResponseDto[]> {
    return this.internalUserService.findAll();
  }

  /** GET /api/platform-admin/internal-users/:id — Get single internal user */
  @Get(':id')
  @RequirePermission(Resource.INTERNAL_USERS, Action.READ)
  async findById(@Param('id') id: string): Promise<InternalUserResponseDto> {
    return this.internalUserService.findById(id);
  }

  /** PATCH /api/platform-admin/internal-users/:id/deactivate — Deactivate */
  @Patch(':id/deactivate')
  @RequirePermission(Resource.INTERNAL_USERS, Action.WRITE)
  async deactivate(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<InternalUserResponseDto> {
    const correlationId = req.headers['x-correlation-id'] || randomUUID();
    const userId = req.user.id;
    return this.internalUserService.deactivate(id, userId, correlationId);
  }

  /**
   * PATCH /api/platform-admin/internal-users/:id/role
   * Change user role — Gate 9
   */
  @Patch(':id/role')
  @RequirePermission(Resource.INTERNAL_USERS, Action.WRITE)
  async changeRole(
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
    @Req() req: any,
  ): Promise<InternalUserResponseDto> {
    const correlationId = req.headers['x-correlation-id'] || randomUUID();
    const userId = req.user.id;
    const actorRole = req.user.role;
    return this.internalUserService.changeRole(id, dto.role, actorRole, userId, correlationId);
  }

  /**
   * POST /api/platform-admin/internal-users/:id/invite
   * Generate (or regenerate) one-time invite token — Gate 10
   * WRITE permission only. Returns inviteUrl + expiresAt.
   * Raw token is in URL only — hashed token stored in DB, raw never stored.
   */
  @Post(':id/invite')
  @RequirePermission(Resource.INTERNAL_USERS, Action.WRITE)
  async generateInvite(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<InviteResponseDto> {
    const correlationId = req.headers['x-correlation-id'] || randomUUID();
    const userId = req.user.id;

    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['host'] || req.hostname;
    const baseUrl = `${protocol}://${host}`;

    return this.internalUserService.generateInvite(id, userId, correlationId, baseUrl);
  }
}
