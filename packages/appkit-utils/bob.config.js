module.exports = {
  source: 'src',
  output: 'lib',
  targets: [
    'commonjs',
    'module',
    [
      'typescript',
      {
        esm: true,
        tsc: '../../node_modules/.bin/tsc'
      }
    ]
  ]
};
