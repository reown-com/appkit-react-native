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
import { FlexView } from '../../layout/wui-flex';

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
  const _color = (disabled ? 'bg-300' : color ?? 'accent-100') as ColorType;
  const iconSize = size === 'md' ? 'sm' : 'xs';
  const { animatedValue, setStartValue, setEndValue } = useAnimatedValue(
    'transparent',
    Theme['gray-glass-010']
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
      <FlexView flexDirection="row" alignItems="center" justifyContent="center">
        {iconLeft && (
          <Icon color={_color} name={iconLeft} size={iconSize} style={styles.iconLeft} />
        )}
        <Text variant={size === 'md' ? 'paragraph-600' : 'small-600'} color={_color}>
          {children}
        </Text>
        {iconRight && (
          <Icon color={_color} name={iconRight} size={iconSize} style={styles.iconRight} />
        )}
      </FlexView>
    </AnimatedPressable>
  );
}
