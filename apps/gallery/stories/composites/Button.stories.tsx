import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '@web3modal/ui-react-native';
import { buttonOptions } from '../../utils/PresetUtils';

const meta: Meta<typeof Button> = {
  component: Button,
  argTypes: {
    size: {
      options: ['sm', 'md'],
      control: { type: 'select' }
    },
    variant: {
      options: buttonOptions,
      control: { type: 'select' }
    },
    disabled: {
      control: { type: 'boolean' }
    }
  },
  args: {
    variant: 'fill',
    size: 'md',
    disabled: false,
    children: 'Button'
  }
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  render: args => (
    <Button variant={args.variant} size={args.size} disabled={args.disabled}>
      {args.children}
    </Button>
  )
};
