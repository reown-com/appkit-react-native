import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { NetworkImage } from '@web3modal/ui-react-native';

const meta: Meta<typeof NetworkImage> = {
  component: NetworkImage,
  argTypes: {
    imageSrc: {
      control: { type: 'text' }
    },
    size: {
      options: ['md', 'lg'],
      control: { type: 'select' }
    },
    selected: {
      control: { type: 'boolean' }
    }
  },
  args: {
    imageSrc:
      'https://explorer-api.walletconnect.com/w3m/v1/getAssetImage/692ed6ba-e569-459a-556a-776476829e00?projectId=c1781fc385454899a2b1385a2b83df3b',
    size: 'lg',
    selected: false
  }
};

export default meta;
type Story = StoryObj<typeof NetworkImage>;

export const Default: Story = {
  render: args => (
    <NetworkImage imageSrc={args.imageSrc} size={args.size} selected={args.selected} />
  )
};
