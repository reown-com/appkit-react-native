import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Image } from '@web3modal/ui-react-native';

const meta: Meta<typeof Image> = {
  component: Image,
  argTypes: {
    source: {
      control: { type: 'text' }
    }
  },
  args: {
    source:
      'https://explorer-api.walletconnect.com/w3m/v1/getWalletImage/7a33d7f1-3d12-4b5c-f3ee-5cd83cb1b500?projectId=c1781fc385454899a2b1385a2b83df3b'
  }
};

export default meta;
type Story = StoryObj<typeof Image>;

export const Default: Story = {
  render: args => <Image source={args.source} />
};
