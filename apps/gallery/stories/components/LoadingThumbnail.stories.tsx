import type { Meta, StoryObj } from '@storybook/react';

import { LoadingThumbnail } from '@web3modal/ui-react-native';

const meta: Meta<typeof LoadingThumbnail> = {
  component: LoadingThumbnail,
  argTypes: {
    paused: {
      control: { type: 'boolean' }
    }
  },
  args: {
    paused: false
  }
};

export default meta;
type Story = StoryObj<typeof LoadingThumbnail>;

export const Default: Story = {
  render: args => <LoadingThumbnail paused={args.paused} />
};
