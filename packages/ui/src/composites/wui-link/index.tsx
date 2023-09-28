import {
  Animated,
  Pressable,
  type PressableProps as NativeProps,
  type StyleProp,
  type ViewStyle
} from 'react-native';
import { Icon } from '../../components/wui-icon';
import { Text } from '../../components/wui-text';
import useAnimatedValue from '../../hooks/useAnimatedValue';
import { useTheme } from '../../hooks/useTheme';
import type { ColorType, IconType, SizeType } from '../../utils/TypesUtil';
import styles from './styles';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type LinkProps = NativeProps & {
  children: string;
  disabled?: boolean;
  iconLeft?: IconType;
  iconRight?: IconType;
  style?: StyleProp<ViewStyle>;
  size?: Exclude<SizeType, 'lg' | 'xs' | 'xxs'>;
  color?: ColorType;
};

export function Link({
  children,
  disabled,
  iconLeft,
  iconRight,
  onPress,
  style,
  size = 'sm',
  color,
  ...rest
}: LinkProps) {
  const Theme = useTheme();
  const _color = (disabled ? 'bg-300' : color ?? 'blue-100') as ColorType;
  const { animatedValue, setStartValue, setEndValue } = useAnimatedValue(
    'transparent',
    Theme['overlay-010']
  );

  return (
    <AnimatedPressable
      disabled={disabled}
      onPress={onPress}
      onPressIn={setEndValue}
      onPressOut={setStartValue}
      style={[styles[`${size}Container`], { backgroundColor: animatedValue }, style]}
      {...rest}
    >
      {iconLeft && <Icon color={_color} name={iconLeft} size={size} style={styles.padding} />}
      <Text
        variant={size === 'md' ? 'paragraph-600' : 'small-600'}
        color={_color}
        style={styles.padding}
      >
        {children}
      </Text>
      {iconRight && <Icon color={_color} name={iconRight} size={size} style={styles.padding} />}
    </AnimatedPressable>
  );
}
