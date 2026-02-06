module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['**/modules/platform-admin/tests/**/*.spec.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  setupFilesAfterEnv: ['<rootDir>/modules/platform-admin/tests/jest.setup.ts'],
  collectCoverageFrom: [
    'modules/platform-admin/src/**/*.ts',
    '!modules/platform-admin/src/**/*.spec.ts',
  ],
  coverageDirectory: './coverage',
  testPathIgnorePatterns: ['/node_modules/'],
};
