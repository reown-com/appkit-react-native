import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { IconLink } from '@web3modal/ui-react-native';
import { colorOptions, iconOptions } from '../../utils/PresetUtils';

const meta: Meta<typeof IconLink> = {
  component: IconLink,
  args: {
    size: 'md',
    iconColor: 'fg-100',
    icon: 'copy',
    disabled: false
  },
  argTypes: {
    size: {
      options: ['sm', 'md', 'lg'],
      control: { type: 'select' }
    },
    iconColor: {
      options: ['inherit', ...colorOptions],
      control: { type: 'select' }
    },
    disabled: {
      control: { type: 'boolean' }
    },
    icon: {
      options: iconOptions,
      control: { type: 'select' }
    }
  }
};

export default meta;
type Story = StoryObj<typeof IconLink>;

export const Default: Story = {
  render: args => (
    <IconLink
      size={args.size}
      iconColor={args.iconColor}
      icon={args.icon}
      disabled={args.disabled}
    />
  )
};
