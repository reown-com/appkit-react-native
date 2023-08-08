import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { LoadingSpinner } from '@web3modal/ui-react-native';

const meta: Meta<typeof LoadingSpinner> = {
  component: LoadingSpinner
};

export default meta;
type Story = StoryObj<typeof LoadingSpinner>;

export const Default: Story = {
  render: () => <LoadingSpinner />
};
