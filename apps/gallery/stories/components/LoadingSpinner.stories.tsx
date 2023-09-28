import type { Meta, StoryObj } from '@storybook/react';

import { LoadingSpinner } from '@web3modal/ui-react-native';

const meta: Meta<typeof LoadingSpinner> = {
  component: LoadingSpinner,
  args: {
    size: 'md',
    color: 'fg-200'
  },
  argTypes: {
    size: {
      options: ['sm', 'md', 'lg'],
      control: { type: 'select' }
    },
    color: {
      options: [undefined, 'blue-100', 'fg-200', 'fg-250', 'fg-275'],
      control: { type: 'select' }
    }
  }
};

export default meta;
type Story = StoryObj<typeof LoadingSpinner>;

export const Default: Story = {
  render: (args: any) => <LoadingSpinner color={args.color} size={args.size} />
};
