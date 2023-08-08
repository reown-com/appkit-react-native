import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { LoadingThumbnail } from '@web3modal/ui-react-native';

const meta: Meta<typeof LoadingThumbnail> = {
  component: LoadingThumbnail,
  argTypes: {
    showError: {
      control: { type: 'boolean' }
    }
  },
  args: {
    showError: false
  }
};

export default meta;
type Story = StoryObj<typeof LoadingThumbnail>;

export const Default: Story = {
  render: args => <LoadingThumbnail showError={args.showError} />
};
