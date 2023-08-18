import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';

import { ListWallet } from '@web3modal/ui-react-native';
import { tagOptions, walletImageSrc } from '../../utils/PresetUtils';

const meta: Meta<typeof ListWallet> = {
  component: ListWallet,
  argTypes: {
    name: {
      control: { type: 'text' }
    },
    imageSrc: {
      control: { type: 'text' }
    },
    walletImages: {
      control: { type: 'array' }
    },
    tagVariant: {
      options: [undefined, ...tagOptions],
      control: { type: 'select' }
    },
    tagLabel: {
      control: { type: 'text' }
    },
    disabled: {
      control: { type: 'boolean' }
    }
  },
  args: {
    name: 'Rainbow',
    tagVariant: 'main',
    tagLabel: 'Recent',
    imageSrc: walletImageSrc,
    disabled: false
  }
};

export default meta;
type Story = StoryObj<typeof ListWallet>;

export const Default: Story = {
  render: args => (
    <View style={styles.container}>
      <ListWallet
        name={args.name}
        tagVariant={args.tagVariant}
        tagLabel={args.tagLabel}
        imageSrc={args.imageSrc}
        disabled={args.disabled}
      />
    </View>
  )
};

const styles = StyleSheet.create({
  container: {
    width: 300
  }
});
