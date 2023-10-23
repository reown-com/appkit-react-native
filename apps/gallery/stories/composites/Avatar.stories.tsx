import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Avatar } from '@web3modal/ui-react-native';
import { avatarImageSrc } from '../../utils/PresetUtils';

const meta: Meta<typeof Avatar> = {
  component: Avatar,
  argTypes: {
    imageSrc: {
      control: { type: 'text' }
    },
    address: {
      control: { type: 'text' }
    },
    size: {
      control: { type: 'number' }
    },
    borderWidth: {
      control: { type: 'number' }
    }
  },
  args: {
    imageSrc: avatarImageSrc,
    address: '0xDBbD65026a07cFbFa1aa92744E4D69951686077d',
    size: 64,
    borderWidth: 8
  }
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
  render: args => (
    <Avatar
      imageSrc={args.imageSrc}
      address={args.address}
      size={args.size}
      borderWidth={args.borderWidth}
    />
  )
};
