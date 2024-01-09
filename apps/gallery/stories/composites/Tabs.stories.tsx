import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Tabs } from '@web3modal/ui-react-native';

const meta: Meta<typeof Tabs> = {
  component: Tabs,
  args: {
    tabs: [
      { icon: 'mobile', label: 'Mobile' },
      { icon: 'browser', label: 'Browser' },
      { icon: 'desktop', label: 'Desktop' }
    ],
    onTabChange: _index => null
  }
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: args => <Tabs tabs={args.tabs} onTabChange={args.onTabChange} />
};
