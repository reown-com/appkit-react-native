import type { Meta, StoryObj } from '@storybook/react';

import { Image } from '@reown/appkit-ui-react-native';
import { walletImageSrc } from '../../utils/PresetUtils';

const meta: Meta<typeof Image> = {
  component: Image,
  argTypes: {
    source: {
      control: { type: 'text' }
    }
  },
  args: {
    source: walletImageSrc
  }
};

export default meta;
type Story = StoryObj<typeof Image>;

export const Default: Story = {
  render: args => <Image source={args.source} />
};
