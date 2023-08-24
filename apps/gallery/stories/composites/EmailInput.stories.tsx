/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { EmailInput } from '@web3modal/ui-react-native';
import { GalleryContainer } from '../../components/GalleryContainer';

const meta: Meta<typeof EmailInput> = {
  component: EmailInput,
  args: {
    errorMessage: 'Invalid email'
  },
  argTypes: {
    errorMessage: {
      control: { type: 'text' }
    }
  }
};

export default meta;
type Story = StoryObj<typeof EmailInput>;

export const Default: Story = {
  render: args => (
    <GalleryContainer width={350}>
      <EmailInput errorMessage={args.errorMessage} inputStyle={{ outlineStyle: 'none' }} />
    </GalleryContainer>
  )
};
