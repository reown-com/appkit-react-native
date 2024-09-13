import { join, dirname } from 'path';

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value) {
  return dirname(require.resolve(join(value, 'package.json')));
}

/** @type { import('@storybook/react-webpack5').StorybookConfig } */
const config = {
  stories: ['../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)'],

  addons: [
    getAbsolutePath('@storybook/addon-links'),
    getAbsolutePath('@storybook/addon-essentials'),
    getAbsolutePath('@storybook/addon-onboarding'),
    getAbsolutePath('@storybook/addon-interactions'),
    getAbsolutePath('@storybook/addon-react-native-web'),
    getAbsolutePath("@storybook/addon-webpack5-compiler-babel"),
    '@chromatic-com/storybook'
  ],

  framework: {
    name: getAbsolutePath('@storybook/react-webpack5'),
    options: {}
  },

  docs: {
    defaultName: 'Docs'
  },

  typescript: {
    reactDocgen: 'react-docgen-typescript'
  }
};
export default config;
