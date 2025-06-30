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
  logoWidth?: number;
  logoHeight?: number;
  logoStyle?: StyleProp<ViewStyle>;
}

export function ListSocial({
  logo,
  children,
  disabled,
  onPress,
  style,
  testID,
  logoHeight = 40,
  logoWidth = 40,
  logoStyle
}: ListSocialProps) {
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
      <View
        style={[
          styles.border,
          { height: logoHeight + 1, width: logoWidth + 1, borderColor: Theme['gray-glass-005'] },
          logoStyle
        ]}
      >
        <Logo
          logo={logo}
          style={[disabled && styles.disabledLogo]}
          width={logoWidth}
          height={logoHeight}
        />
      </View>
      {children}
      <View style={styles.rightPlaceholder} />
    </AnimatedPressable>
  );
}
