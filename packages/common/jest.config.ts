const commonConfig = {
  ...require('../../jest.config'),
  setupFilesAfterEnv: ['../../jest-setup.ts']
};
module.exports = commonConfig;
