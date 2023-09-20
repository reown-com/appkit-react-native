import { type StyleProp, View, type ViewStyle } from 'react-native';
import { Icon } from '../../components/wui-icon';
import { Image } from '../../components/wui-image';
import useTheme from '../../hooks/useTheme';
import type { IconType, SizeType } from '../../utils/TypesUtil';

import styles from './styles';

export interface WalletImageProps {
  imageSrc?: string;
  size?: Exclude<SizeType, 'xxs'>;
  style?: StyleProp<ViewStyle>;
  walletIcon?: IconType;
}

const IconSize = {
  xs: 10,
  sm: 20,
  md: 25,
  lg: 40
};

export function WalletImage({ imageSrc, size = 'md', style, walletIcon }: WalletImageProps) {
  const Theme = useTheme();

  const templateVisual = () => {
    if (imageSrc) {
      return <Image source={imageSrc} style={styles[`${size}Image`]} />;
    }

    if (walletIcon) {
      return (
        <View style={[styles.container, styles[`${size}Image`]]}>
          <Icon height={IconSize[size]} width={IconSize[size]} name={walletIcon} color="blue-100" />
        </View>
      );
    }

    return (
      <View style={[styles.container, styles[`${size}Image`]]}>
        <Icon height={IconSize[size]} width={IconSize[size]} name="walletPlaceholder" />
      </View>
    );
  };

  return (
    <View style={style}>
      {templateVisual()}
      <View
        style={[
          styles.border,
          styles[`${size}Image`],
          { borderColor: Theme['overlay-010'] },
          !imageSrc && { backgroundColor: Theme['overlay-002'] },
          walletIcon && { backgroundColor: `${Theme['blue-100']}1E` }
        ]}
      />
    </View>
  );
}
