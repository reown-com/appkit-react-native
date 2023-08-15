import { Animated, Pressable } from 'react-native';
import { Icon } from '../../components/wui-icon';
import useAnimatedColor from '../../hooks/useAnimatedColor';
import useTheme from '../../hooks/useTheme';
import { ColorType, IconType } from '../../utils/TypesUtil';
import styles from './styles';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface InputElementProps {
  icon: IconType;
  onPress: () => void;
  disabled?: boolean;
}

export function InputElement({ icon, disabled, onPress }: InputElementProps) {
  const Theme = useTheme();
  const { animatedColor, setStartColor, setEndColor } = useAnimatedColor(
    Theme['overlay-020'],
    Theme['overlay-030']
  );

  return (
    <AnimatedPressable
      disabled={disabled}
      onPress={onPress}
      onPressIn={setEndColor}
      onPressOut={setStartColor}
      hitSlop={10}
      style={[
        styles.container,
        { backgroundColor: disabled ? Theme['overlay-010'] : animatedColor }
      ]}
    >
      <Icon name={icon} size="xxs" color={'bg-200' as ColorType} />
    </AnimatedPressable>
  );
}
