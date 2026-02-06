import { CoreClient } from '../../../src/core-adapter/core.client';

// Mock contract assertion to allow tests to run
jest.mock('../../../src/core-adapter/core.contract.assert', () => ({
  assertCoreEndpointAllowed: jest.fn(),
}));

// Mock global fetch
global.fetch = jest.fn();

describe('CoreClient', () => {
  let client: CoreClient;
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv, CORE_API_BASE_URL: 'http://core-api.test' };
    client = new CoreClient();
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('constructor', () => {
    it('should throw error if CORE_API_BASE_URL not configured', () => {
      process.env = { ...originalEnv };
      delete process.env.CORE_API_BASE_URL;

      expect(() => new CoreClient()).toThrow('CORE_API_BASE_URL is not configured');
    });
  });

  describe('validateOrganizationExists', () => {
    it('should return true when Core returns 200', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await client.validateOrganizationExists('core-1', 'jwt-token', 'corr-1');

      expect(result).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://core-api.test/api/v1/organizations/core-1',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer jwt-token',
            'X-Correlation-Id': 'corr-1',
          }),
        })
      );
    });

    it('should return false when Core returns 404', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await client.validateOrganizationExists('core-1', 'jwt-token', 'corr-1');

      expect(result).toBe(false);
    });
  });
});
