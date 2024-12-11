import React from 'react';
global.React = React;

import { themes } from '@storybook/theming';

/** @type { import('@storybook/react').Preview } */
const preview = {
  parameters: {
    layout: 'centered',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/
      }
    },
    backgrounds: {
      default: 'dark',
      values: [
        {
          name: 'dark',
          value: '#272A2A'
        },
        {
          name: 'light',
          value: '#EAF1F1'
        }
      ]
    },
    docs: {
      theme: themes.dark
    }
  },

  tags: ['autodocs']
};

export default preview;
