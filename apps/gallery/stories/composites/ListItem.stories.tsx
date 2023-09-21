import type { Meta, StoryObj } from '@storybook/react';

import { ListItem, Text } from '@web3modal/ui-react-native';
import { networkImageSrc, iconOptions } from '../../utils/PresetUtils';
import { GalleryContainer } from '../../components/GalleryContainer';

const meta: Meta<typeof ListItem> = {
  component: ListItem,
  argTypes: {
    imageSrc: {
      control: { type: 'text' }
    },
    variant: {
      options: ['image', 'icon'],
      control: { type: 'select' }
    },
    icon: {
      options: iconOptions,
      control: { type: 'select' }
    },
    iconVariant: {
      options: ['blue', 'overlay'],
      control: { type: 'select' }
    },
    disabled: {
      control: { type: 'boolean' }
    },
    chevron: {
      control: { type: 'boolean' }
    },
    loading: {
      control: { type: 'boolean' }
    }
  },
  args: {
    variant: 'image',
    imageSrc: networkImageSrc,
    icon: 'swapHorizontal',
    iconVariant: 'blue',
    disabled: false,
    chevron: true,
    loading: false
  }
};

export default meta;
type Story = StoryObj<typeof ListItem>;

export const Default: Story = {
  render: args => (
    <GalleryContainer width={300}>
      <ListItem
        variant={args.variant}
        imageSrc={args.imageSrc}
        icon={args.icon}
        iconVariant={args.iconVariant}
        disabled={args.disabled}
        chevron={args.chevron}
        loading={args.loading}
      >
        <Text variant="paragraph-500" color="fg-100">
          0.527 ETH
        </Text>
        <Text variant="paragraph-500" color="fg-200">
          607.38 USD
        </Text>
      </ListItem>
    </GalleryContainer>
  )
};
