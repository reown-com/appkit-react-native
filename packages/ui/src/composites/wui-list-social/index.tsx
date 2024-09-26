import { View, Pressable, Animated, type StyleProp, type ViewStyle } from 'react-native';
import useAnimatedValue from '../../hooks/useAnimatedValue';
import { useTheme } from '../../hooks/useTheme';
import type { LogoType } from '../../utils/TypesUtil';

import styles from './styles';
import { Logo } from '../wui-logo';
import type { ReactNode } from 'react';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface ListSocialProps {
  children?: ReactNode;
  disabled?: boolean;
  logo: LogoType;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function ListSocial({ logo, children, disabled, onPress, style, testID }: ListSocialProps) {
  const Theme = useTheme();
  const { animatedValue, setStartValue, setEndValue } = useAnimatedValue(
    Theme['gray-glass-002'],
    Theme['gray-glass-010']
  );

  return (
    <AnimatedPressable
      disabled={disabled}
      style={[styles.container, { backgroundColor: animatedValue }, style]}
      onPress={onPress}
      onPressIn={setEndValue}
      onPressOut={setStartValue}
      testID={testID}
    >
      <Logo logo={logo} style={disabled && styles.disabledLogo} />
      {children}
      <View style={styles.rightPlaceholder} />
    </AnimatedPressable>
  );
}
