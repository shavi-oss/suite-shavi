import { Test, TestingModule } from '@nestjs/testing';
import { AuditService } from '../../../src/audit/audit.service';
import { AuditRepository } from '../../../src/audit/audit.repository';
import { EntityType, ActionType, ResultType } from '@prisma/client';

describe('AuditService — Fail-Closed Enforcement', () => {
  let service: AuditService;
  let repository: AuditRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        {
          provide: AuditRepository,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
    repository = module.get<AuditRepository>(AuditRepository);
  });

  describe('FAIL-CLOSED: Propagate audit failures', () => {
    it('should throw error if audit repository throws', async () => {
      const mockError = new Error('Database connection failed');
      jest.spyOn(repository, 'create').mockRejectedValue(mockError);

      const params = {
        correlationId: 'test-correlation-id',
        entityType: EntityType.organization,
        entityId: 'org-123',
        action: ActionType.create,
        performedBy: 'user-123',
        result: ResultType.success,
      };

      await expect(service.logAction(params)).rejects.toThrow('AUDIT_WRITE_FAILED');
    });

    it('should NOT swallow exceptions', async () => {
      const mockError = new Error('Prisma error');
      jest.spyOn(repository, 'create').mockRejectedValue(mockError);

      const params = {
        correlationId: 'test-correlation-id',
        entityType: EntityType.org_mapping,
        entityId: 'mapping-123',
        action: ActionType.link,
        performedBy: 'user-123',
        result: ResultType.failure,
      };

      // Verify that the error is thrown, not swallowed
      await expect(service.logAction(params)).rejects.toThrow();
    });

    it('should throw generic error message (no sensitive data leak)', async () => {
      const mockError = new Error('Secret database password exposed');
      jest.spyOn(repository, 'create').mockRejectedValue(mockError);

      const params = {
        correlationId: 'test-correlation-id',
        entityType: EntityType.internal_user,
        entityId: 'user-123',
        action: ActionType.deactivate,
        performedBy: 'admin-123',
        result: ResultType.success,
      };

      // Verify that the thrown error does NOT include sensitive details
      await expect(service.logAction(params)).rejects.toThrow('AUDIT_WRITE_FAILED');
      await expect(service.logAction(params)).rejects.not.toThrow('Secret database password');
    });
  });

  describe('SUCCESS: Audit log creation', () => {
    it('should create audit log successfully', async () => {
      const mockAuditLog = {
        id: 'audit-123',
        correlationId: 'test-correlation-id',
        entityType: EntityType.organization,
        entityId: 'org-123',
        action: ActionType.create,
        performedBy: 'user-123',
        performedAt: new Date(),
        result: ResultType.success,
        metadata: null,
      };

      jest.spyOn(repository, 'create').mockResolvedValue(mockAuditLog as any);

      const params = {
        correlationId: 'test-correlation-id',
        entityType: EntityType.organization,
        entityId: 'org-123',
        action: ActionType.create,
        performedBy: 'user-123',
        result: ResultType.success,
      };

      await expect(service.logAction(params)).resolves.not.toThrow();
      expect(repository.create).toHaveBeenCalledWith(params, undefined);
    });
  });
});
