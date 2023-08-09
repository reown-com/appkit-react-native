import { View } from 'react-native';
import { Image } from '../../components/wui-image';
import useTheme from '../../hooks/useTheme';
import { SizeType } from '../../utils/TypesUtil';

import styles from './styles';

export interface WalletImageProps {
  imageSrc?: string;
  size?: Exclude<SizeType, 'xs' | 'xxs'>;
}

export function WalletImage({ imageSrc, size = 'md' }: WalletImageProps) {
  const Theme = useTheme();
  if (imageSrc) {
    return (
      <View>
        <Image source={imageSrc} style={styles[`${size}Image`]} />
        <View
          style={[styles.border, styles[`${size}Image`], { borderColor: Theme['overlay-010'] }]}
        />
      </View>
    );
  }

  return null;
}
