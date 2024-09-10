import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { LoadingHexagon } from '@reown/ui-react-native';

const meta: Meta<typeof LoadingHexagon> = {
  component: LoadingHexagon
};

export default meta;
type Story = StoryObj<typeof LoadingHexagon>;

export const Default: Story = {
  render: () => <LoadingHexagon />
};
