/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { SearchBar } from '@reown/appkit-ui-react-native';
import { GalleryContainer } from '../../components/GalleryContainer';

const meta: Meta<typeof SearchBar> = {
  component: SearchBar,
  args: {
    placeholder: 'Search wallet'
  },
  argTypes: {
    placeholder: {
      control: { type: 'text' }
    }
  }
};

export default meta;
type Story = StoryObj<typeof SearchBar>;

export const Default: Story = {
  render: args => (
    <GalleryContainer width={300}>
      <SearchBar placeholder={args.placeholder} inputStyle={{ outlineStyle: 'none' }} />
    </GalleryContainer>
  )
};
