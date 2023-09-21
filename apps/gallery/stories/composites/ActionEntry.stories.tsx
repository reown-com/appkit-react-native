import type { Meta, StoryObj } from '@storybook/react';

import { ActionEntry } from '@web3modal/ui-react-native';
import { iconOptions } from '../../utils/PresetUtils';
import { GalleryContainer } from '../../components/GalleryContainer';

const meta: Meta<typeof ActionEntry> = {
  component: ActionEntry,
  argTypes: {
    label: {
      control: { type: 'text' }
    },
    iconLeft: {
      options: iconOptions,
      control: { type: 'select' }
    },
    disabled: {
      control: { type: 'boolean' }
    }
  },
  args: {
    label: 'Copy link',
    iconLeft: 'copy',
    disabled: false
  }
};

export default meta;
type Story = StoryObj<typeof ActionEntry>;

export const Default: Story = {
  render: args => (
    <GalleryContainer width={300}>
      <ActionEntry label={args.label} disabled={args.disabled} iconLeft={args.iconLeft} />
    </GalleryContainer>
  )
};
