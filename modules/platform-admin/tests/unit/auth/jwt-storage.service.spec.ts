import { Test, TestingModule } from '@nestjs/testing';
import { JwtStorageService } from '../../../src/auth/jwt-storage.service';

describe('JwtStorageService', () => {
  let service: JwtStorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtStorageService],
    }).compile();

    service = module.get<JwtStorageService>(JwtStorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('set', () => {
    it('should store Core JWT by userId', () => {
      const userId = 'test-user-123';
      const coreJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';

      service.set(userId, coreJwt);

      const retrieved = service.get(userId);
      expect(retrieved).toBe(coreJwt);
    });

    it('should overwrite existing JWT for same userId', () => {
      const userId = 'test-user-123';
      const coreJwt1 = 'jwt-token-1';
      const coreJwt2 = 'jwt-token-2';

      service.set(userId, coreJwt1);
      service.set(userId, coreJwt2);

      const retrieved = service.get(userId);
      expect(retrieved).toBe(coreJwt2);
    });
  });

  describe('get', () => {
    it('should return Core JWT for existing userId', () => {
      const userId = 'test-user-123';
      const coreJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';

      service.set(userId, coreJwt);

      const retrieved = service.get(userId);
      expect(retrieved).toBe(coreJwt);
    });

    it('should return null for non-existent userId', () => {
      const retrieved = service.get('non-existent-user');

      expect(retrieved).toBeNull();
    });

    it('should return null after JWT is cleared', () => {
      const userId = 'test-user-123';
      const coreJwt = 'jwt-token';

      service.set(userId, coreJwt);
      service.clear(userId);

      const retrieved = service.get(userId);
      expect(retrieved).toBeNull();
    });
  });

  describe('clear', () => {
    it('should remove JWT for userId', () => {
      const userId = 'test-user-123';
      const coreJwt = 'jwt-token';

      service.set(userId, coreJwt);
      service.clear(userId);

      const retrieved = service.get(userId);
      expect(retrieved).toBeNull();
    });

    it('should not throw error when clearing non-existent userId', () => {
      expect(() => {
        service.clear('non-existent-user');
      }).not.toThrow();
    });

    it('should not affect other users when clearing one userId', () => {
      const userId1 = 'user-1';
      const userId2 = 'user-2';
      const jwt1 = 'jwt-1';
      const jwt2 = 'jwt-2';

      service.set(userId1, jwt1);
      service.set(userId2, jwt2);

      service.clear(userId1);

      expect(service.get(userId1)).toBeNull();
      expect(service.get(userId2)).toBe(jwt2);
    });
  });
});
