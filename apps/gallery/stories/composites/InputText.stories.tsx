/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { InputText } from '@web3modal/ui-react-native';
import { GalleryContainer } from '../../components/GalleryContainer';
import { iconOptions } from '../../utils/PresetUtils';

const meta: Meta<typeof InputText> = {
  component: InputText,
  args: {
    placeholder: 'Search wallet',
    icon: 'search'
  },
  argTypes: {
    placeholder: {
      control: { type: 'text' }
    },
    icon: {
      control: { type: 'select' },
      options: iconOptions
    }
  }
};

export default meta;
type Story = StoryObj<typeof InputText>;

export const Default: Story = {
  render: args => (
    <GalleryContainer width={300}>
      <InputText
        icon={args.icon}
        placeholder={args.placeholder}
        inputStyle={{ outlineStyle: 'none' }}
      />
    </GalleryContainer>
  )
};
