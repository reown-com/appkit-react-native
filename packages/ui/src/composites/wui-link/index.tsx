import {
  Animated,
  Pressable,
  PressableProps as NativeProps,
  StyleProp,
  ViewStyle
} from 'react-native';
import { Icon } from '../../components/wui-icon';
import { Text } from '../../components/wui-text';
import useAnimatedColor from '../../hooks/useAnimatedColor';
import useTheme from '../../hooks/useTheme';
import { ColorType, IconType, SizeType } from '../../utils/TypesUtil';
import styles from './styles';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type LinkProps = NativeProps & {
  children: string;
  disabled?: boolean;
  iconLeft?: IconType;
  iconRight?: IconType;
  style?: StyleProp<ViewStyle>;
  size?: Exclude<SizeType, 'lg' | 'xs' | 'xxs'>;
};

export function Link({
  children,
  disabled,
  iconLeft,
  iconRight,
  onPress,
  style,
  size = 'sm',
  ...rest
}: LinkProps) {
  const Theme = useTheme();
  const color = (disabled ? 'bg-300' : 'blue-100') as ColorType;
  const { animatedColor, setStartColor, setEndColor } = useAnimatedColor(
    'transparent',
    Theme['overlay-010']
  );

  return (
    <AnimatedPressable
      disabled={disabled}
      onPress={onPress}
      onPressIn={setEndColor}
      onPressOut={setStartColor}
      style={[styles[`${size}Container`], { backgroundColor: animatedColor }, style]}
      {...rest}
    >
      {iconLeft && <Icon color={color} name={iconLeft} size={size} style={styles.padding} />}
      <Text
        variant={size === 'md' ? 'paragraph-600' : 'small-600'}
        color={color}
        style={styles.padding}
      >
        {children}
      </Text>
      {iconRight && <Icon color={color} name={iconRight} size={size} style={styles.padding} />}
    </AnimatedPressable>
  );
}
