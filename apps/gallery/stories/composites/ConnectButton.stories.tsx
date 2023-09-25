import type { Meta, StoryObj } from '@storybook/react';

import { ConnectButton } from '@web3modal/ui-react-native';

const meta: Meta<typeof ConnectButton> = {
  component: ConnectButton,
  argTypes: {
    size: {
      options: ['sm', 'md'],
      control: { type: 'select' }
    },
    loading: {
      control: { type: 'boolean' }
    }
  },
  args: {
    size: 'md',
    loading: false
  }
};

export default meta;
type Story = StoryObj<typeof ConnectButton>;

export const Default: Story = {
  render: (args: any) => (
    <ConnectButton size={args.size} loading={args.loading}>
      {args.loading ? 'Connecting...' : 'Connect'}
    </ConnectButton>
  )
};
