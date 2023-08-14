import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Tag } from '@web3modal/ui-react-native';

const meta: Meta<typeof Tag> = {
  component: Tag,
  argTypes: {
    variant: {
      options: ['main', 'shade'],
      control: { type: 'select' }
    },
    children: {
      control: { type: 'text' }
    }
  },
  args: {
    variant: 'main',
    children: 'Recent'
  }
};

export default meta;
type Story = StoryObj<typeof Tag>;

export const Default: Story = {
  render: args => <Tag variant={args.variant}>{args.children}</Tag>
};
