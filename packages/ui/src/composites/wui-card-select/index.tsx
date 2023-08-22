import React from 'react';
import { Animated, Pressable } from 'react-native';
import { Text } from '../../components/wui-text';
import useAnimatedValue from '../../hooks/useAnimatedValue';
import useTheme from '../../hooks/useTheme';
import { CardSelectType } from '../../utils/TypesUtil';
import { NetworkImage } from '../wui-network-image';
import { WalletImage } from '../wui-wallet-image';
import styles, { getBackgroundColor } from './styles';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface CardSelectProps {
  name: string;
  imageSrc?: string;
  disabled?: boolean;
  selected?: boolean;
  type?: CardSelectType;
  onPress?: () => void;
}

export function CardSelect({
  name,
  type = 'wallet',
  imageSrc,
  onPress,
  selected,
  disabled
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
      style={[styles.container, { backgroundColor: animatedValue }]}
    >
      <Image imageSrc={imageSrc} size="md" style={disabled && styles.disabledImage} />
      <Text variant="tiny-500" color={textColor} style={styles.text}>
        {name}
      </Text>
    </AnimatedPressable>
  );
}
