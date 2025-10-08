import { type StyleProp, View, type ViewStyle, Animated } from 'react-native';
import { Icon } from '../../components/wui-icon';
import { Image } from '../../components/wui-image';
import { useTheme } from '../../hooks/useTheme';
import type { SizeType } from '../../utils/TypesUtil';

import styles from './styles';

export interface WalletImageProps {
  imageSrc?: string;
  imageHeaders?: Record<string, string>;
  size?: Exclude<SizeType, 'xxs'>;
  style?: StyleProp<ViewStyle>;
  showAllWallets?: boolean;
  border?: boolean;
}

const IconSize = {
  xs: 10,
  sm: 24,
  md: 32,
  lg: 36,
  xl: 40
};

export function WalletImage({
  imageSrc,
  imageHeaders,
  size = 'md',
  style,
  showAllWallets,
  border = true
}: WalletImageProps) {
  const Theme = useTheme();

  const templateVisual = () => {
    if (imageSrc) {
      return <Image source={imageSrc} headers={imageHeaders} style={styles[`${size}Image`]} />;
    }

    if (showAllWallets) {
      return (
        <View style={[styles.container, styles[`${size}Image`]]}>
          <Icon
            height={IconSize[size]}
            width={IconSize[size]}
            name="allWallets"
            color="accent-100"
          />
        </View>
      );
    }

    return (
      <View style={[styles.container, styles[`${size}Image`]]}>
        <Icon
          height={IconSize[size]}
          width={IconSize[size]}
          name="walletPlaceholder"
          color="fg-200"
        />
      </View>
    );
  };

  return (
    <Animated.View style={style}>
      {templateVisual()}
      {border ? (
        <View
          style={[
            styles.border,
            styles[`${size}Image`],
            { borderColor: Theme['gray-glass-010'] },
            !imageSrc && { backgroundColor: Theme['gray-glass-002'] },
            showAllWallets && {
              backgroundColor: `${Theme['accent-100']}1E`,
              borderColor: Theme['accent-glass-010']
            }
          ]}
        />
      ) : null}
    </Animated.View>
  );
}
