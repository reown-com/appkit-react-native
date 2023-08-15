import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { NetworkButton } from '@web3modal/ui-react-native';

const meta: Meta<typeof NetworkButton> = {
  component: NetworkButton,
  argTypes: {
    variant: {
      options: ['fill', 'shade'],
      control: { type: 'select' }
    },
    disabled: {
      control: { type: 'boolean' }
    },
    name: {
      control: { type: 'text' }
    },
    imageSrc: {
      control: { type: 'text' }
    }
  },
  args: {
    variant: 'fill',
    disabled: false,
    name: 'Ethereum',
    imageSrc:
      'https://explorer-api.walletconnect.com/w3m/v1/getAssetImage/692ed6ba-e569-459a-556a-776476829e00?projectId=c1781fc385454899a2b1385a2b83df3b'
  }
};

export default meta;
type Story = StoryObj<typeof NetworkButton>;

export const Default: Story = {
  render: args => (
    <NetworkButton
      variant={args.variant}
      name={args.name}
      disabled={args.disabled}
      imageSrc={args.imageSrc}
      onPress={() => {}}
    />
  )
};
