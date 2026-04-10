const path = require('path');

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
    '^@shared-jest-setup$': '<rootDir>/jest-shared-setup.ts',
    '^@reown/appkit-react-native$': path.join(__dirname, 'packages/appkit/src/index.ts'),
    '^@reown/appkit-bitcoin-react-native$': path.join(__dirname, 'packages/bitcoin/src/index.tsx'),
    '^@reown/appkit-coinbase-react-native$': path.join(__dirname, 'packages/coinbase/src/index.ts'),
    '^@reown/appkit-common-react-native$': path.join(__dirname, 'packages/common/src/index.ts'),
    '^@reown/appkit-core-react-native$': path.join(__dirname, 'packages/core/src/index.ts'),
    '^@reown/appkit-ethers-react-native$': path.join(__dirname, 'packages/ethers/src/index.tsx'),
    '^@reown/appkit-react-native-cli$': path.join(__dirname, 'packages/cli/src/index.ts'),
    '^@reown/appkit-solana-react-native$': path.join(__dirname, 'packages/solana/src/index.ts'),
    '^@reown/appkit-ui-react-native$': path.join(__dirname, 'packages/ui/src/index.ts'),
    '^@reown/appkit-wagmi-react-native$': path.join(__dirname, 'packages/wagmi/src/index.tsx')
  }
};
