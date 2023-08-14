import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';

import { Card } from '@web3modal/ui-react-native';

const meta: Meta<typeof Card> = {
  component: Card
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card>
      <View style={styles.box} />
    </Card>
  )
};

const styles = StyleSheet.create({
  box: {
    backgroundColor: '#47a1ff',
    height: 40,
    width: 40
  }
});
