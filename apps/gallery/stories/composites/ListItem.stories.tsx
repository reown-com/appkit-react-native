import type { Meta, StoryObj } from '@storybook/react';

import { ListItem, Text } from '@reown/appkit-ui-react-native';
import { networkImageSrc, iconOptions } from '../../utils/PresetUtils';
import { GalleryContainer } from '../../components/GalleryContainer';

const meta: Meta<typeof ListItem> = {
  component: ListItem,
  argTypes: {
    imageSrc: {
      control: { type: 'text' }
    },
    icon: {
      options: iconOptions,
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
    imageSrc: networkImageSrc,
    icon: 'swapHorizontal',
    disabled: false,
    chevron: true,
    loading: false
  }
};

export default meta;
type Story = StoryObj<typeof ListItem>;

export const Default: Story = {
  render: (args: any) => (
    <GalleryContainer width={300}>
      <ListItem
        imageSrc={args.imageSrc}
        icon={args.icon}
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
