module.exports = {
  preset: 'react-native',
  modulePathIgnorePatterns: ['<rootDir>/node_modules', '<rootDir>/packages/*/lib/'],
  setupFilesAfterEnv: ['./jest-setup.ts']
};
