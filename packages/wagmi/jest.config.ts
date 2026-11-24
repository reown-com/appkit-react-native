const rootConfig = require('../../jest.config');

const commonConfig = {
  ...rootConfig,
  setupFilesAfterEnv: ['./jest-setup.ts'],
  // @wagmi/core only ships ESM, so let babel transform it
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-.*|@react-native-.*|@wagmi)/)'
  ],
  moduleNameMapper: {
    ...rootConfig.moduleNameMapper,
    '^@shared-jest-setup$': '../../jest-shared-setup.ts'
  }
};
module.exports = commonConfig;
