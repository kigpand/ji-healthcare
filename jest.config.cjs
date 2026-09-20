module.exports = {
  preset: 'jest-expo',
  testMatch: ['<rootDir>/tests/**/*.test.ts', '<rootDir>/tests/**/*.test.tsx'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/$1' },
  clearMocks: true,
  collectCoverageFrom: ['schema/**/*.ts', 'utils/**/*.ts', 'hooks/**/*.ts', 'service/**/*.ts', 'lib/**/*.ts'],
  coverageDirectory: 'coverage',
};
