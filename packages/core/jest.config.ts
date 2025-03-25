const coreConfig = {
  ...require('../../jest.config'),
  setupFilesAfterEnv: ['./jest-setup.ts'],
  // Override the moduleNameMapper to use the correct path from the package
  moduleNameMapper: {
    '^@shared-jest-setup$': '../../jest-shared-setup.ts'
  }
};
module.exports = coreConfig;
