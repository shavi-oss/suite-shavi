import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { InternalUserRepository } from '../../../src/internal-users/internal-user.repository';
import { UserStatus } from '@prisma/client';

describe('InternalUserRepository', () => {
  let repository: InternalUserRepository;
  let mockPrismaService: any;

  beforeEach(async () => {
    mockPrismaService = {
      internalUser: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InternalUserRepository,
        {
          provide: 'PrismaService',
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<InternalUserRepository>(InternalUserRepository);
    (repository as any).prisma = mockPrismaService;
  });

  describe('create', () => {
    it('should create internal user with active status', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'platform_admin',
        status: UserStatus.active,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'creator-1',
      };

      mockPrismaService.internalUser.create.mockResolvedValue(mockUser);

      const result = await repository.create('test@example.com', 'Test User', 'platform_admin', 'creator-1');

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.internalUser.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          name: 'Test User',
          role: 'platform_admin',
          createdBy: 'creator-1',
          status: UserStatus.active,
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return all users ordered by createdAt desc', async () => {
      const mockUsers = [
        { id: 'user-1', email: 'user1@example.com', createdAt: new Date() },
        { id: 'user-2', email: 'user2@example.com', createdAt: new Date() },
      ];

      mockPrismaService.internalUser.findMany.mockResolvedValue(mockUsers);

      const result = await repository.findAll();

      expect(result).toEqual(mockUsers);
      expect(mockPrismaService.internalUser.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findById', () => {
    it('should return user by id', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };

      mockPrismaService.internalUser.findUnique.mockResolvedValue(mockUser);

      const result = await repository.findById('user-1');

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.internalUser.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
      });
    });
  });

  describe('findByEmail', () => {
    it('should return user by email', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };

      mockPrismaService.internalUser.findUnique.mockResolvedValue(mockUser);

      const result = await repository.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.internalUser.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });
  });

  describe('updateStatus', () => {
    it('should update user status', async () => {
      const mockUser = { id: 'user-1', status: UserStatus.deactivated };

      mockPrismaService.internalUser.update.mockResolvedValue(mockUser);

      const result = await repository.updateStatus('user-1', UserStatus.deactivated);

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.internalUser.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { status: UserStatus.deactivated },
      });
    });
  });
});
