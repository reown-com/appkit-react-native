import type { Meta, StoryObj } from '@storybook/react';

import { NetworkButton } from '@reown/appkit-ui-react-native';
import { networkImageSrc } from '../../utils/PresetUtils';

const meta: Meta<typeof NetworkButton> = {
  component: NetworkButton,
  argTypes: {
    variant: {
      options: ['fill', 'shade'],
      control: { type: 'select' }
    },
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
    variant: 'fill',
    disabled: false,
    children: 'Ethereum',
    imageSrc: networkImageSrc
  }
};

export default meta;
type Story = StoryObj<typeof NetworkButton>;

export const Default: Story = {
  render: args => (
    <NetworkButton
      variant={args.variant}
      disabled={args.disabled}
      imageSrc={args.imageSrc}
      onPress={() => {}}
    >
      {args.children}
    </NetworkButton>
  )
};
