import type { Meta, StoryObj } from '@storybook/react';

import { Snackbar } from '@reown/appkit-ui-react-native';
import { colorOptions, iconOptions } from '../../utils/PresetUtils';

const meta: Meta<typeof Snackbar> = {
  component: Snackbar,
  args: {
    iconColor: 'success-100',
    icon: 'checkmark',
    message: 'Address copied'
  },
  argTypes: {
    iconColor: {
      options: ['inherit', ...colorOptions],
      control: { type: 'select' }
    },
    icon: {
      options: iconOptions,
      control: { type: 'select' }
    },
    message: {
      control: { type: 'text' }
    }
  }
};

export default meta;
type Story = StoryObj<typeof Snackbar>;

export const Default: Story = {
  render: args => <Snackbar iconColor={args.iconColor} icon={args.icon} message={args.message} />
};
