import { Animated, Pressable } from 'react-native';
import useAnimatedColor from '../../hooks/useAnimatedColor';
import useTheme from '../../hooks/useTheme';
import { LogoType } from '../../utils/TypesUtil';
import { Logo } from '../wui-logo';
import styles from './styles';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface LogoSelectProps {
  logo: LogoType;
  disabled?: boolean;
}

export function LogoSelect({ logo, disabled }: LogoSelectProps) {
  const Theme = useTheme();
  const { animatedColor, setStartColor, setEndColor } = useAnimatedColor(
    Theme['overlay-005'],
    Theme['overlay-010']
  );

  return (
    <AnimatedPressable
      onPressIn={setEndColor}
      onPressOut={setStartColor}
      style={[styles.box, { backgroundColor: animatedColor }]}
      disabled={disabled}
    >
      <Logo logo={logo} style={disabled && styles.disabled} />
    </AnimatedPressable>
  );
}
