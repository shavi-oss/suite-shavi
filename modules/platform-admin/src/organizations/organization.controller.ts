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
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto, OrganizationResponseDto } from './dto/organization.dto';
import { RbacGuard, RequirePermission } from '../security/rbac.guard';
import { Resource, Action } from '../security/permissions.map';
import { randomUUID } from 'crypto';

/**
 * Organization Controller
 * 
 * Scope: LOCKED per MODULE_SCOPE_LOCK.md Section 2.2
 * Endpoints: 5 ONLY
 * Evidence: MODULE_SCOPE_LOCK.md Lines 58-64
 * 
 * MUST: Enforce RBAC on all endpoints
 * MUST: Create audit logs for all administrative actions
 */

@Controller('api/platform-admin/organizations')
@UseGuards(RbacGuard)
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  /**
   * POST /api/platform-admin/organizations
   * Create Suite organization
   */
  @Post()
  @RequirePermission(Resource.ORGANIZATIONS, Action.WRITE)
  async create(
    @Body() dto: CreateOrganizationDto,
    @Req() req: any,
  ): Promise<OrganizationResponseDto> {
    const correlationId = req.headers['x-correlation-id'] || randomUUID();
    const userId = req.user.id;

    return this.organizationService.create(dto, userId, correlationId);
  }

  /**
   * GET /api/platform-admin/organizations
   * List all Suite organizations
   */
  @Get()
  @RequirePermission(Resource.ORGANIZATIONS, Action.READ)
  async findAll(): Promise<OrganizationResponseDto[]> {
    return this.organizationService.findAll();
  }

  /**
   * GET /api/platform-admin/organizations/:id
   * Get single organization
   */
  @Get(':id')
  @RequirePermission(Resource.ORGANIZATIONS, Action.READ)
  async findById(@Param('id') id: string): Promise<OrganizationResponseDto> {
    return this.organizationService.findById(id);
  }

  /**
   * PATCH /api/platform-admin/organizations/:id/suspend
   * Suspend organization
   */
  @Patch(':id/suspend')
  @RequirePermission(Resource.ORGANIZATIONS, Action.WRITE)
  async suspend(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<OrganizationResponseDto> {
    const correlationId = req.headers['x-correlation-id'] || randomUUID();
    const userId = req.user.id;

    return this.organizationService.suspend(id, userId, correlationId);
  }

  /**
   * PATCH /api/platform-admin/organizations/:id/unsuspend
   * Unsuspend organization
   */
  @Patch(':id/unsuspend')
  @RequirePermission(Resource.ORGANIZATIONS, Action.WRITE)
  async unsuspend(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<OrganizationResponseDto> {
    const correlationId = req.headers['x-correlation-id'] || randomUUID();
    const userId = req.user.id;

    return this.organizationService.unsuspend(id, userId, correlationId);
  }
}
