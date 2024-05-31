import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { WalletImage } from '@web3modal/ui-react-native';
import { walletImageSrc } from '../../utils/PresetUtils';

const meta: Meta<typeof WalletImage> = {
  component: WalletImage,
  argTypes: {
    imageSrc: {
      control: { type: 'text' }
    },
    size: {
      options: ['sm', 'md', 'lg', 'xl'],
      control: { type: 'select' }
    }
  },
  args: {
    imageSrc: walletImageSrc,
    size: 'lg'
  }
};

export default meta;
type Story = StoryObj<typeof WalletImage>;

export const Default: Story = {
  render: args => <WalletImage imageSrc={args.imageSrc} size={args.size} />
};
