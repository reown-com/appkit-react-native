import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { QrCode } from '@reown/ui-react-native';
import { walletImageSrc, wcUri } from '../../utils/PresetUtils';

const meta: Meta<typeof QrCode> = {
  component: QrCode,
  argTypes: {
    imageSrc: {
      control: { type: 'text' }
    },
    uri: {
      control: { type: 'text' }
    },
    size: {
      control: { type: 'number' }
    }
  },
  args: {
    imageSrc: walletImageSrc,
    size: 300,
    uri: wcUri
  }
};

export default meta;
type Story = StoryObj<typeof QrCode>;

export const Default: Story = {
  render: args => <QrCode imageSrc={args.imageSrc} size={args.size} uri={args.uri} />
};
