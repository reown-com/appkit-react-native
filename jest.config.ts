module.exports = {
  preset: 'react-native',
  modulePathIgnorePatterns: ['<rootDir>/node_modules', '<rootDir>/lib/'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-.*|@react-native-.*)/)'
  ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { configFile: './babel.config.js' }]
  },
  moduleNameMapper: {
    '^@shared-jest-setup$': '<rootDir>/jest-shared-setup.ts'
  }
};
