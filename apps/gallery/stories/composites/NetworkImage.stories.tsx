import type { Meta, StoryObj } from '@storybook/react';

import { NetworkImage } from '@reown/appkit-ui-react-native';
import { networkImageSrc } from '../../utils/PresetUtils';

const meta: Meta<typeof NetworkImage> = {
  component: NetworkImage,
  argTypes: {
    imageSrc: {
      control: { type: 'text' }
    },
    size: {
      options: ['md', 'lg'],
      control: { type: 'select' }
    },
    selected: {
      control: { type: 'boolean' }
    }
  },
  args: {
    imageSrc: networkImageSrc,
    size: 'lg',
    selected: false
  }
};

export default meta;
type Story = StoryObj<typeof NetworkImage>;

export const Default: Story = {
  render: args => (
    <NetworkImage imageSrc={args.imageSrc} size={args.size} selected={args.selected} />
  )
};
