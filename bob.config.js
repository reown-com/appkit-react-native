module.exports = {
  source: 'src',
  output: 'lib',
  targets: [
    'commonjs',
    'module',
    [
      'typescript',
      {
        tsc: '../../node_modules/.bin/tsc',
        // Leaves tests out of the published type definitions
        project: 'tsconfig.build.json'
      }
    ]
  ]
};
