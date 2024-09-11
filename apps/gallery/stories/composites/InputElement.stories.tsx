import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { InputElement } from '@reown/appkit-ui-react-native';
import { iconOptions } from '../../utils/PresetUtils';

const meta: Meta<typeof InputElement> = {
  component: InputElement,
  args: {
    icon: 'close',
    disabled: false
  },
  argTypes: {
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
type Story = StoryObj<typeof InputElement>;

export const Default: Story = {
  render: args => <InputElement icon={args.icon} disabled={args.disabled} onPress={() => {}} />
};
