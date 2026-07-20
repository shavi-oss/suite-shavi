import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { SessionGuard } from '../../../src/auth/session.guard';
import { SessionService } from '../../../src/auth/session.service';
import { JwtStorageService } from '../../../src/auth/jwt-storage.service';
import { CoreClient } from '../../../src/core-adapter/core.client';
import { InternalUserRepository } from '../../../src/internal-users/internal-user.repository';
import { UserStatus } from '@prisma/client';
import { generateKeyPairSync } from 'crypto';

// Mock contract assertion
jest.mock('../../../src/core-adapter/core.contract.assert', () => ({
  assertCoreEndpointAllowed: jest.fn(),
}));

type Request = any;

const mockInternalUserRepository = {
  findById: jest.fn(),
};

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

const validOperator = (userId: string) => ({
  id: userId,
  role: 'admin',
  status: UserStatus.active,
});

describe('Auth Flow Integration', () => {
  let sessionGuard: SessionGuard;
  let sessionService: SessionService;
  let jwtStorageService: JwtStorageService;
  let coreClient: CoreClient;
  const originalEnv = process.env;

  beforeEach(async () => {
    jest.resetModules();
    process.env = { ...originalEnv, CORE_API_BASE_URL: 'http://core-api.test' };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionGuard,
        SessionService,
        JwtStorageService,
        CoreClient,
        { provide: InternalUserRepository, useValue: mockInternalUserRepository },
      ],
    }).compile();

    sessionGuard = module.get<SessionGuard>(SessionGuard);
    sessionService = module.get<SessionService>(SessionService);
    jwtStorageService = module.get<JwtStorageService>(JwtStorageService);
    coreClient = module.get<CoreClient>(CoreClient);

    // Default: valid, active operator so the guard passes the DB lookup.
    mockInternalUserRepository.findById.mockResolvedValue(validOperator('test-user-123'));

    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
    clearSigningKey();
  });

  describe('Positive Path: Valid Session → Minted JWT → Core Success', () => {
    it('should allow request with valid session, minted JWT, and successful Core validation', async () => {
      // Setup: Create valid session
      const userId = 'test-user-123';
      const sessionId = sessionService.createSession(userId);
      makeTestSigningKey();

      // WRITE route → guard mints a Core JWT (Gate 5)
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

      // Mock CoreClient success
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
      });
      global.fetch = mockFetch as any;

      // Execute: SessionGuard validates session and mints JWT
      const guardResult = await sessionGuard.canActivate(mockContext);

      // Verify: Guard passes and mints a Core JWT
      expect(guardResult).toBe(true);
      expect((mockRequest as any).userId).toBe(userId);
      const mintedJwt = (mockRequest as any).coreJwt;
      expect(typeof mintedJwt).toBe('string');
      expect(mintedJwt).toMatch(/^eyJ/);

      // Execute: CoreClient call with the minted JWT
      const coreResult = await coreClient.validateOrganizationExists(
        'core-org-1',
        mintedJwt,
        'correlation-123',
      );

      // Verify: Core call succeeds with the forwarded minted JWT
      expect(coreResult).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://core-api.test/api/v2/admin/organizations/core-org-1',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: `Bearer ${mintedJwt}`,
            'X-Correlation-Id': 'correlation-123',
          }),
        }),
      );
    });
  });

  describe('Negative Path: Missing Session Cookie', () => {
    it('should throw 401 when session cookie is missing', async () => {
      const mockRequest = {
        cookies: {},
      } as unknown as Request;

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      await expect(sessionGuard.canActivate(mockContext)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('Negative Path: Invalid Session', () => {
    it('should throw 401 when session is invalid', async () => {
      const mockRequest = {
        cookies: { sessionId: 'invalid-session-id' },
      } as unknown as Request;

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      await expect(sessionGuard.canActivate(mockContext)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('Negative Path: Expired Session', () => {
    it('should throw 401 when session is expired', async () => {
      const userId = 'test-user-123';
      const sessionId = sessionService.createSession(userId);

      // Fast-forward time beyond session expiry (15 minutes)
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
        await expect(sessionGuard.canActivate(mockContext)).rejects.toThrow(UnauthorizedException);
      } finally {
        // Restore Date.now
        Date.now = originalDateNow;
      }
    });
  });

  describe('Negative Path: Core write auth not configured', () => {
    it('should throw 401 on a WRITE route when signing key env is missing', async () => {
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

      await expect(sessionGuard.canActivate(mockContext)).rejects.toThrow(
        'Core write auth not configured',
      );
    });
  });

  describe('Negative Path: Missing Correlation ID', () => {
    it('should throw error when correlation ID is missing', async () => {
      const coreJwt = 'eyJhbG...test';

      await expect(
        coreClient.validateOrganizationExists('core-org-1', coreJwt, ''),
      ).rejects.toThrow('Correlation ID is required for Core API calls');
    });

    it('should throw error when correlation ID is whitespace only', async () => {
      const coreJwt = 'eyJhbG...test';

      await expect(
        coreClient.validateOrganizationExists('core-org-1', coreJwt, '   '),
      ).rejects.toThrow('Correlation ID is required for Core API calls');
    });
  });

  describe('Negative Path: Core Returns 401', () => {
    it('should throw error when Core returns 401 (fail-closed)', async () => {
      const coreJwt = 'eyJhbG...test';

      const mockFetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
      });
      global.fetch = mockFetch as any;

      await expect(
        coreClient.validateOrganizationExists('core-org-1', coreJwt, 'correlation-123'),
      ).rejects.toThrow('Core authentication failed');
    });
  });

  describe('Negative Path: Core Returns 403', () => {
    it('should throw error when Core returns 403 (fail-closed)', async () => {
      const coreJwt = 'eyJhbG...test';

      const mockFetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 403,
      });
      global.fetch = mockFetch as any;

      await expect(
        coreClient.validateOrganizationExists('core-org-1', coreJwt, 'correlation-123'),
      ).rejects.toThrow('Core authentication failed');
    });
  });

  describe('Integration: Full Auth Flow with Core Failure', () => {
    it('should fail-closed when valid session/minted JWT but Core returns 401', async () => {
      // Setup: Create valid session
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

      // Mock CoreClient 401 failure
      const mockFetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
      });
      global.fetch = mockFetch as any;

      // Execute: SessionGuard validates (should pass and mint)
      const guardResult = await sessionGuard.canActivate(mockContext);
      expect(guardResult).toBe(true);
      const mintedJwt = (mockRequest as any).coreJwt;
      expect(typeof mintedJwt).toBe('string');

      // Execute: CoreClient call fails with 401
      await expect(
        coreClient.validateOrganizationExists('core-org-1', mintedJwt, 'correlation-123'),
      ).rejects.toThrow('Core authentication failed');
    });

    it('should fail-closed when valid session/minted JWT but Core returns 403', async () => {
      // Setup: Create valid session
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

      // Mock CoreClient 403 failure
      const mockFetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 403,
      });
      global.fetch = mockFetch as any;

      // Execute: SessionGuard validates (should pass and mint)
      const guardResult = await sessionGuard.canActivate(mockContext);
      expect(guardResult).toBe(true);
      const mintedJwt = (mockRequest as any).coreJwt;

      // Execute: CoreClient call fails with 403
      await expect(
        coreClient.validateOrganizationExists('core-org-1', mintedJwt, 'correlation-123'),
      ).rejects.toThrow('Core authentication failed');
    });
  });
});
