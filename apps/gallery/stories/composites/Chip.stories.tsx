import type { Meta, StoryObj } from '@storybook/react';

import { Chip } from '@reown/appkit-ui-react-native';
import {
  chipOptions,
  externalLabel,
  externalLink,
  iconOptions,
  walletImagesOptions
} from '../../utils/PresetUtils';

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
    link: externalLink,
    label: externalLabel,
    imageSrc: walletImagesOptions[3]
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
