import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { AuditController } from '../../../src/audit/audit.controller';
import { AuditService } from '../../../src/audit/audit.service';
import { SessionGuard } from '../../../src/auth/session.guard';
import { RbacGuard } from '../../../src/security/rbac.guard';
import { EntityType, ActionType, ResultType } from '@prisma/client';

describe('AuditController — Fail-Closed Enforcement', () => {
  let controller: AuditController;
  let auditService: AuditService;

  const mockAuditService = {
    queryLogs: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditController],
      providers: [
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
      ],
    })
      .overrideGuard(SessionGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RbacGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<AuditController>(AuditController);
    auditService = module.get<AuditService>(AuditService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/platform-admin/audit-logs', () => {
    it('should query logs with default limit and offset', async () => {
      const mockLogs = [
        {
          id: '1',
          correlationId: 'corr-1',
          entityType: EntityType.organization,
          entityId: 'org-1',
          action: ActionType.create,
          performedBy: 'user-1',
          performedAt: new Date(),
          result: ResultType.success,
        },
      ];

      mockAuditService.queryLogs.mockResolvedValue(mockLogs);

      const result = await controller.queryLogs();

      expect(auditService.queryLogs).toHaveBeenCalledWith({
        entityType: undefined,
        entityId: undefined,
        action: undefined,
        performedBy: undefined,
        startDate: undefined,
        endDate: undefined,
        limit: 100,
        offset: 0,
      });
      expect(result).toEqual(mockLogs);
    });

    it('should query logs with all filters', async () => {
      const mockLogs: any[] = [];
      mockAuditService.queryLogs.mockResolvedValue(mockLogs);

      const result = await controller.queryLogs(
        'organization',
        'org-1',
        'create',
        'user-1',
        '2026-01-01T00:00:00Z',
        '2026-12-31T23:59:59Z',
        '50',
        '10',
      );

      expect(auditService.queryLogs).toHaveBeenCalledWith({
        entityType: EntityType.organization,
        entityId: 'org-1',
        action: ActionType.create,
        performedBy: 'user-1',
        startDate: new Date('2026-01-01T00:00:00Z'),
        endDate: new Date('2026-12-31T23:59:59Z'),
        limit: 50,
        offset: 10,
      });
      expect(result).toEqual(mockLogs);
    });

    it('should reject limit < 1', async () => {
      await expect(
        controller.queryLogs(undefined, undefined, undefined, undefined, undefined, undefined, '0', undefined),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject limit > 1000', async () => {
      await expect(
        controller.queryLogs(undefined, undefined, undefined, undefined, undefined, undefined, '1001', undefined),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject invalid limit', async () => {
      await expect(
        controller.queryLogs(undefined, undefined, undefined, undefined, undefined, undefined, 'invalid', undefined),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject negative offset', async () => {
      await expect(
        controller.queryLogs(undefined, undefined, undefined, undefined, undefined, undefined, undefined, '-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject invalid offset', async () => {
      await expect(
        controller.queryLogs(undefined, undefined, undefined, undefined, undefined, undefined, undefined, 'invalid'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject invalid startDate', async () => {
      await expect(
        controller.queryLogs(undefined, undefined, undefined, undefined, 'invalid-date', undefined, undefined, undefined),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject invalid endDate', async () => {
      await expect(
        controller.queryLogs(undefined, undefined, undefined, undefined, undefined, 'invalid-date', undefined, undefined),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject startDate > endDate', async () => {
      await expect(
        controller.queryLogs(
          undefined,
          undefined,
          undefined,
          undefined,
          '2026-12-31T23:59:59Z',
          '2026-01-01T00:00:00Z',
          undefined,
          undefined,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject invalid entityType', async () => {
      await expect(
        controller.queryLogs('invalid_type', undefined, undefined, undefined, undefined, undefined, undefined, undefined),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject invalid action', async () => {
      await expect(
        controller.queryLogs(undefined, undefined, 'invalid_action', undefined, undefined, undefined, undefined, undefined),
      ).rejects.toThrow(BadRequestException);
    });

    it('should accept valid entityType values', async () => {
      mockAuditService.queryLogs.mockResolvedValue([]);

      await controller.queryLogs('organization', undefined, undefined, undefined, undefined, undefined, undefined, undefined);
      await controller.queryLogs('org_mapping', undefined, undefined, undefined, undefined, undefined, undefined, undefined);
      await controller.queryLogs('internal_user', undefined, undefined, undefined, undefined, undefined, undefined, undefined);

      expect(auditService.queryLogs).toHaveBeenCalledTimes(3);
    });

    it('should accept valid action values', async () => {
      mockAuditService.queryLogs.mockResolvedValue([]);

      await controller.queryLogs(undefined, undefined, 'create', undefined, undefined, undefined, undefined, undefined);
      await controller.queryLogs(undefined, undefined, 'update', undefined, undefined, undefined, undefined, undefined);
      await controller.queryLogs(undefined, undefined, 'suspend', undefined, undefined, undefined, undefined, undefined);
      await controller.queryLogs(undefined, undefined, 'unsuspend', undefined, undefined, undefined, undefined, undefined);
      await controller.queryLogs(undefined, undefined, 'link', undefined, undefined, undefined, undefined, undefined);
      await controller.queryLogs(undefined, undefined, 'deactivate', undefined, undefined, undefined, undefined, undefined);

      expect(auditService.queryLogs).toHaveBeenCalledTimes(6);
    });
  });
});
