import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { SessionGuard } from '../../../src/auth/session.guard';
import { SessionService } from '../../../src/auth/session.service';
import { JwtStorageService } from '../../../src/auth/jwt-storage.service';
import { CoreClient } from '../../../src/core-adapter/core.client';

// Mock contract assertion
jest.mock('../../../src/core-adapter/core.contract.assert', () => ({
  assertCoreEndpointAllowed: jest.fn(),
}));

type Request = any;

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
      ],
    }).compile();

    sessionGuard = module.get<SessionGuard>(SessionGuard);
    sessionService = module.get<SessionService>(SessionService);
    jwtStorageService = module.get<JwtStorageService>(JwtStorageService);
    coreClient = module.get<CoreClient>(CoreClient);

    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Positive Path: Valid Session → Valid JWT → Core Success', () => {
    it('should allow request with valid session, JWT, and successful Core validation', async () => {
      // Setup: Create valid session and JWT
      const userId = 'test-user-123';
      const coreJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';
      const sessionId = sessionService.createSession(userId);
      jwtStorageService.set(userId, coreJwt);

      // Mock request with session cookie
      const mockRequest = {
        cookies: { sessionId },
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

      // Execute: SessionGuard validates session and attaches JWT
      const guardResult = sessionGuard.canActivate(mockContext);

      // Verify: Guard passes
      expect(guardResult).toBe(true);
      expect((mockRequest as any).userId).toBe(userId);
      expect((mockRequest as any).coreJwt).toBe(coreJwt);

      // Execute: CoreClient call with attached JWT
      const coreResult = await coreClient.validateOrganizationExists(
        'core-org-1',
        (mockRequest as any).coreJwt,
        'correlation-123'
      );

      // Verify: Core call succeeds
      expect(coreResult).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://core-api.test/api/v1/organizations/core-org-1',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${coreJwt}`,
            'X-Correlation-Id': 'correlation-123',
          }),
        })
      );
    });
  });

  describe('Negative Path: Missing Session Cookie', () => {
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
        sessionGuard.canActivate(mockContext);
      }).toThrow(UnauthorizedException);
    });
  });

  describe('Negative Path: Invalid Session', () => {
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
        sessionGuard.canActivate(mockContext);
      }).toThrow(UnauthorizedException);
    });
  });

  describe('Negative Path: Expired Session', () => {
    it('should throw 401 when session is expired', () => {
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

      expect(() => {
        sessionGuard.canActivate(mockContext);
      }).toThrow(UnauthorizedException);

      // Restore Date.now
      Date.now = originalDateNow;
    });
  });

  describe('Negative Path: Missing Core JWT', () => {
    it('should throw 401 when Core JWT is missing from storage', () => {
      const userId = 'test-user-123';
      const sessionId = sessionService.createSession(userId);
      // Note: NOT storing Core JWT

      const mockRequest = {
        cookies: { sessionId },
      } as unknown as Request;

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      expect(() => {
        sessionGuard.canActivate(mockContext);
      }).toThrow(UnauthorizedException);
    });
  });

  describe('Negative Path: Missing Correlation ID', () => {
    it('should throw error when correlation ID is missing', async () => {
      const coreJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';

      await expect(
        coreClient.validateOrganizationExists('core-org-1', coreJwt, '')
      ).rejects.toThrow('Correlation ID is required for Core API calls');
    });

    it('should throw error when correlation ID is whitespace only', async () => {
      const coreJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';

      await expect(
        coreClient.validateOrganizationExists('core-org-1', coreJwt, '   ')
      ).rejects.toThrow('Correlation ID is required for Core API calls');
    });
  });

  describe('Negative Path: Core Returns 401', () => {
    it('should throw error when Core returns 401 (fail-closed)', async () => {
      const coreJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';

      const mockFetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
      });
      global.fetch = mockFetch as any;

      await expect(
        coreClient.validateOrganizationExists('core-org-1', coreJwt, 'correlation-123')
      ).rejects.toThrow('Core authentication failed');
    });
  });

  describe('Negative Path: Core Returns 403', () => {
    it('should throw error when Core returns 403 (fail-closed)', async () => {
      const coreJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';

      const mockFetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 403,
      });
      global.fetch = mockFetch as any;

      await expect(
        coreClient.validateOrganizationExists('core-org-1', coreJwt, 'correlation-123')
      ).rejects.toThrow('Core authentication failed');
    });
  });

  describe('Integration: Full Auth Flow with Core Failure', () => {
    it('should fail-closed when valid session/JWT but Core returns 401', async () => {
      // Setup: Create valid session and JWT
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

      // Mock CoreClient 401 failure
      const mockFetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
      });
      global.fetch = mockFetch as any;

      // Execute: SessionGuard validates (should pass)
      const guardResult = sessionGuard.canActivate(mockContext);
      expect(guardResult).toBe(true);

      // Execute: CoreClient call fails with 401
      await expect(
        coreClient.validateOrganizationExists(
          'core-org-1',
          (mockRequest as any).coreJwt,
          'correlation-123'
        )
      ).rejects.toThrow('Core authentication failed');
    });

    it('should fail-closed when valid session/JWT but Core returns 403', async () => {
      // Setup: Create valid session and JWT
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

      // Mock CoreClient 403 failure
      const mockFetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 403,
      });
      global.fetch = mockFetch as any;

      // Execute: SessionGuard validates (should pass)
      const guardResult = sessionGuard.canActivate(mockContext);
      expect(guardResult).toBe(true);

      // Execute: CoreClient call fails with 403
      await expect(
        coreClient.validateOrganizationExists(
          'core-org-1',
          (mockRequest as any).coreJwt,
          'correlation-123'
        )
      ).rejects.toThrow('Core authentication failed');
    });
  });
});
