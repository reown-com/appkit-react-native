import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Icon } from '@reown/ui-react-native';
import { colorOptions, iconOptions } from '../../utils/PresetUtils';

const meta: Meta<typeof Icon> = {
  component: Icon,
  args: {
    size: 'md',
    color: 'fg-100',
    name: 'copy'
  },
  argTypes: {
    size: {
      options: ['xxs', 'xs', 'sm', 'md', 'lg'],
      control: { type: 'select' }
    },
    color: {
      options: ['inherit', ...colorOptions],
      control: { type: 'select' }
    },
    name: {
      options: iconOptions,
      control: { type: 'select' }
    }
  }
};

export default meta;
type Story = StoryObj<typeof Icon>;

export const Default: Story = {
  render: args => (
    <Icon size={args.size} color={args.color} name={args.name}>
      {args.children}
    </Icon>
  )
};
