const path = require('path');
const uipak = require('../../packages/ui/package.json');
const corepak = require('../../packages/core/package.json');
const scaffoldpak = require('../../packages/scaffold/package.json');
const wagmipak = require('../../packages/wagmi/package.json');

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
            // For development, we want to alias the ui library to the source
            [uipak.name]: path.join(__dirname, '../../packages/ui', uipak.source),
            [corepak.name]: path.join(__dirname, '../../packages/core', corepak.source),
            [scaffoldpak.name]: path.join(__dirname, '../../packages/scaffold', scaffoldpak.source),
            [wagmipak.name]: path.join(__dirname, '../../packages/wagmi', wagmipak.source)
          }
        }
      ]
    ]
  };
};
