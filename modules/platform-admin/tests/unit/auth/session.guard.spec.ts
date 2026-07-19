import { Test, TestingModule } from '@nestjs/testing';
import { SessionGuard } from '../../../src/auth/session.guard';
import { SessionService } from '../../../src/auth/session.service';
import { JwtStorageService } from '../../../src/auth/jwt-storage.service';
import { InternalUserRepository } from '../../../src/internal-users/internal-user.repository';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { UserStatus } from '@prisma/client';
import { generateKeyPairSync } from 'crypto';

type Request = any;

/** Generate an in-memory RSA signing key and expose it via env (test-only). */
function makeTestSigningKey(): void {
  const { privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });
  process.env.PLATFORM_ADMIN_JWT_PRIVATE_KEY_PEM_B64 = Buffer.from(privateKey).toString('base64');
  process.env.PLATFORM_ADMIN_JWT_KID = 'test-kid';
}

function clearSigningKey(): void {
  delete process.env.PLATFORM_ADMIN_JWT_PRIVATE_KEY_PEM_B64;
  delete process.env.PLATFORM_ADMIN_JWT_KID;
}

const mockInternalUserRepository = {
  findById: jest.fn(),
};

describe('SessionGuard', () => {
  let guard: SessionGuard;
  let sessionService: SessionService;
  let jwtStorageService: JwtStorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionGuard,
        SessionService,
        JwtStorageService,
        { provide: InternalUserRepository, useValue: mockInternalUserRepository },
      ],
    }).compile();

    guard = module.get<SessionGuard>(SessionGuard);
    sessionService = module.get<SessionService>(SessionService);
    jwtStorageService = module.get<JwtStorageService>(JwtStorageService);
    // Default: valid, active operator so the guard passes the DB lookup.
    mockInternalUserRepository.findById.mockResolvedValue({
      id: 'test-user-123',
      role: 'admin',
      status: UserStatus.active,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    clearSigningKey();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true for valid session on a READ route (no coreJwt minted)', async () => {
      const userId = 'test-user-123';
      const sessionId = sessionService.createSession(userId);

      const mockRequest = {
        cookies: { sessionId },
      } as unknown as Request;

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect((mockRequest as any).userId).toBe(userId);
      // READ routes must NOT mint a coreJwt — controllers guard their own need.
      expect((mockRequest as any).coreJwt).toBeUndefined();
    });

    it('should mint a Core JWT on a WRITE route when signing key is configured', async () => {
      const userId = 'test-user-123';
      const sessionId = sessionService.createSession(userId);
      makeTestSigningKey();

      const mockRequest = {
        cookies: { sessionId },
        method: 'POST',
        path: '/api/platform-admin/organizations',
      } as unknown as Request;

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect((mockRequest as any).userId).toBe(userId);
      // Gate 5: WRITE route mints a short-lived RS256 JWT.
      expect(typeof (mockRequest as any).coreJwt).toBe('string');
      expect((mockRequest as any).coreJwt).toMatch(/^eyJ/);
    });

    it('should throw 401 when Core write auth is not configured (WRITE route, missing env)', async () => {
      const userId = 'test-user-123';
      const sessionId = sessionService.createSession(userId);
      clearSigningKey();

      const mockRequest = {
        cookies: { sessionId },
        method: 'POST',
        path: '/api/platform-admin/organizations',
      } as unknown as Request;

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        'Core write auth not configured',
      );
    });

    it('should throw 401 when session cookie is missing', async () => {
      const mockRequest = {
        cookies: {},
      } as unknown as Request;

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      await expect(guard.canActivate(mockContext)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw 401 when session is invalid', async () => {
      const mockRequest = {
        cookies: { sessionId: 'invalid-session-id' },
      } as unknown as Request;

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      await expect(guard.canActivate(mockContext)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw 401 when session is expired', async () => {
      const userId = 'test-user-123';
      const sessionId = sessionService.createSession(userId);

      // Fast-forward time beyond session expiry
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

      try {
        await expect(guard.canActivate(mockContext)).rejects.toThrow(UnauthorizedException);
      } finally {
        // Restore Date.now
        Date.now = originalDateNow;
      }
    });

    it('should throw 401 with safe error message', async () => {
      const mockRequest = {
        cookies: {},
      } as unknown as Request;

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        'Unauthorized access. Please contact your administrator.',
      );
    });

    it('should attach userId to request on successful validation', async () => {
      const userId = 'test-user-123';
      const sessionId = sessionService.createSession(userId);

      const mockRequest = {
        cookies: { sessionId },
      } as unknown as Request;

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      await guard.canActivate(mockContext);

      expect((mockRequest as any).userId).toBe(userId);
    });

    it('should throw 401 when operator is deactivated', async () => {
      const userId = 'test-user-123';
      const sessionId = sessionService.createSession(userId);
      mockInternalUserRepository.findById.mockResolvedValue({
        id: userId,
        role: 'admin',
        status: UserStatus.deactivated,
      });

      const mockRequest = {
        cookies: { sessionId },
      } as unknown as Request;

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      await expect(guard.canActivate(mockContext)).rejects.toThrow(UnauthorizedException);
    });
  });
});
