import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { OrgMappingService } from './org-mapping.service';
import {
  CreateOrgMappingDto,
  OrgMappingResponseDto,
} from './dto/org-mapping.dto';
import { RbacGuard, RequirePermission } from '../security/rbac.guard';
import { Resource, Action } from '../security/permissions.map';
import { SessionGuard } from '../auth/session.guard';
import { randomUUID } from 'crypto';

/**
 * Org Mapping Controller
 * 
 * Scope: LOCKED per MODULE_SCOPE_LOCK.md Section 2.2
 * Endpoints: 3 ONLY
 * Evidence: MODULE_SCOPE_LOCK.md Lines 66-70
 * 
 * MUST: Forward Core JWT for validation
 * MUST: Fail-closed if Core validation fails
 * MUST: Enforce RBAC on all endpoints
 * 
 * Gate 5: RBAC enforcement added per RBAC_SCOPE_MATRIX.md Section 2.2
 */

@Controller('api/platform-admin/org-mappings')
@UseGuards(SessionGuard, RbacGuard)
export class OrgMappingController {
  constructor(private readonly orgMappingService: OrgMappingService) {}

  /**
   * POST /api/platform-admin/org-mappings
   * Link Suite org ↔ Core org
   */
  @Post()
  @RequirePermission(Resource.ORG_MAPPINGS, Action.WRITE)
  async create(
    @Body() dto: CreateOrgMappingDto,
    @Req() req: any,
  ): Promise<OrgMappingResponseDto> {
    const correlationId = req.headers['x-correlation-id'] || randomUUID();
    const userId = req.user.id;
    const coreJwt = req.coreJwt;

    if (!coreJwt) {
      throw new Error('Core JWT is required for org mapping validation');
    }

    return this.orgMappingService.create(dto, userId, coreJwt, correlationId);
  }

  /**
   * GET /api/platform-admin/org-mappings
   * List all mappings
   */
  @Get()
  @RequirePermission(Resource.ORG_MAPPINGS, Action.READ)
  async findAll(): Promise<OrgMappingResponseDto[]> {
    return this.orgMappingService.findAll();
  }

  /**
   * GET /api/platform-admin/org-mappings/:suiteOrgId
   * Get mapping for Suite org
   */
  @Get(':suiteOrgId')
  @RequirePermission(Resource.ORG_MAPPINGS, Action.READ)
  async findBySuiteOrgId(
    @Param('suiteOrgId') suiteOrgId: string,
  ): Promise<OrgMappingResponseDto> {
    return this.orgMappingService.findBySuiteOrgId(suiteOrgId);
  }
}
