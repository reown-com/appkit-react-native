import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Tooltip } from '@reown/appkit-ui-react-native';
import { tooltipOptions } from '../../utils/PresetUtils';

const meta: Meta<typeof Tooltip> = {
  component: Tooltip,
  argTypes: {
    placement: {
      options: tooltipOptions,
      control: { type: 'select' }
    },
    message: {
      control: { type: 'text' }
    }
  },
  args: {
    placement: 'top',
    message: 'Tooltip'
  }
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  render: args => <Tooltip placement={args.placement} message={args.message} />
};
