/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Otp } from '@web3modal/ui-react-native';
import { GalleryContainer } from '../../components/GalleryContainer';

const meta: Meta<typeof Otp> = {
  component: Otp,
  args: {
    length: 6
  },
  argTypes: {
    length: {
      control: { type: 'number' }
    }
  }
};

export default meta;
type Story = StoryObj<typeof Otp>;

export const Default: Story = {
  render: args => (
    <GalleryContainer width={350}>
      <Otp length={args.length} style={{ outlineStyle: 'none' }} />
    </GalleryContainer>
  )
};
