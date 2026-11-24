const rootConfig = require('../../jest.config');

const appkitConfig = {
  ...rootConfig,
  setupFilesAfterEnv: ['./jest-setup.ts'],
  moduleNameMapper: {
    ...rootConfig.moduleNameMapper,
    '^@shared-jest-setup$': '../../jest-shared-setup.ts'
  },
  // Enforced only with --coverage (CI). Set at the measured level to catch regressions; raise it as tests are added
  coverageThreshold: {
    './src/AppKit.ts': { statements: 56, branches: 43, functions: 57, lines: 58 }
  }
};
module.exports = appkitConfig;
