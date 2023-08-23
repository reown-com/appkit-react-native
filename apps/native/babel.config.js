const path = require('path');
const uipak = require('../../packages/ui/package.json');

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
            [uipak.name]: path.join(__dirname, '../../packages/ui', uipak.source)
          }
        }
      ]
    ]
  };
};
