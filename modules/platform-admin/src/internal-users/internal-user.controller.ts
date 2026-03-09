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
import { CreateInternalUserDto, UpdateRoleDto, InternalUserResponseDto } from './dto/create-internal-user.dto';
import { RbacGuard, RequirePermission } from '../security/rbac.guard';
import { SessionGuard } from '../auth/session.guard';
import { ExplicitAllow } from '../../guards/explicit-allow.guard';
import { Resource, Action } from '../security/permissions.map';
import { randomUUID } from 'crypto';

/**
 * Internal User Controller
 * 
 * Scope: LOCKED per MODULE_SCOPE_LOCK.md Section 2.2
 * Endpoints: 4 ONLY
 * Evidence: MODULE_SCOPE_LOCK.md Lines 72-77
 * 
 * MUST: Enforce RBAC on all endpoints
 * MUST: Create audit logs for all administrative actions
 */

@Controller('api/platform-admin/internal-users')
// @ExplicitAllow() + SessionGuard + RbacGuard — see forensic-auth-session for rationale.
@ExplicitAllow()
@UseGuards(SessionGuard, RbacGuard)
export class InternalUserController {
  constructor(private readonly internalUserService: InternalUserService) {}

  /**
   * POST /api/platform-admin/internal-users
   * Create internal user
   */
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

  /**
   * GET /api/platform-admin/internal-users
   * List all internal users
   */
  @Get()
  @RequirePermission(Resource.INTERNAL_USERS, Action.READ)
  async findAll(): Promise<InternalUserResponseDto[]> {
    return this.internalUserService.findAll();
  }

  /**
   * GET /api/platform-admin/internal-users/:id
   * Get single internal user
   */
  @Get(':id')
  @RequirePermission(Resource.INTERNAL_USERS, Action.READ)
  async findById(@Param('id') id: string): Promise<InternalUserResponseDto> {
    return this.internalUserService.findById(id);
  }

  /**
   * PATCH /api/platform-admin/internal-users/:id/deactivate
   * Deactivate internal user
   */
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
   * Change user role — WRITE permission required
   * Gate 9: only platform_admin may assign platform_admin role (enforced in service)
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
}
