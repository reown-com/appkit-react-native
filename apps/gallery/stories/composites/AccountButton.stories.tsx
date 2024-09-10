import type { Meta, StoryObj } from '@storybook/react';

import { AccountButton } from '@reown/ui-react-native';
import { avatarImageSrc, networkImageSrc } from '../../utils/PresetUtils';

const meta: Meta<typeof AccountButton> = {
  component: AccountButton,
  argTypes: {
    avatarSrc: {
      control: { type: 'text' }
    },
    address: {
      control: { type: 'text' }
    },
    isProfileName: {
      control: { type: 'boolean' }
    },
    networkSrc: {
      control: { type: 'text' }
    },
    balance: {
      control: { type: 'text' }
    }
  },
  args: {
    avatarSrc: avatarImageSrc,
    address: '0xDBbD65026a07cFbFa1aa92744E4D69951686077d',
    networkSrc: networkImageSrc,
    balance: '0.527 ETH',
    isProfileName: false
  }
};

export default meta;
type Story = StoryObj<typeof AccountButton>;

export const Default: Story = {
  render: args => (
    <AccountButton
      avatarSrc={args.avatarSrc}
      address={args.address}
      networkSrc={args.networkSrc}
      balance={args.balance}
      isProfileName={args.isProfileName}
    />
  )
};
