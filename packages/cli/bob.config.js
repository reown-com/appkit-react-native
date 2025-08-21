module.exports = {
  source: 'src',
  output: 'lib',
  targets: [
    'commonjs',
    'module',
    [
      'typescript',
      {
        tsc: '../../node_modules/.bin/tsc'
      }
    ]
  ]
};
