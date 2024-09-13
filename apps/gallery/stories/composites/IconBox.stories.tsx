import type { Meta, StoryObj } from '@storybook/react';

import { IconBox } from '@reown/appkit-ui-react-native';
import { colorOptions, iconOptions } from '../../utils/PresetUtils';

const meta: Meta<typeof IconBox> = {
  component: IconBox,
  args: {
    size: 'md',
    iconColor: 'fg-100',
    icon: 'copy',
    border: false,
    background: true
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
    background: {
      control: { type: 'boolean' }
    },
    backgroundColor: {
      options: colorOptions,
      control: { type: 'select' }
    },
    border: {
      control: { type: 'boolean' }
    },
    icon: {
      options: iconOptions,
      control: { type: 'select' }
    }
  }
};

export default meta;
type Story = StoryObj<typeof IconBox>;

export const Default: Story = {
  render: args => (
    <IconBox
      size={args.size}
      iconColor={args.iconColor}
      icon={args.icon}
      border={args.border}
      background={args.background}
      backgroundColor={args.backgroundColor}
    />
  )
};
