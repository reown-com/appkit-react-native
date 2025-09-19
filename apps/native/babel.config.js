const path = require('path');
const uipack = require('../../packages/ui/package.json');
const corepack = require('../../packages/core/package.json');
const wagmipack = require('../../packages/wagmi/package.json');
const etherspack = require('../../packages/ethers/package.json');
const bitcoinpack = require('../../packages/bitcoin/package.json');
const solanapack = require('../../packages/solana/package.json');
const commonpack = require('../../packages/common/package.json');
const coinbasepack = require('../../packages/coinbase/package.json');
const appkitpack = require('../../packages/appkit/package.json');

module.exports = function (api) {
  api.cache(true);

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          extensions: ['.tsx', '.ts', '.js', '.json'],
          alias: {
            // For development, we want to alias the packages to the source
            [uipack.name]: path.join(__dirname, '../../packages/ui', uipack.source),
            [corepack.name]: path.join(__dirname, '../../packages/core', corepack.source),
            [etherspack.name]: path.join(__dirname, '../../packages/ethers', etherspack.source),
            [bitcoinpack.name]: path.join(__dirname, '../../packages/bitcoin', bitcoinpack.source),
            [solanapack.name]: path.join(__dirname, '../../packages/solana', solanapack.source),
            [wagmipack.name]: path.join(__dirname, '../../packages/wagmi', wagmipack.source),
            [commonpack.name]: path.join(__dirname, '../../packages/common', commonpack.source),
            [appkitpack.name]: path.join(__dirname, '../../packages/appkit', appkitpack.source),
            [coinbasepack.name]: path.join(
              __dirname,
              '../../packages/coinbase',
              coinbasepack.source
            )
          }
        }
      ]
    ]
  };
};
