import { Animated, Pressable, type StyleProp, type ViewStyle } from 'react-native';

import useAnimatedValue from '../../hooks/useAnimatedValue';
import { useTheme } from '../../hooks/useTheme';

import styles from './styles';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface ActionEntryProps {
  onPress?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function ActionEntry({ children, onPress, disabled, style }: ActionEntryProps) {
  const Theme = useTheme();
  const { animatedValue, setStartValue, setEndValue } = useAnimatedValue(
    Theme['gray-glass-002'],
    Theme['gray-glass-010']
  );
  const isPressable = !!onPress;

  return (
    <AnimatedPressable
      style={[
        styles.container,
        { backgroundColor: disabled ? Theme['gray-glass-010'] : animatedValue },
        style
      ]}
      disabled={disabled}
      onPress={onPress}
      onPressIn={isPressable ? setEndValue : undefined}
      onPressOut={isPressable ? setStartValue : undefined}
    >
      {children}
    </AnimatedPressable>
  );
}
