import type { Meta, StoryObj } from '@storybook/react';

import { LogoSelect } from '@reown/appkit-ui-react-native';
import { logoOptions } from '../../utils/PresetUtils';

const meta: Meta<typeof LogoSelect> = {
  component: LogoSelect,
  args: {
    logo: 'google',
    disabled: false
  },
  argTypes: {
    logo: {
      options: logoOptions,
      control: { type: 'select' }
    },
    disabled: {
      control: { type: 'boolean' }
    }
  }
};

export default meta;
type Story = StoryObj<typeof LogoSelect>;

export const Default: Story = {
  render: args => <LogoSelect logo={args.logo} disabled={args.disabled} />
};
