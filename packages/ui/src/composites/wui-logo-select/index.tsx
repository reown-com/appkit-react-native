import { Animated, Pressable, type StyleProp, type ViewStyle } from 'react-native';
import useAnimatedValue from '../../hooks/useAnimatedValue';
import { useTheme } from '../../hooks/useTheme';
import type { LogoType } from '../../utils/TypesUtil';
import { Logo } from '../wui-logo';
import styles from './styles';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface LogoSelectProps {
  logo: LogoType;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

export function LogoSelect({ logo, disabled, style, onPress }: LogoSelectProps) {
  const Theme = useTheme();
  const { animatedValue, setStartValue, setEndValue } = useAnimatedValue(
    Theme['gray-glass-002'],
    Theme['gray-glass-010']
  );

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={setEndValue}
      onPressOut={setStartValue}
      style={[styles.box, { backgroundColor: animatedValue }, style]}
      disabled={disabled}
    >
      <Logo logo={logo} style={disabled && styles.disabled} />
    </AnimatedPressable>
  );
}
