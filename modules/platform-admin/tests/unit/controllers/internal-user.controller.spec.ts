import { Test, TestingModule } from '@nestjs/testing';
import { InternalUserController } from '../../../src/internal-users/internal-user.controller';
import { InternalUserService } from '../../../src/internal-users/internal-user.service';
import { SessionGuard } from '../../../src/auth/session.guard';
import { RbacGuard } from '../../../src/security/rbac.guard';
import { UserStatus } from '@prisma/client';

describe('InternalUserController', () => {
  let controller: InternalUserController;
  let service: InternalUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InternalUserController],
      providers: [
        {
          provide: InternalUserService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
            deactivate: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(SessionGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RbacGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<InternalUserController>(InternalUserController);
    service = module.get<InternalUserService>(InternalUserService);
  });

  describe('create', () => {
    it('should create internal user with correlation ID from header', async () => {
      const dto = { email: 'test@example.com', name: 'Test User', role: 'platform_admin' as any };
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'platform_admin' as any,
        status: 'active' as any,
        inviteStatus: 'active' as any,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'creator-1',
      };

      const req = {
        headers: { 'x-correlation-id': 'corr-1' },
        user: { id: 'creator-1' },
      };

      jest.spyOn(service, 'create').mockResolvedValue(mockUser);

      const result = await controller.create(dto, req);

      expect(result).toEqual(mockUser);
      expect(service.create).toHaveBeenCalledWith(dto, 'creator-1', 'corr-1');
    });

    it('should generate correlation ID if not provided', async () => {
      const dto = { email: 'test@example.com', name: 'Test User', role: 'platform_admin' as any };
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'platform_admin' as any,
        status: 'active' as any,
        inviteStatus: 'active' as any,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'creator-1',
      };

      const req = {
        headers: {},
        user: { id: 'creator-1' },
      };

      jest.spyOn(service, 'create').mockResolvedValue(mockUser);

      const result = await controller.create(dto, req);

      expect(result).toEqual(mockUser);
      expect(service.create).toHaveBeenCalled();
      const correlationId = (service.create as jest.Mock).mock.calls[0][2];
      expect(correlationId).toBeDefined();
      expect(typeof correlationId).toBe('string');
    });
  });

  describe('findAll', () => {
    it('should return all internal users', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          email: 'user1@example.com',
          name: 'User 1',
          role: 'platform_admin' as any,
          status: 'active' as any,
          inviteStatus: 'active' as any,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'creator-1',
        },
        {
          id: 'user-2',
          email: 'user2@example.com',
          name: 'User 2',
          role: 'viewer' as any,
          status: 'active' as any,
          inviteStatus: 'active' as any,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'creator-1',
        },
      ];

      jest.spyOn(service, 'findAll').mockResolvedValue(mockUsers);

      const result = await controller.findAll();

      expect(result).toEqual(mockUsers);
      expect(result).toHaveLength(2);
    });
  });

  describe('findById', () => {
    it('should return internal user by id', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'platform_admin' as any,
        status: 'active' as any,
        inviteStatus: 'active' as any,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'creator-1',
      };

      jest.spyOn(service, 'findById').mockResolvedValue(mockUser);

      const result = await controller.findById('user-1');

      expect(result).toEqual(mockUser);
      expect(service.findById).toHaveBeenCalledWith('user-1');
    });
  });

  describe('deactivate', () => {
    it('should deactivate internal user with correlation ID from header', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'platform_admin' as any,
        status: 'deactivated' as any,
        inviteStatus: 'active' as any,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'creator-1',
      };

      const req = {
        headers: { 'x-correlation-id': 'corr-1' },
        user: { id: 'admin-1' },
      };

      jest.spyOn(service, 'deactivate').mockResolvedValue(mockUser);

      const result = await controller.deactivate('user-1', req);

      expect(result).toEqual(mockUser);
      expect(service.deactivate).toHaveBeenCalledWith('user-1', 'admin-1', 'corr-1');
    });

    it('should generate correlation ID if not provided', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'platform_admin' as any,
        status: 'deactivated' as any,
        inviteStatus: 'active' as any,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'creator-1',
      };

      const req = {
        headers: {},
        user: { id: 'admin-1' },
      };

      jest.spyOn(service, 'deactivate').mockResolvedValue(mockUser);

      const result = await controller.deactivate('user-1', req);

      expect(result).toEqual(mockUser);
      expect(service.deactivate).toHaveBeenCalled();
      const correlationId = (service.deactivate as jest.Mock).mock.calls[0][2];
      expect(correlationId).toBeDefined();
      expect(typeof correlationId).toBe('string');
    });
  });
});
