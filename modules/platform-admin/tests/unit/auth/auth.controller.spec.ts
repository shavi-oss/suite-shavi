import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../../src/auth/auth.controller';
import { SessionService } from '../../../src/auth/session.service';
import { UnauthorizedException } from '@nestjs/common';

type Response = any;
type Request = any;

describe('AuthController', () => {
  let controller: AuthController;
  let sessionService: SessionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [SessionService],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    sessionService = module.get<SessionService>(SessionService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should create session and set httpOnly cookie', () => {
      const loginDto = { email: 'test@example.com', password: 'password' };
      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      const result = controller.login(loginDto, mockResponse);

      expect(result).toEqual({ message: 'Login successful' });
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'sessionId',
        expect.any(String),
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'strict',
          path: '/',
          maxAge: 900000,
        }),
      );
    });

    it('should set secure cookie in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const loginDto = { email: 'test@example.com', password: 'password' };
      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      controller.login(loginDto, mockResponse);

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'sessionId',
        expect.any(String),
        expect.objectContaining({
          secure: true,
        }),
      );

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('logout', () => {
    it('should clear session and expire cookie', () => {
      const sessionId = sessionService.createSession('test-user');
      const mockRequest = {
        cookies: { sessionId },
      } as unknown as Request;
      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      const result = controller.logout(mockRequest, mockResponse);

      expect(result).toEqual({ message: 'Logout successful' });
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'sessionId',
        '',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'strict',
          path: '/',
          maxAge: 0,
        }),
      );

      // Verify session is cleared
      const validationResult = sessionService.validateSession(sessionId);
      expect(validationResult).toBeNull();
    });

    it('should not throw error when no session cookie exists', () => {
      const mockRequest = {
        cookies: {},
      } as unknown as Request;
      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      expect(() => {
        controller.logout(mockRequest, mockResponse);
      }).not.toThrow();
    });
  });

  describe('getSession', () => {
    it('should return session info for valid session', () => {
      const userId = 'test-user-123';
      const sessionId = sessionService.createSession(userId);
      const mockRequest = {
        cookies: { sessionId },
      } as unknown as Request;

      const result = controller.getSession(mockRequest);

      expect(result).toEqual({
        userId,
        expiresAt: expect.any(Number),
      });
    });

    it('should throw 401 when session cookie is missing', () => {
      const mockRequest = {
        cookies: {},
      } as unknown as Request;

      expect(() => {
        controller.getSession(mockRequest);
      }).toThrow(UnauthorizedException);
    });

    it('should throw 401 when session is invalid', () => {
      const mockRequest = {
        cookies: { sessionId: 'invalid-session-id' },
      } as unknown as Request;

      expect(() => {
        controller.getSession(mockRequest);
      }).toThrow(UnauthorizedException);
    });

    it('should throw 401 with safe error message', () => {
      const mockRequest = {
        cookies: {},
      } as unknown as Request;

      try {
        controller.getSession(mockRequest);
        fail('Should have thrown UnauthorizedException');
      } catch (error: any) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toBe('Unauthorized access. Please contact your administrator.');
      }
    });
  });
});
