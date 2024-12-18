import type { Meta, StoryObj } from '@storybook/react';

import { ListSocial, Text } from '@reown/appkit-ui-react-native';
import { logoOptions } from '../../utils/PresetUtils';
import { GalleryContainer } from '../../components/GalleryContainer';
import { StyleSheet } from 'react-native';

const meta: Meta<typeof ListSocial> = {
  component: ListSocial,
  argTypes: {
    logo: {
      options: logoOptions,
      control: { type: 'select' }
    },
    disabled: {
      control: { type: 'boolean' }
    }
  },
  args: {
    logo: 'x',
    disabled: false
  }
};

export default meta;
type Story = StoryObj<typeof ListSocial>;

export const Default: Story = {
  render: (args: any) => (
    <GalleryContainer width={300}>
      <ListSocial logo={args.logo} disabled={args.disabled}>
        <Text variant="paragraph-500" color="fg-100" style={styles.text}>
          Continue with{' '}
          <Text variant="paragraph-500" color="fg-100" style={styles.social}>
            {args.logo}
          </Text>
        </Text>
      </ListSocial>
    </GalleryContainer>
  )
};

const styles = StyleSheet.create({
  text: {
    textAlign: 'center'
  },
  social: {
    textTransform: 'capitalize'
  }
});
