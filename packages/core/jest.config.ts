const coreConfig = {
  ...require('../../jest.config'),
  setupFilesAfterEnv: ['../../jest-setup.ts']
};
module.exports = coreConfig;
