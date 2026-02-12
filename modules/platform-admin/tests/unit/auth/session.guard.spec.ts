import { Test, TestingModule } from '@nestjs/testing';
import { SessionGuard } from '../../../src/auth/session.guard';
import { SessionService } from '../../../src/auth/session.service';
import { JwtStorageService } from '../../../src/auth/jwt-storage.service';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

type Request = any;

describe('SessionGuard', () => {
  let guard: SessionGuard;
  let sessionService: SessionService;
  let jwtStorageService: JwtStorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SessionGuard, SessionService, JwtStorageService],
    }).compile();

    guard = module.get<SessionGuard>(SessionGuard);
    sessionService = module.get<SessionService>(SessionService);
    jwtStorageService = module.get<JwtStorageService>(JwtStorageService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true for valid session with Core JWT', () => {
      const userId = 'test-user-123';
      const coreJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';
      const sessionId = sessionService.createSession(userId);
      jwtStorageService.set(userId, coreJwt);

      const mockRequest = {
        cookies: { sessionId },
      } as unknown as Request;

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect((mockRequest as any).userId).toBe(userId);
      expect((mockRequest as any).coreJwt).toBe(coreJwt);
    });

    it('should throw 401 when session cookie is missing', () => {
      const mockRequest = {
        cookies: {},
      } as unknown as Request;

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      expect(() => {
        guard.canActivate(mockContext);
      }).toThrow(UnauthorizedException);
    });

    it('should throw 401 when session is invalid', () => {
      const mockRequest = {
        cookies: { sessionId: 'invalid-session-id' },
      } as unknown as Request;

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      expect(() => {
        guard.canActivate(mockContext);
      }).toThrow(UnauthorizedException);
    });

    it('should throw 401 when session is expired', () => {
      const userId = 'test-user-123';
      const sessionId = sessionService.createSession(userId);

      // Fast-forward time
      const originalDateNow = Date.now;
      Date.now = jest.fn(() => originalDateNow() + 901000);

      const mockRequest = {
        cookies: { sessionId },
      } as unknown as Request;

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      expect(() => {
        guard.canActivate(mockContext);
      }).toThrow(UnauthorizedException);

      // Restore Date.now
      Date.now = originalDateNow;
    });

    it('should throw 401 with safe error message', () => {
      const mockRequest = {
        cookies: {},
      } as unknown as Request;

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      try {
        guard.canActivate(mockContext);
        fail('Should have thrown UnauthorizedException');
      } catch (error: any) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toBe('Unauthorized access. Please contact your administrator.');
      }
    });

    it('should attach userId to request on successful validation', () => {
      const userId = 'test-user-123';
      const coreJwt = 'jwt-token';
      const sessionId = sessionService.createSession(userId);
      jwtStorageService.set(userId, coreJwt);

      const mockRequest = {
        cookies: { sessionId },
      } as unknown as Request;

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      guard.canActivate(mockContext);

      expect((mockRequest as any).userId).toBe(userId);
    });

    it('should throw 401 when Core JWT is missing (fail-closed)', () => {
      const userId = 'test-user-123';
      const sessionId = sessionService.createSession(userId);
      // Note: NOT storing Core JWT in jwtStorageService

      const mockRequest = {
        cookies: { sessionId },
      } as unknown as Request;

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      expect(() => {
        guard.canActivate(mockContext);
      }).toThrow(UnauthorizedException);
    });

    it('should attach Core JWT to request context', () => {
      const userId = 'test-user-123';
      const coreJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';
      const sessionId = sessionService.createSession(userId);
      jwtStorageService.set(userId, coreJwt);

      const mockRequest = {
        cookies: { sessionId },
      } as unknown as Request;

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      guard.canActivate(mockContext);

      expect((mockRequest as any).coreJwt).toBe(coreJwt);
    });
  });
});
