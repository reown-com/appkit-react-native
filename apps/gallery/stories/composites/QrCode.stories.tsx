import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { QrCode } from '@web3modal/ui-react-native';

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
    imageSrc:
      'https://explorer-api.walletconnect.com/w3m/v1/getWalletImage/7a33d7f1-3d12-4b5c-f3ee-5cd83cb1b500?projectId=c1781fc385454899a2b1385a2b83df3b',
    size: 300,
    uri: 'wc:139520827546986d057472f8bbd7ef0484409458034b61cca59d908563773c7a@2?relay-protocol=irn&symKey=43b5fad11bf07bc8a0aa12231435a4ad3e72e2d1fa257cf191a90ec5b62cb0a'
  }
};

export default meta;
type Story = StoryObj<typeof QrCode>;

export const Default: Story = {
  render: args => <QrCode imageSrc={args.imageSrc} size={args.size} uri={args.uri} />
};
