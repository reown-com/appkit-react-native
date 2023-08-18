import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { AllWalletsImage } from '@web3modal/ui-react-native';
import { walletImagesOptions } from '../../utils/PresetUtils';

const meta: Meta<typeof AllWalletsImage> = {
  component: AllWalletsImage,
  args: {
    walletImages: walletImagesOptions
  }
};

export default meta;
type Story = StoryObj<typeof AllWalletsImage>;

export const Default: Story = {
  render: args => <AllWalletsImage walletImages={args.walletImages} />
};
