const path = require('path');
const uipack = require('../../packages/ui/package.json');
const corepack = require('../../packages/core/package.json');
const scaffoldpack = require('../../packages/scaffold/package.json');
const wagmipack = require('../../packages/wagmi/package.json');
const authpack = require('../../packages/auth-wagmi/package.json');
const commonpack = require('../../packages/common/package.json');
const siwepack = require('../../packages/siwe/package.json');

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
            [scaffoldpack.name]: path.join(
              __dirname,
              '../../packages/scaffold',
              scaffoldpack.source
            ),
            [wagmipack.name]: path.join(__dirname, '../../packages/wagmi', wagmipack.source),
            [authpack.name]: path.join(__dirname, '../../packages/auth-wagmi', authpack.source),
            [commonpack.name]: path.join(__dirname, '../../packages/common', commonpack.source),
            [siwepack.name]: path.join(__dirname, '../../packages/siwe', siwepack.source)
          }
        }
      ],
      'react-native-reanimated/plugin'
    ]
  };
};
