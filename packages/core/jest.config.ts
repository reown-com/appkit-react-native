const rootConfig = require('../../jest.config');

const coreConfig = {
  ...rootConfig,
  setupFilesAfterEnv: ['./jest-setup.ts'],
  moduleNameMapper: {
    ...rootConfig.moduleNameMapper,
    '^@shared-jest-setup$': '../../jest-shared-setup.ts'
  }
};
module.exports = coreConfig;
