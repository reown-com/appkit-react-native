const rootConfig = require('../../jest.config');

const appkitConfig = {
  ...rootConfig,
  setupFilesAfterEnv: ['./jest-setup.ts'],
  moduleNameMapper: {
    ...rootConfig.moduleNameMapper,
    '^@shared-jest-setup$': '../../jest-shared-setup.ts'
  }
};
module.exports = appkitConfig;
