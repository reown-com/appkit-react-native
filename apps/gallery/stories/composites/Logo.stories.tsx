import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Logo } from '@reown/ui-react-native';
import { logoOptions } from '../../utils/PresetUtils';

const meta: Meta<typeof Logo> = {
  component: Logo,
  args: {
    logo: 'google'
  },
  argTypes: {
    logo: {
      options: logoOptions,
      control: { type: 'select' }
    }
  }
};

export default meta;
type Story = StoryObj<typeof Logo>;

export const Default: Story = {
  render: args => <Logo logo={args.logo} />
};
