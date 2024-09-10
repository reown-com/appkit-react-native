import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { CardSelect } from '@reown/ui-react-native';
import { cardSelectOptions, walletImageSrc } from '../../utils/PresetUtils';

const meta: Meta<typeof CardSelect> = {
  component: CardSelect,
  argTypes: {
    imageSrc: {
      control: { type: 'text' }
    },
    name: {
      control: { type: 'text' }
    },
    type: {
      control: { type: 'select' },
      options: cardSelectOptions
    },
    disabled: {
      control: { type: 'boolean' }
    },
    selected: {
      control: { type: 'boolean' }
    }
  },
  args: {
    imageSrc: walletImageSrc,
    name: 'Rainbow',
    type: 'wallet',
    disabled: false,
    selected: false
  }
};

export default meta;
type Story = StoryObj<typeof CardSelect>;

export const Default: Story = {
  render: args => (
    <CardSelect
      imageSrc={args.imageSrc}
      name={args.name}
      type={args.type}
      disabled={args.disabled}
      selected={args.selected}
    />
  )
};
