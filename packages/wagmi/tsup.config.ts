import { defineConfig, Options } from 'tsup';
import path from 'path';

export default defineConfig((options: Options) => ({
  entry: {
    index: 'index.tsx'
  },
  banner: {
    js: "'use client'"
  },
  clean: true,
  format: ['cjs', 'esm'],
  external: ['react', '@wagmi/core'],
  shims: true,
  inject: [path.resolve(__dirname, './src/utils/polyfills.js')],
  dts: true,
  ...options
}));
