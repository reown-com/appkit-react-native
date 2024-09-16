import type { Meta, StoryObj } from '@storybook/react';

import { ListWallet } from '@reown/appkit-ui-react-native';
import { iconOptions, tagOptions, walletImageSrc } from '../../utils/PresetUtils';
import { GalleryContainer } from '../../components/GalleryContainer';

const meta: Meta<typeof ListWallet> = {
  component: ListWallet,
  argTypes: {
    name: {
      control: { type: 'text' }
    },
    imageSrc: {
      control: { type: 'text' }
    },
    tagVariant: {
      options: [undefined, ...tagOptions],
      control: { type: 'select' }
    },
    tagLabel: {
      control: { type: 'text' }
    },
    icon: {
      options: [undefined, ...iconOptions],
      control: { type: 'select' }
    },
    disabled: {
      control: { type: 'boolean' }
    },
    showAllWallets: {
      control: { type: 'boolean' }
    }
  },
  args: {
    name: 'Rainbow',
    tagVariant: 'main',
    tagLabel: 'Recent',
    imageSrc: walletImageSrc,
    showAllWallets: false,
    disabled: false
  }
};

export default meta;
type Story = StoryObj<typeof ListWallet>;

export const Default: Story = {
  render: (args: any) => (
    <GalleryContainer width={300}>
      <ListWallet
        name={args.name}
        tagVariant={args.tagVariant}
        tagLabel={args.tagLabel}
        imageSrc={args.imageSrc}
        disabled={args.disabled}
        showAllWallets={args.showAllWallets}
        icon={args.icon}
      />
    </GalleryContainer>
  )
};
