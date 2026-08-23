/**
 * Jest configuration for the SWEEP frontend.
 * Uses jsdom so React components can render in tests, and maps
 * style imports to identity-obj-proxy so CSS never breaks a test.
 */
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
  testMatch: ['<rootDir>/src/**/*.test.{js,jsx}'],
};
