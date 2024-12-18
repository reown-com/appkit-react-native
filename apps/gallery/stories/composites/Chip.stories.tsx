import type { Meta, StoryObj } from '@storybook/react';

import { Chip } from '@reown/appkit-ui-react-native';
import { chipOptions, externalLabel, iconOptions, walletImageSrc } from '../../utils/PresetUtils';

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
    label: {
      control: { type: 'text' }
    },
    imageSrc: {
      control: { type: 'text' }
    },
    rightIcon: {
      options: iconOptions,
      control: { type: 'select' }
    }
  },
  args: {
    variant: 'fill',
    size: 'md',
    disabled: false,
    rightIcon: 'disconnect',
    label: externalLabel,
    imageSrc: walletImageSrc
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
      onPress={() => {}}
      label={args.label}
      imageSrc={args.imageSrc}
      rightIcon={args.rightIcon}
    />
  )
};
