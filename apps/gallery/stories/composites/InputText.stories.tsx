/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { InputText } from '@web3modal/ui-react-native';
import { GalleryContainer } from '../../components/GalleryContainer';
import { iconOptions, inputSizeOptions } from '../../utils/PresetUtils';

const meta: Meta<typeof InputText> = {
  component: InputText,
  args: {
    placeholder: 'Search wallet',
    icon: 'search',
    disabled: false,
    size: 'sm'
  },
  argTypes: {
    placeholder: {
      control: { type: 'text' }
    },
    icon: {
      control: { type: 'select' },
      options: iconOptions
    },
    disabled: {
      control: { type: 'boolean' },
      description: "Disable input (doesn't work on web)"
    },
    size: {
      control: { type: 'select' },
      options: inputSizeOptions
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
        size={args.size}
        disabled={args.disabled}
        inputStyle={{ outlineStyle: 'none' }}
      />
    </GalleryContainer>
  )
};
