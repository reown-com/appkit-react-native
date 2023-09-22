import { Animated, Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { Icon } from '../../components/wui-icon';
import useAnimatedValue from '../../hooks/useAnimatedValue';
import { useTheme } from '../../hooks/useTheme';
import type { ColorType, IconType, SizeType } from '../../utils/TypesUtil';
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
}

export function IconLink({
  icon,
  onPress,
  size = 'md',
  iconColor = 'fg-100',
  background,
  disabled,
  style
}: IconLinkProps) {
  const Theme = useTheme();
  const bgColor = background ? `${Theme[iconColor]}1E` : 'transparent';
  const { animatedValue, setStartValue, setEndValue } = useAnimatedValue(
    bgColor,
    Theme['overlay-010']
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
      <Icon name={icon} size={size} color={disabled ? ('overlay-020' as ColorType) : iconColor} />
    </AnimatedPressable>
  );
}
