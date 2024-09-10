import type { Meta, StoryObj } from '@storybook/react';

import { ActionEntry, Text } from '@reown/ui-react-native';
import { GalleryContainer } from '../../components/GalleryContainer';

const meta: Meta<typeof ActionEntry> = {
  component: ActionEntry,
  argTypes: {
    disabled: {
      control: { type: 'boolean' }
    }
  },
  args: {
    disabled: false
  }
};

export default meta;
type Story = StoryObj<typeof ActionEntry>;

export const Default: Story = {
  render: args => (
    <GalleryContainer width={300}>
      <ActionEntry disabled={args.disabled} onPress={() => {}}>
        <Text>Action</Text>
      </ActionEntry>
    </GalleryContainer>
  )
};
