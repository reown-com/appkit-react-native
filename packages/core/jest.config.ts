const rootConfig = require('../../jest.config');

const coreConfig = {
  ...rootConfig,
  setupFilesAfterEnv: ['./jest-setup.ts'],
  moduleNameMapper: {
    ...rootConfig.moduleNameMapper,
    // Absolute so test files (not only jest-setup.ts) can import helpers like resetControllers
    '^@shared-jest-setup$': require('path').join(__dirname, '../../jest-shared-setup.ts')
  },
  // Enforced only with --coverage (CI). Set at the measured level to catch regressions; raise it as tests are added
  coverageThreshold: {
    './src/controllers/ConnectionsController.ts': {
      statements: 27,
      branches: 11,
      functions: 30,
      lines: 28
    },
    './src/utils/StorageUtil.ts': { statements: 4, branches: 0, functions: 6, lines: 4 }
  }
};
module.exports = coreConfig;
