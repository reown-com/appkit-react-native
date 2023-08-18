import { StyleProp, View, ViewStyle } from 'react-native';
import { Icon } from '../../components/wui-icon';
import { Image } from '../../components/wui-image';
import useTheme from '../../hooks/useTheme';
import { SizeType } from '../../utils/TypesUtil';

import styles from './styles';

export interface WalletImageProps {
  imageSrc?: string;
  size?: Exclude<SizeType, 'xs' | 'xxs'>;
  style?: StyleProp<ViewStyle>;
}

const IconSize = {
  sm: 20,
  md: 25,
  lg: 40
};

export function WalletImage({ imageSrc, size = 'md', style }: WalletImageProps) {
  const Theme = useTheme();

  return (
    <View style={style}>
      {imageSrc ? (
        <Image source={imageSrc} style={styles[`${size}Image`]} />
      ) : (
        <View style={[styles.container, styles[`${size}Image`]]}>
          <Icon height={IconSize[size]} width={IconSize[size]} name="walletPlaceholder" />
        </View>
      )}
      <View
        style={[
          styles.border,
          styles[`${size}Image`],
          { borderColor: Theme['overlay-010'] },
          !imageSrc && { backgroundColor: Theme['overlay-002'] }
        ]}
      />
    </View>
  );
}
