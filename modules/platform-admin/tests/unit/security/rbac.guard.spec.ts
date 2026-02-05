import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RbacGuard, RBAC_METADATA_KEY, RbacRequirement } from '../../../src/security/rbac.guard';
import { Resource, Action } from '../../../src/security/permissions.map';
import { UserRole } from '../../../src/security/roles.enum';

describe('RbacGuard — Fail-Closed Enforcement', () => {
  let guard: RbacGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RbacGuard,
        {
          provide: Reflector,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<RbacGuard>(RbacGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  const createMockContext = (user?: any, requirement?: RbacRequirement): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: () => ({}),
    } as ExecutionContext;
  };

  describe('FAIL-CLOSED: Deny when no RBAC requirement', () => {
    it('should throw UnauthorizedException when no RBAC requirement defined', () => {
      jest.spyOn(reflector, 'get').mockReturnValue(undefined);

      const context = createMockContext({ id: 'user-1', role: UserRole.PLATFORM_ADMIN });

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(context)).toThrow('Unauthorized: No RBAC requirement defined');
    });
  });

  describe('FAIL-CLOSED: Deny when no user context', () => {
    it('should throw UnauthorizedException when no user in request', () => {
      const requirement: RbacRequirement = {
        resource: Resource.ORGANIZATIONS,
        action: Action.READ,
      };
      jest.spyOn(reflector, 'get').mockReturnValue(requirement);

      const context = createMockContext(undefined);

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(context)).toThrow('Unauthorized: No user context');
    });
  });

  describe('FAIL-CLOSED: Deny when no role assigned', () => {
    it('should throw UnauthorizedException when user has no role', () => {
      const requirement: RbacRequirement = {
        resource: Resource.ORGANIZATIONS,
        action: Action.READ,
      };
      jest.spyOn(reflector, 'get').mockReturnValue(requirement);

      const context = createMockContext({ id: 'user-1' }); // No role

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(context)).toThrow('Unauthorized: No role assigned');
    });
  });

  describe('FAIL-CLOSED: Deny when role lacks permission', () => {
    it('should throw UnauthorizedException when VIEWER attempts WRITE', () => {
      const requirement: RbacRequirement = {
        resource: Resource.ORGANIZATIONS,
        action: Action.WRITE,
      };
      jest.spyOn(reflector, 'get').mockReturnValue(requirement);

      const context = createMockContext({ id: 'user-1', role: UserRole.VIEWER });

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(context)).toThrow('Insufficient permissions');
    });

    it('should throw UnauthorizedException when SUPPORT attempts WRITE', () => {
      const requirement: RbacRequirement = {
        resource: Resource.INTERNAL_USERS,
        action: Action.WRITE,
      };
      jest.spyOn(reflector, 'get').mockReturnValue(requirement);

      const context = createMockContext({ id: 'user-1', role: UserRole.SUPPORT });

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(context)).toThrow('Insufficient permissions');
    });

    it('should throw UnauthorizedException when DEVELOPER_OPS attempts WRITE on INTERNAL_USERS', () => {
      const requirement: RbacRequirement = {
        resource: Resource.INTERNAL_USERS,
        action: Action.WRITE,
      };
      jest.spyOn(reflector, 'get').mockReturnValue(requirement);

      const context = createMockContext({ id: 'user-1', role: UserRole.DEVELOPER_OPS });

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(context)).toThrow('Insufficient permissions');
    });
  });

  describe('ALLOW: When role has permission', () => {
    it('should allow PLATFORM_ADMIN to WRITE ORGANIZATIONS', () => {
      const requirement: RbacRequirement = {
        resource: Resource.ORGANIZATIONS,
        action: Action.WRITE,
      };
      jest.spyOn(reflector, 'get').mockReturnValue(requirement);

      const context = createMockContext({ id: 'user-1', role: UserRole.PLATFORM_ADMIN });

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow VIEWER to READ ORGANIZATIONS', () => {
      const requirement: RbacRequirement = {
        resource: Resource.ORGANIZATIONS,
        action: Action.READ,
      };
      jest.spyOn(reflector, 'get').mockReturnValue(requirement);

      const context = createMockContext({ id: 'user-1', role: UserRole.VIEWER });

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow DEVELOPER_OPS to WRITE ORG_MAPPINGS', () => {
      const requirement: RbacRequirement = {
        resource: Resource.ORG_MAPPINGS,
        action: Action.WRITE,
      };
      jest.spyOn(reflector, 'get').mockReturnValue(requirement);

      const context = createMockContext({ id: 'user-1', role: UserRole.DEVELOPER_OPS });

      expect(guard.canActivate(context)).toBe(true);
    });
  });
});
