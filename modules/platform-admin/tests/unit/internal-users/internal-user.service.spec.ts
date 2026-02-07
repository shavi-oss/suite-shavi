import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { InternalUserService } from '../../../src/internal-users/internal-user.service';
import { InternalUserRepository } from '../../../src/internal-users/internal-user.repository';
import { AuditService } from '../../../src/audit/audit.service';
import { UserStatus, UserRole } from '@prisma/client';

describe('InternalUserService', () => {
  let service: InternalUserService;
  let repository: InternalUserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InternalUserService,
        {
          provide: InternalUserRepository,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
            findByEmail: jest.fn(),
            updateStatus: jest.fn(),
          },
        },
        {
          provide: AuditService,
          useValue: {
            logAction: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<InternalUserService>(InternalUserService);
    repository = module.get<InternalUserRepository>(InternalUserRepository);
  });

  describe('create', () => {
    it('should create internal user', async () => {
      const dto = { email: 'test@example.com', name: 'Test User', role: 'platform_admin' as any };
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.platform_admin,
        status: UserStatus.active,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'creator-1',
      };

      jest.spyOn(repository, 'findByEmail').mockResolvedValue(null);
      
      // Mock $transaction to execute callback immediately
      (repository as any).prisma = {
        $transaction: jest.fn(async (callback) => callback({
          internalUser: {
            create: jest.fn().mockResolvedValue(mockUser),
          },
        })),
      };

      const result = await service.create(dto, 'creator-1', 'corr-1');

      expect(result.id).toBe('user-1');
      expect(repository.findByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should throw BadRequestException if email already exists', async () => {
      const dto = { email: 'test@example.com', name: 'Test User', role: 'platform_admin' as any };
      const existingUser = { id: 'user-1', email: 'test@example.com' };

      jest.spyOn(repository, 'findByEmail').mockResolvedValue(existingUser as any);

      await expect(service.create(dto, 'creator-1', 'corr-1')).rejects.toThrow(BadRequestException);
      await expect(service.create(dto, 'creator-1', 'corr-1')).rejects.toThrow('Email already exists');
    });

    it('should throw error if create fails', async () => {
      const dto = { email: 'test@example.com', name: 'Test User', role: 'platform_admin' as any };
      const error = new Error('Database error');

      jest.spyOn(repository, 'findByEmail').mockResolvedValue(null);
      (repository as any).prisma = {
        $transaction: jest.fn().mockRejectedValue(error),
      };

      await expect(service.create(dto, 'creator-1', 'corr-1')).rejects.toThrow('INTERNAL_USER_CREATE_FAILED');
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const mockUsers = [
        { id: 'user-1', email: 'user1@example.com', name: 'User 1', role: UserRole.platform_admin, status: UserStatus.active, createdAt: new Date(), updatedAt: new Date(), createdBy: 'creator-1' },
        { id: 'user-2', email: 'user2@example.com', name: 'User 2', role: UserRole.viewer, status: UserStatus.active, createdAt: new Date(), updatedAt: new Date(), createdBy: 'creator-1' },
      ];

      jest.spyOn(repository, 'findAll').mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('user-1');
      expect(result[1].id).toBe('user-2');
    });
  });

  describe('findById', () => {
    it('should return user by id', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.platform_admin,
        status: UserStatus.active,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'creator-1',
      };

      jest.spyOn(repository, 'findById').mockResolvedValue(mockUser);

      const result = await service.findById('user-1');

      expect(result.id).toBe('user-1');
      expect(result.email).toBe('test@example.com');
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValue(null);

      await expect(service.findById('user-1')).rejects.toThrow(NotFoundException);
      await expect(service.findById('user-1')).rejects.toThrow('Internal user user-1 not found');
    });
  });

  describe('deactivate', () => {
    it('should deactivate user', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.platform_admin,
        status: UserStatus.active,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'creator-1',
      };

      const updatedUser = { ...mockUser, status: UserStatus.deactivated };

      jest.spyOn(repository, 'findById').mockResolvedValue(mockUser);
      
      // Mock $transaction to execute callback immediately
      (repository as any).prisma = {
        $transaction: jest.fn(async (callback) => callback({
          internalUser: {
            update: jest.fn().mockResolvedValue(updatedUser),
          },
        })),
      };

      const result = await service.deactivate('user-1', 'admin-1', 'corr-1');

      expect(result.status).toBe('deactivated');
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValue(null);

      await expect(service.deactivate('user-1', 'admin-1', 'corr-1')).rejects.toThrow(NotFoundException);
      await expect(service.deactivate('user-1', 'admin-1', 'corr-1')).rejects.toThrow('Internal user user-1 not found');
    });

    it('should throw BadRequestException if user already deactivated', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.platform_admin,
        status: UserStatus.deactivated,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'creator-1',
      };

      jest.spyOn(repository, 'findById').mockResolvedValue(mockUser);

      await expect(service.deactivate('user-1', 'admin-1', 'corr-1')).rejects.toThrow(BadRequestException);
      await expect(service.deactivate('user-1', 'admin-1', 'corr-1')).rejects.toThrow('Internal user user-1 is already deactivated');
    });

    it('should throw error if deactivate fails', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.platform_admin,
        status: UserStatus.active,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'creator-1',
      };

      const error = new Error('Database error');

      jest.spyOn(repository, 'findById').mockResolvedValue(mockUser);
      (repository as any).prisma = {
        $transaction: jest.fn().mockRejectedValue(error),
      };

      await expect(service.deactivate('user-1', 'admin-1', 'corr-1')).rejects.toThrow('INTERNAL_USER_DEACTIVATE_FAILED');
    });
  });
});
