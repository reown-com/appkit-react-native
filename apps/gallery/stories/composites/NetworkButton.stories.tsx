import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { NetworkButton } from '@web3modal/ui-react-native';
import { networkImageSrc } from '../../utils/PresetUtils';

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
    imageSrc: networkImageSrc
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
