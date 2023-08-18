import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Text } from '@web3modal/ui-react-native';
import { colorOptions, textOptions } from '../../utils/PresetUtils';

const meta: Meta<typeof Text> = {
  component: Text,
  argTypes: {
    color: {
      options: colorOptions,
      control: { type: 'select' }
    },
    variant: {
      options: textOptions,
      control: { type: 'select' }
    }
  },
  args: {
    variant: 'paragraph-500',
    color: 'fg-100',
    children: 'The fox jumped over the lazy dog'
  }
};

export default meta;
type Story = StoryObj<typeof Text>;

export const Default: Story = {
  render: args => (
    <Text variant={args.variant} color={args.color}>
      {args.children}
    </Text>
  )
};
