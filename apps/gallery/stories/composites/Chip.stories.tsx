import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Chip } from '@web3modal/ui-react-native';
import { chipOptions, iconOptions } from '../../utils/PresetUtils';

const meta: Meta<typeof Chip> = {
  component: Chip,
  argTypes: {
    size: {
      options: ['sm', 'md'],
      control: { type: 'select' }
    },
    variant: {
      options: chipOptions,
      control: { type: 'select' }
    },
    disabled: {
      control: { type: 'boolean' }
    },
    link: {
      control: { type: 'text' }
    },
    label: {
      control: { type: 'text' }
    },
    imageSrc: {
      control: { type: 'text' }
    },
    icon: {
      options: iconOptions,
      control: { type: 'select' }
    }
  },
  args: {
    variant: 'fill',
    size: 'md',
    disabled: false,
    icon: 'disconnect',
    link: 'https://www.fireblocks.com',
    label: 'www.fireblocks.com',
    imageSrc:
      'https://explorer-api.walletconnect.com/w3m/v1/getWalletImage/7e1514ba-932d-415d-1bdb-bccb6c2cbc00?projectId=c1781fc385454899a2b1385a2b83df3b'
  }
};

export default meta;
type Story = StoryObj<typeof Chip>;

export const Default: Story = {
  render: args => (
    <Chip
      variant={args.variant}
      size={args.size}
      disabled={args.disabled}
      link={args.link}
      label={args.label}
      imageSrc={args.imageSrc}
      icon={args.icon}
    />
  )
};
