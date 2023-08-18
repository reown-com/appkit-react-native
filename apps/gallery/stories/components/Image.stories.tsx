import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Image } from '@web3modal/ui-react-native';
import { walletImageSrc } from '../../utils/PresetUtils';

const meta: Meta<typeof Image> = {
  component: Image,
  argTypes: {
    source: {
      control: { type: 'text' }
    }
  },
  args: {
    source: walletImageSrc
  }
};

export default meta;
type Story = StoryObj<typeof Image>;

export const Default: Story = {
  render: args => <Image source={args.source} />
};
