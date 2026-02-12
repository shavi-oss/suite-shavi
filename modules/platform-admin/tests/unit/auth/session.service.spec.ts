import { Test, TestingModule } from '@nestjs/testing';
import { SessionService } from '../../../src/auth/session.service';

describe('SessionService', () => {
  let service: SessionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SessionService],
    }).compile();

    service = module.get<SessionService>(SessionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSession', () => {
    it('should create a session and return sessionId', () => {
      const userId = 'test-user-123';
      const sessionId = service.createSession(userId);

      expect(sessionId).toBeDefined();
      expect(typeof sessionId).toBe('string');
      expect(sessionId.length).toBeGreaterThan(0);
    });

    it('should create unique session IDs', () => {
      const userId = 'test-user-123';
      const sessionId1 = service.createSession(userId);
      const sessionId2 = service.createSession(userId);

      expect(sessionId1).not.toBe(sessionId2);
    });
  });

  describe('validateSession', () => {
    it('should return userId for valid session', () => {
      const userId = 'test-user-123';
      const sessionId = service.createSession(userId);

      const result = service.validateSession(sessionId);

      expect(result).toBe(userId);
    });

    it('should return null for non-existent session', () => {
      const result = service.validateSession('non-existent-session-id');

      expect(result).toBeNull();
    });

    it('should return null for expired session', () => {
      const userId = 'test-user-123';
      const sessionId = service.createSession(userId);

      // Fast-forward time by mocking Date.now()
      const originalDateNow = Date.now;
      Date.now = jest.fn(() => originalDateNow() + 901000); // 15 minutes + 1 second

      const result = service.validateSession(sessionId);

      expect(result).toBeNull();

      // Restore Date.now
      Date.now = originalDateNow;
    });

    it('should delete expired session on validation', () => {
      const userId = 'test-user-123';
      const sessionId = service.createSession(userId);

      // Fast-forward time
      const originalDateNow = Date.now;
      Date.now = jest.fn(() => originalDateNow() + 901000);

      service.validateSession(sessionId);

      // Restore Date.now
      Date.now = originalDateNow;

      // Validate again - should still be null (deleted)
      const result = service.validateSession(sessionId);
      expect(result).toBeNull();
    });
  });

  describe('clearSession', () => {
    it('should clear existing session', () => {
      const userId = 'test-user-123';
      const sessionId = service.createSession(userId);

      service.clearSession(sessionId);

      const result = service.validateSession(sessionId);
      expect(result).toBeNull();
    });

    it('should not throw error when clearing non-existent session', () => {
      expect(() => {
        service.clearSession('non-existent-session-id');
      }).not.toThrow();
    });
  });
});
