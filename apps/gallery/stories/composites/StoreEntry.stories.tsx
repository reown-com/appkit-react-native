import type { Meta, StoryObj } from '@storybook/react';

import { StoreEntry } from '@web3modal/ui-react-native';
import { walletImageSrc } from '../../utils/PresetUtils';
import { GalleryContainer } from '../../components/GalleryContainer';

const meta: Meta<typeof StoreEntry> = {
  component: StoreEntry,
  argTypes: {
    label: {
      control: { type: 'text' }
    },
    imageSrc: {
      control: { type: 'text' }
    },
    disabled: {
      control: { type: 'boolean' }
    }
  },
  args: {
    label: 'Rainbow',
    imageSrc: walletImageSrc,
    disabled: false
  }
};

export default meta;
type Story = StoryObj<typeof StoreEntry>;

export const Default: Story = {
  render: args => (
    <GalleryContainer width={300}>
      <StoreEntry label={args.label} disabled={args.disabled} imageSrc={args.imageSrc} />
    </GalleryContainer>
  )
};
