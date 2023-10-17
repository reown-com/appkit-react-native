import { Animated, Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { Text } from '../../components/wui-text';
import useAnimatedValue from '../../hooks/useAnimatedValue';
import { useTheme } from '../../hooks/useTheme';
import type { CardSelectType } from '../../utils/TypesUtil';
import { NetworkImage } from '../wui-network-image';
import { WalletImage } from '../wui-wallet-image';
import styles, { getBackgroundColor, ITEM_HEIGHT } from './styles';
import { memo } from 'react';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const CardSelectHeight = ITEM_HEIGHT;

export interface CardSelectProps {
  name: string;
  imageSrc?: string;
  imageHeaders?: Record<string, string>;
  disabled?: boolean;
  selected?: boolean;
  type?: CardSelectType;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

function _CardSelect({
  name,
  type = 'wallet',
  imageSrc,
  imageHeaders,
  onPress,
  selected,
  disabled,
  style
}: CardSelectProps) {
  const Theme = useTheme();
  const normalbackgroundColor = getBackgroundColor({ selected, disabled, pressed: false });
  const pressedBackgroundColor = getBackgroundColor({ selected, disabled, pressed: true });

  const { animatedValue, setStartValue, setEndValue } = useAnimatedValue(
    Theme[normalbackgroundColor],
    Theme[pressedBackgroundColor]
  );

  const textColor = disabled ? 'fg-300' : selected ? 'blue-100' : 'fg-100';

  const Image = type === 'wallet' ? WalletImage : NetworkImage;

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={setEndValue}
      onPressOut={setStartValue}
      disabled={disabled}
      style={[styles.container, { backgroundColor: animatedValue }, style]}
    >
      <Image
        imageSrc={imageSrc}
        imageHeaders={imageHeaders}
        size="md"
        style={disabled && styles.disabledImage}
        selected={selected}
        disabled={disabled}
      />
      <Text variant="tiny-500" color={textColor} style={styles.text} numberOfLines={1}>
        {name}
      </Text>
    </AnimatedPressable>
  );
}

export const CardSelect = memo(_CardSelect);
