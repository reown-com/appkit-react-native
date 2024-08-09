import type { Meta, StoryObj } from '@storybook/react';

import { NetworkButton } from '@web3modal/ui-react-native';
import { networkImageSrc } from '../../utils/PresetUtils';

const meta: Meta<typeof NetworkButton> = {
  component: NetworkButton,
  argTypes: {
    disabled: {
      control: { type: 'boolean' }
    },
    children: {
      control: { type: 'text' }
    },
    imageSrc: {
      control: { type: 'text' }
    }
  },
  args: {
    disabled: false,
    children: 'Ethereum',
    imageSrc: networkImageSrc
  }
};

export default meta;
type Story = StoryObj<typeof NetworkButton>;

export const Default: Story = {
  render: args => (
    <NetworkButton disabled={args.disabled} imageSrc={args.imageSrc} onPress={() => {}}>
      {args.children}
    </NetworkButton>
  )
};
