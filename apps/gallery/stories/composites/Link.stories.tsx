import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Link } from '@web3modal/ui-react-native';
import { iconOptions } from '../../utils/PresetUtils';

const meta: Meta<typeof Link> = {
  component: Link,
  argTypes: {
    iconLeft: {
      options: [undefined, ...iconOptions],
      control: { type: 'select' }
    },
    iconRight: {
      options: [undefined, ...iconOptions],
      control: { type: 'select' }
    },
    disabled: {
      control: { type: 'boolean' }
    },
    size: {
      options: ['sm', 'md'],
      control: { type: 'select' }
    }
  },
  args: {
    disabled: false,
    children: 'Link',
    size: 'md'
  }
};

export default meta;
type Story = StoryObj<typeof Link>;

export const Default: Story = {
  render: args => (
    <Link
      iconLeft={args.iconLeft}
      iconRight={args.iconRight}
      disabled={args.disabled}
      size={args.size}
    >
      {args.children}
    </Link>
  )
};
