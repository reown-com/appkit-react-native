import type { Meta, StoryObj } from '@storybook/react';

import { Tag } from '@web3modal/ui-react-native';
import { tagOptions } from '../../utils/PresetUtils';

const meta: Meta<typeof Tag> = {
  component: Tag,
  argTypes: {
    variant: {
      options: tagOptions,
      control: { type: 'select' }
    },
    children: {
      control: { type: 'text' }
    },
    disabled: {
      control: { type: 'boolean' }
    }
  },
  args: {
    variant: 'main',
    children: 'Recent',
    disabled: false
  }
};

export default meta;
type Story = StoryObj<typeof Tag>;

export const Default: Story = {
  render: args => (
    <Tag variant={args.variant} disabled={args.disabled}>
      {args.children}
    </Tag>
  )
};
