import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { WalletImage } from '@web3modal/ui-react-native';

const meta: Meta<typeof WalletImage> = {
  component: WalletImage,
  argTypes: {
    imageSrc: {
      control: { type: 'text' }
    },
    size: {
      options: ['sm', 'md', 'lg'],
      control: { type: 'select' }
    }
  },
  args: {
    imageSrc:
      'https://explorer-api.walletconnect.com/w3m/v1/getWalletImage/7a33d7f1-3d12-4b5c-f3ee-5cd83cb1b500?projectId=c1781fc385454899a2b1385a2b83df3b',
    size: 'lg'
  }
};

export default meta;
type Story = StoryObj<typeof WalletImage>;

export const Default: Story = {
  render: args => <WalletImage imageSrc={args.imageSrc} size={args.size} />
};
