/**
 * Jest Setup — Test Environment Configuration
 * 
 * Purpose: Inject minimal environment variables for test runtime
 * Scope: Tests only, no production impact
 * 
 * Evidence: Prevents test failures from missing env vars
 */

// Set minimal test environment variables
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test';
process.env.CORE_API_BASE_URL = process.env.CORE_API_BASE_URL || 'http://localhost:3000';
