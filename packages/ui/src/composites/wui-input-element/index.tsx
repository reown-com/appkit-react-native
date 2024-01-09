import { Animated, Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { Icon } from '../../components/wui-icon';
import useAnimatedValue from '../../hooks/useAnimatedValue';
import { useTheme } from '../../hooks/useTheme';
import type { ColorType, IconType } from '../../utils/TypesUtil';
import styles from './styles';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface InputElementProps {
  icon: IconType;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function InputElement({ icon, disabled, onPress, style }: InputElementProps) {
  const Theme = useTheme();
  const { animatedValue, setStartValue, setEndValue } = useAnimatedValue(
    Theme['gray-glass-020'],
    Theme['gray-glass-030']
  );

  return (
    <AnimatedPressable
      disabled={disabled}
      onPress={onPress}
      onPressIn={setEndValue}
      onPressOut={setStartValue}
      hitSlop={10}
      style={[
        styles.container,
        { backgroundColor: disabled ? Theme['gray-glass-010'] : animatedValue },
        style
      ]}
    >
      <Icon name={icon} size="xxs" color={'bg-200' as ColorType} />
    </AnimatedPressable>
  );
}
