import type { Meta, StoryObj } from '@storybook/react';

import { Text } from '@reown/appkit-ui-react-native';
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
    },
    center: {
      control: { type: 'boolean' }
    }
  },
  args: {
    variant: 'paragraph-500',
    color: 'fg-100',
    children: 'The fox jumped over the lazy dog',
    center: false
  }
};

export default meta;
type Story = StoryObj<typeof Text>;

export const Default: Story = {
  render: args => (
    <Text variant={args.variant} color={args.color} center={args.center}>
      {args.children}
    </Text>
  )
};
