import { Animated, Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { Icon } from '../../components/wui-icon';
import useAnimatedValue from '../../hooks/useAnimatedValue';
import { useTheme } from '../../hooks/useTheme';
import type { ColorType, IconType, SizeType, ThemeKeys } from '../../utils/TypesUtil';
import styles from './styles';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface IconLinkProps {
  icon: IconType;
  onPress?: () => void;
  size?: Exclude<SizeType, 'xs' | 'xxs'>;
  iconColor?: ColorType;
  disabled?: boolean;
  background?: boolean;
  style?: StyleProp<ViewStyle>;
  backgroundColor?: ThemeKeys;
  pressedColor?: ThemeKeys;
}

export function IconLink({
  icon,
  onPress,
  size = 'md',
  iconColor = 'fg-100',
  backgroundColor,
  pressedColor = 'gray-glass-010',
  disabled,
  style
}: IconLinkProps) {
  const Theme = useTheme();
  const bgColor = backgroundColor ? Theme[backgroundColor] : 'transparent';
  const { animatedValue, setStartValue, setEndValue } = useAnimatedValue(
    bgColor,
    Theme[pressedColor]
  );

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={setEndValue}
      onPressOut={setStartValue}
      disabled={disabled}
      style={[
        styles.container,
        styles[`container-${size}`],
        { backgroundColor: animatedValue },
        style
      ]}
    >
      <Icon
        name={icon}
        size={size}
        color={disabled ? ('gray-glass-020' as ColorType) : iconColor}
      />
    </AnimatedPressable>
  );
}
